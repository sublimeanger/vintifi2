import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function buildSearchTerm(brand: string, category: string, title: string): string {
  if (title) return title.replace(/\b(XS|S|M|L|XL|XXL|\d+\s?cm)\b/gi, "").trim().substring(0, 60);
  if (brand && category) return `${brand} ${category}`;
  return brand || category || "clothing item";
}

function buildVintedUrl(brand: string, category: string, title: string, condition: string): string {
  const searchText = buildSearchTerm(brand, category, title);
  const conditionMap: Record<string, string> = {
    new_with_tags: "6", new_without_tags: "1", very_good: "2", good: "3", satisfactory: "4",
  };
  const conditionId = conditionMap[condition.toLowerCase().replace(/[\s-]/g, "_")];
  const params = new URLSearchParams({ search_text: searchText, order: "relevance" });
  if (conditionId) params.set("catalog[]", conditionId);
  return `https://www.vinted.co.uk/catalog?${params.toString()}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { brand, category, condition, size, listingId, title, sell_wizard } = body;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const userId = userData.user?.id;
    if (!userId) throw new Error("Invalid user");

    // First-item-free pass check
    let useFirstItemPass = false;
    if (sell_wizard) {
      const { data: profileData } = await supabase
        .from("profiles").select("first_item_pass_used").eq("id", userId).single();
      if (profileData && !profileData.first_item_pass_used) useFirstItemPass = true;
    }

    if (!useFirstItemPass) {
      const result = await supabase.rpc("deduct_credits", {
        p_user_id: userId, p_amount: 1, p_operation: "price_check", p_description: "Price check",
      });
      if (!result.data?.success) {
        return new Response(
          JSON.stringify({ error: result.data?.error ?? "Insufficient credits" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI not configured");

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");

    let vintedPrices: number[] = [];
    let vintedListings = "";
    let marketData = "";
    const searchUrl = buildVintedUrl(brand || "", category || "", title || "", condition || "");
    const searchTerm = buildSearchTerm(brand || "", category || "", title || "");

    // Scrape Vinted prices (if Firecrawl configured)
    if (firecrawlKey) {
      try {
        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: searchUrl, formats: ["markdown"], onlyMainContent: true, waitFor: 3000 }),
        });
        const scrapeData = await scrapeRes.json();
        const markdown: string = scrapeData.data?.markdown || "";
        const priceMatches = markdown.match(/£(\d+(?:\.\d{2})?)/g) || [];
        vintedPrices = priceMatches.map(p => parseFloat(p.replace("£", ""))).filter(p => p > 0.5 && p < 500);
        vintedListings = markdown.substring(0, 3000);
      } catch (e) { console.error("Firecrawl error:", e); }
    }

    // Perplexity context (if configured)
    if (perplexityKey) {
      try {
        const sizeNote = size ? `, size ${size}` : "";
        const perplexRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${perplexityKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: "UK secondhand clothing market analyst. Focus on UK resale prices across eBay, Depop, Vinted. Vinted prices are typically 50-70% lower than eBay." },
              { role: "user", content: `What price range do "${searchTerm}"${sizeNote} sell for secondhand in the UK? Vinted vs eBay vs Depop?` },
            ],
            search_recency_filter: "month",
          }),
        });
        const perplexData = await perplexRes.json();
        marketData = perplexData.choices?.[0]?.message?.content || "";
      } catch (e) { console.error("Perplexity error:", e); }
    }

    const vintedMedian = median(vintedPrices);
    const vintedMin = vintedPrices.length > 0 ? Math.min(...vintedPrices) : 0;
    const vintedMax = vintedPrices.length > 0 ? Math.max(...vintedPrices) : 0;
    const maxConfidence = vintedPrices.length >= 5 ? 95 : vintedPrices.length >= 3 ? 80 : 60;

    let source1Text: string;
    if (vintedPrices.length >= 3) {
      source1Text = `SOURCE 1 — VINTED UK LIVE PRICES:
Scraped from: ${searchUrl}
Prices: ${vintedPrices.slice(0, 20).map(p => `£${p}`).join(", ")}
Median: £${vintedMedian.toFixed(2)}, Range: £${vintedMin}–£${vintedMax}, N=${vintedPrices.length}
${vintedListings}
CRITICAL: recommended_price MUST be within ±30% of median £${vintedMedian.toFixed(2)}.`;
    } else {
      source1Text = `SOURCE 1 — LIMITED VINTED DATA (${vintedPrices.length} prices found). Use SOURCE 2 but discount eBay by 55% to estimate Vinted price.`;
    }

    const aiPrompt = `You are a Vinted UK pricing analyst. Price this item accurately for Vinted UK.
ITEM: Brand: ${brand || "Unknown"}, Category: ${category || "Unknown"}, Size: ${size || "Unknown"}, Condition: ${condition || "Unknown"}, Title: ${title || "Unknown"}

${source1Text}

SOURCE 2 — BROADER MARKET (lower weight):
${marketData || "No data available."}

RULES:
1. SOURCE 1 is ground truth. Base recommended_price on Vinted live data.
2. Vinted prices are 50-70% LOWER than eBay.
3. confidence_score max: ${maxConfidence}

Return raw JSON only:
{
  "recommended_price": <number>,
  "confidence_score": <integer 0-${maxConfidence}>,
  "price_range_low": <number>,
  "price_range_high": <number>,
  "price_range_median": <number>,
  "item_title": "<descriptive title>",
  "item_brand": "<brand>",
  "estimated_days_to_sell": <number>,
  "demand_level": "<high|medium|low>",
  "ai_insights": "<3 paragraphs separated by \\n\\n>",
  "comparable_items": [{"title": "<title>", "price": <number>, "condition": "<condition>"}],
  "price_distribution": [{"range": "£0-5", "count": <number>}, {"range": "£5-10", "count": <number>}, {"range": "£10-15", "count": <number>}, {"range": "£15-20", "count": <number>}, {"range": "£20-30", "count": <number>}, {"range": "£30+", "count": <number>}]
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Vinted UK pricing analyst. Return valid JSON only." },
          { role: "user", content: aiPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) throw new Error("AI rate limit reached.");
      throw new Error("AI analysis failed");
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let report: Record<string, unknown>;
    try { report = JSON.parse(content); }
    catch { throw new Error("AI returned invalid response"); }

    if ((report.confidence_score as number) > maxConfidence) report.confidence_score = maxConfidence;

    // Save to price_checks table
    await supabase.from("price_checks").insert({
      user_id: userId,
      listing_id: listingId || null,
      item_title: report.item_title as string,
      item_brand: brand,
      item_category: category,
      item_condition: condition,
      suggested_price: report.recommended_price as number,
      price_range_low: report.price_range_low as number,
      price_range_median: report.price_range_median as number,
      price_range_high: report.price_range_high as number,
      confidence_score: report.confidence_score as number,
      comparable_items: report.comparable_items as object,
      ai_insights: report.ai_insights as string,
      price_distribution: report.price_distribution as object,
      search_query: searchTerm.substring(0, 500),
    });

    if (useFirstItemPass) {
      await supabase.from("profiles").update({ first_item_pass_used: true }).eq("id", userId);
    }

    return new Response(JSON.stringify({ ...report, success: true, creditsUsed: useFirstItemPass ? 0 : 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("price-check error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
