import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { photoUrls, brand, category, size, condition, colour, currentTitle, currentDescription, seller_notes, sell_wizard } = body;

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const userId = userData.user?.id;
    if (!userId) throw new Error("Invalid user");

    // Check first-item-free pass
    let useFirstItemPass = false;
    if (sell_wizard) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_item_pass_used, credits_balance")
        .eq("id", userId)
        .single();
      if (profileData && !profileData.first_item_pass_used) {
        useFirstItemPass = true;
      }
    }

    // Deduct credit (1 credit) unless on free pass
    if (!useFirstItemPass) {
      const result = await supabase.rpc("deduct_credits", {
        p_user_id: userId,
        p_amount: 1,
        p_operation: "optimize_listing",
        p_description: "Listing optimisation",
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

    const finalPhotoUrls = photoUrls || [];

    const userContent: { type: string; text?: string; image_url?: { url: string } }[] = [];

    userContent.push({
      type: "text",
      text: `You are a real Vinted seller who has completed 2,000+ transactions. Write like a genuine person.

Item details:
- Brand: ${brand || "Not specified"}
- Category: ${category || "Not specified"}
- Size: ${size || "Not specified"}
- Condition: ${condition || "Not specified"}
- Colour: ${colour && colour.trim() ? colour.trim() : "NOT PROVIDED — DO NOT INCLUDE COLOUR"}
- Current title: ${currentTitle || "None"}
- Current description: ${currentDescription || "None"}
- Number of photos: ${finalPhotoUrls.length}

COLOUR RULE:
${colour && colour.trim()
  ? `Colour is: ${colour.trim()}. Use this exactly.`
  : `Colour NOT provided. Do NOT mention any colour anywhere.`}

TITLE FORMULA (max 80 chars):
${colour && colour.trim()
  ? "[Brand] [Item Type] [Colour] [Size] [Condition Signal]"
  : "[Brand] [Item Type] [Size] [Condition Signal]"}

Condition signals: new_with_tags→BNWT, new_without_tags→Brand New, very_good→Excellent Condition, good→Good Condition, satisfactory→Good Used

DESCRIPTION: Write 120-200 words, casual British English, conversational. NO markdown. No bullets. Plain text paragraphs only. 3-5 hashtags at end.

BANNED WORDS: elevate, sophisticated, timeless, versatile, effortless, staple, wardrobe essential, stunning, gorgeous, boasts, game-changer, trendy, chic, exquisite, premium quality.

${seller_notes ? `SELLER NOTES (disclose honestly): "${seller_notes}"` : ""}

Return raw JSON only:
{
  "optimised_title": "<max 80 chars>",
  "optimised_description": "<plain text, \\n\\n between paragraphs, hashtags at end>",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "health_score": {
    "overall": 0,
    "title_score": 0,
    "description_score": 0,
    "photo_score": ${finalPhotoUrls.length >= 3 ? 25 : finalPhotoUrls.length === 2 ? 18 : finalPhotoUrls.length === 1 ? 10 : 0},
    "completeness_score": 0
  }
}`,
    });

    for (const photoUrl of finalPhotoUrls.slice(0, 4)) {
      userContent.push({ type: "image_url", image_url: { url: photoUrl } });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "You are a real Vinted seller with 2,000+ sales. Always respond with valid JSON only. Never use markdown." },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
      if (aiRes.status === 402) throw new Error("AI credits exhausted.");
      throw new Error("AI analysis failed");
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        result = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
      } else {
        throw new Error("AI returned invalid response — please try again");
      }
    }

    // Strip markdown from description
    if (result.optimised_description) {
      result.optimised_description = result.optimised_description
        .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
        .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^[\-\*•]\s+/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    // Mark first-item-free pass as used
    if (useFirstItemPass) {
      await supabase.from("profiles").update({ first_item_pass_used: true }).eq("id", userId);
    }

    return new Response(JSON.stringify({ ...result, success: true, creditsUsed: useFirstItemPass ? 0 : 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("optimize-listing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
