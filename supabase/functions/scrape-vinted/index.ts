import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VINTED_ITEM_URL_RE = /^https?:\/\/(www\.)?vinted\.(co\.uk|fr|de|nl|be|es|it|pl|com)\/items\/\d+/;

function extractItemId(url: string): string | null {
  const match = url.match(/items\/(\d+)/);
  return match ? match[1] : null;
}

function extractSlug(url: string): string {
  const match = url.match(/items\/\d+-(.+?)(?:\?|$)/);
  return match ? match[1].replace(/-/g, " ") : "";
}

function extractVintedDomain(url: string): string {
  const match = url.match(/vinted\.(co\.uk|fr|de|nl|be|es|it|pl|com)/);
  return match ? `www.vinted.${match[1]}` : "www.vinted.co.uk";
}

function mapCondition(raw: string | number | null | undefined): string | null {
  if (raw == null) return null;
  const s = String(raw).toLowerCase().trim();
  if (s === "1") return "New with tags";
  if (s === "2") return "New without tags";
  if (s === "3") return "Very Good";
  if (s === "4") return "Good";
  if (s === "5") return "Satisfactory";
  if (s === "new_with_tags" || s.includes("new with tags")) return "New with tags";
  if (s.includes("new without") || (s.includes("new") && !s.includes("tag"))) return "New without tags";
  if (s.includes("very good")) return "Very Good";
  if (s.includes("good") && !s.includes("very")) return "Good";
  if (s.includes("satisf")) return "Satisfactory";
  return raw ? String(raw) : null;
}

function mapCategory(raw: string): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const map: Record<string, string> = {
    "t-shirt": "T-shirts", "top": "Tops", "shirt": "Shirts", "hoodie": "Hoodies",
    "jumper": "Jumpers", "sweater": "Jumpers", "jacket": "Jackets", "coat": "Coats",
    "jean": "Jeans", "trouser": "Trousers", "short": "Shorts", "skirt": "Skirts",
    "dress": "Dresses", "shoe": "Shoes", "trainer": "Trainers", "sneaker": "Trainers",
    "boot": "Boots", "bag": "Bags", "accessor": "Accessories",
    "sweatshirt": "Hoodies", "cardigan": "Jumpers", "blazer": "Jackets",
  };
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return raw || null;
}

// Tier 1: Vinted public API
async function fetchViaVintedApi(url: string, itemId: string): Promise<Record<string, unknown> | null> {
  const domain = extractVintedDomain(url);
  try {
    const res = await fetch(`https://${domain}/api/v2/items/${itemId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept": "application/json",
        "Accept-Language": "en-GB,en;q=0.9",
        "Referer": `https://${domain}/`,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const item = json?.item;
    if (!item) return null;

    const photos: string[] = [];
    if (Array.isArray(item.photos)) {
      for (const p of item.photos) {
        const photoUrl = p?.full_size_url || p?.url || (typeof p === "string" ? p : null);
        if (photoUrl) photos.push(photoUrl);
      }
    }

    return {
      title: item.title || null,
      brand: item.brand?.title ?? item.brand_title ?? null,
      category: mapCategory(item.catalog?.title ?? item.category?.title ?? ""),
      size: item.size_title ?? item.size ?? null,
      condition: mapCondition(item.status ?? item.status_id ?? item.condition),
      description: item.description || null,
      price: item.price_numeric != null ? parseFloat(String(item.price_numeric)) : null,
      photos,
    };
  } catch (e) {
    console.error("[Tier 1] Exception:", e);
    return null;
  }
}

// Tier 2: Firecrawl + AI
async function fetchViaFirecrawlAI(url: string, itemId: string, slug: string): Promise<Record<string, unknown> | null> {
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!firecrawlKey || !lovableKey) return null;

  try {
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown", "html"], onlyMainContent: false, waitFor: 6000 }),
    });
    if (!scrapeRes.ok) return null;

    const scrapeData = await scrapeRes.json();
    const markdown = scrapeData?.data?.markdown ?? "";
    const metadata = scrapeData?.data?.metadata ?? {};
    if (!markdown || markdown.length < 50) return null;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Extract product listing details from Vinted page. Return ONLY valid JSON — no markdown.
CRITICAL: Extract ONLY the primary listing for item ID ${itemId} (slug: "${slug}"). Ignore recommended/similar items.`,
          },
          {
            role: "user",
            content: `Page URL: ${url}\nPage title: ${metadata.title || ""}\n\nContent (first 8000 chars):\n${markdown.substring(0, 8000)}\n\nReturn:\n{"title":string,"brand":string|null,"category":string|null,"size":string|null,"condition":string|null,"description":string|null,"price":number|null,"photos":[string]}`,
          },
        ],
      }),
    });

    if (!aiRes.ok) return null;
    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content ?? "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(content);
    if (parsed.category) parsed.category = mapCategory(parsed.category) ?? parsed.category;
    return parsed;
  } catch (e) {
    console.error("[Tier 2] Exception:", e);
    return null;
  }
}

function isComplete(r: Record<string, unknown> | null): boolean {
  return !!(r?.title && r?.price != null && r?.condition);
}

function mergeResults(base: Record<string, unknown> | null, supplement: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!supplement) return base;
  if (!base) return supplement;
  const merged = { ...base };
  for (const key of ["title", "brand", "category", "size", "condition", "description", "price"]) {
    if ((merged[key] == null || merged[key] === "") && supplement[key] != null) {
      merged[key] = supplement[key];
    }
  }
  if ((!merged.photos || (merged.photos as string[]).length === 0) && (supplement.photos as string[])?.length > 0) {
    merged.photos = supplement.photos;
  }
  return merged;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Optional auth for logging
  let _userId: string | null = null;
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
      if (data?.claims?.sub) _userId = data.claims.sub;
    }
  } catch (_) { /* non-fatal */ }

  try {
    const { url } = await req.json();

    if (!url || !VINTED_ITEM_URL_RE.test(url)) {
      return new Response(
        JSON.stringify({ error: "Please paste a Vinted item URL (e.g. vinted.co.uk/items/12345678-item-name)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const itemId = extractItemId(url);
    const slug = extractSlug(url);

    // Tier 1: Vinted API
    let result: Record<string, unknown> | null = null;
    if (itemId) result = await fetchViaVintedApi(url, itemId);
    if (isComplete(result)) {
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Tier 2: Firecrawl + AI
    const tier2 = await fetchViaFirecrawlAI(url, itemId ?? "", slug);
    result = mergeResults(result, tier2);

    if (!result) {
      result = { title: null, brand: null, category: null, size: null, condition: null, description: null, price: null, photos: [] };
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("scrape-vinted error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
