import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("Not authenticated");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.json();
    const { type, tier, pack, annual, price_id } = body;

    // Price ID lookup table (hardcoded from Stripe seed)
    const PRICE_IDS: Record<string, string> = {
      "pro_monthly":       "price_1T2XJ54qASjubvn3bcfx6Yzj",
      "pro_annual":        "price_1T2XJ54qASjubvn3b64GDARJ",
      "business_monthly":  "price_1T2XJ64qASjubvn3TMLLzYui",
      "business_annual":   "price_1T2XJ64qASjubvn3Ogxe6uj4",
      "pack_10":           "price_1T2XJ74qASjubvn37dtevWVw",
      "pack_30":           "price_1T2XJ74qASjubvn3E9qoBuKz",
      "pack_75":           "price_1T2XJ84qASjubvn3AMPHOgHK",
    };

    // Resolve price ID
    let resolvedPriceId = price_id;
    if (!resolvedPriceId && type === "subscription") {
      const isAnnual = annual === true;
      const tierKey = (tier ?? "pro").toLowerCase();
      const period = isAnnual ? "annual" : "monthly";
      resolvedPriceId = PRICE_IDS[`${tierKey}_${period}`];
      if (!resolvedPriceId) throw new Error(`Price not configured for ${tierKey} ${period}`);
    } else if (!resolvedPriceId && type === "credit_pack") {
      const packKey = (pack ?? "10").toString();
      resolvedPriceId = PRICE_IDS[`pack_${packKey}`];
      if (!resolvedPriceId) throw new Error(`Price not configured for pack ${packKey}`);
    }

    if (!resolvedPriceId) throw new Error("price_id required");

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    let isFirstTimeSub = true;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
      if (subs.data.length > 0) isFirstTimeSub = false;
    }

    const origin = req.headers.get("origin") || "https://vintifi.app";
    const isSubscription = type === "subscription";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/settings`,
      metadata: { type, user_id: user.id },
    };

    if (isSubscription && isFirstTimeSub) {
      sessionParams.subscription_data = { trial_period_days: 7 };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
