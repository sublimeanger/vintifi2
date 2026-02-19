import Stripe from "npm:stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  try {
    // ── Pro product ─────────────────────────────────────────────────────────
    const proProd = await stripe.products.create({
      name: "Pro",
      description: "Unlimited AI photos, listing descriptions, price intelligence, trend alerts",
    });

    const proMonthly = await stripe.prices.create({
      product: proProd.id,
      unit_amount: 999, // £9.99
      currency: "gbp",
      recurring: { interval: "month" },
      nickname: "Pro Monthly",
    });

    const proAnnual = await stripe.prices.create({
      product: proProd.id,
      unit_amount: 9588, // £95.88
      currency: "gbp",
      recurring: { interval: "year" },
      nickname: "Pro Annual",
    });

    // ── Business product ─────────────────────────────────────────────────────
    const bizProd = await stripe.products.create({
      name: "Business",
      description: "Everything in Pro plus higher limits and priority support",
    });

    const bizMonthly = await stripe.prices.create({
      product: bizProd.id,
      unit_amount: 2499, // £24.99
      currency: "gbp",
      recurring: { interval: "month" },
      nickname: "Business Monthly",
    });

    const bizAnnual = await stripe.prices.create({
      product: bizProd.id,
      unit_amount: 23988, // £239.88
      currency: "gbp",
      recurring: { interval: "year" },
      nickname: "Business Annual",
    });

    // ── Credit pack products ─────────────────────────────────────────────────
    const pack10Prod = await stripe.products.create({
      name: "Credit Pack — Starter (10 credits)",
      description: "10 AI credits, one-off purchase",
    });
    const pack10 = await stripe.prices.create({
      product: pack10Prod.id,
      unit_amount: 299, // £2.99
      currency: "gbp",
      nickname: "Pack 10",
    });

    const pack30Prod = await stripe.products.create({
      name: "Credit Pack — Popular (30 credits)",
      description: "30 AI credits, one-off purchase",
    });
    const pack30 = await stripe.prices.create({
      product: pack30Prod.id,
      unit_amount: 699, // £6.99
      currency: "gbp",
      nickname: "Pack 30",
    });

    const pack75Prod = await stripe.products.create({
      name: "Credit Pack — Power (75 credits)",
      description: "75 AI credits, one-off purchase",
    });
    const pack75 = await stripe.prices.create({
      product: pack75Prod.id,
      unit_amount: 1499, // £14.99
      currency: "gbp",
      nickname: "Pack 75",
    });

    return new Response(
      JSON.stringify({
        success: true,
        products: {
          pro: proProd.id,
          business: bizProd.id,
          pack10: pack10Prod.id,
          pack30: pack30Prod.id,
          pack75: pack75Prod.id,
        },
        prices: {
          STRIPE_PRICE_PRO_MONTHLY: proMonthly.id,
          STRIPE_PRICE_PRO_ANNUAL: proAnnual.id,
          STRIPE_PRICE_BUSINESS_MONTHLY: bizMonthly.id,
          STRIPE_PRICE_BUSINESS_ANNUAL: bizAnnual.id,
          STRIPE_PRICE_PACK_10: pack10.id,
          STRIPE_PRICE_PACK_30: pack30.id,
          STRIPE_PRICE_PACK_75: pack75.id,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
