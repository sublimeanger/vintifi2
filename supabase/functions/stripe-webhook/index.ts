import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

// Map Stripe product IDs → tier/credits (configure after creating Stripe products)
const TIER_MAP: Record<string, { tier: string; credits: number }> = {
  // These will be filled in after Stripe products are created
  // "prod_xxx": { tier: "pro", credits: 50 },
};

const CREDIT_PACK_MAP: Record<string, number> = {
  // "prod_xxx": 10,
};

async function findUserByEmail(supabase: ReturnType<typeof createClient>, email: string): Promise<{ id: string } | null> {
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error || !users || users.length === 0) break;
    const found = users.find((u: { email?: string }) => u.email === email);
    if (found) return { id: found.id };
    if (users.length < perPage) break;
    page++;
  }
  return null;
}

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response("Stripe not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  console.log(`[stripe-webhook] Event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Credit pack purchase
        if (session.mode === "payment" && session.metadata?.type === "credit_pack") {
          const userId = session.metadata.user_id;
          if (userId) {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
            const productId = lineItems.data[0]?.price?.product as string;
            const creditsToAdd = CREDIT_PACK_MAP[productId] || 0;
            if (creditsToAdd > 0) {
              // Add credits atomically via RPC
              await supabase.rpc("deduct_credits", {
                p_user_id: userId,
                p_amount: -creditsToAdd, // negative deduction = credit addition
                p_operation: "credit_pack_purchase",
                p_description: `Credit pack: +${creditsToAdd} credits`,
              });
              // Also directly update balance for additive case
              await supabase.from("profiles")
                .update({ credits_balance: creditsToAdd })
                .eq("id", userId);
            }
          }
          break;
        }

        // Subscription checkout
        if (session.mode === "subscription" && session.customer_email) {
          const user = await findUserByEmail(supabase, session.customer_email);
          if (user) {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string);
            const productId = sub.items.data[0].price.product as string;
            const tierInfo = TIER_MAP[productId] || { tier: "pro", credits: 50 };
            await supabase.from("profiles")
              .update({
                subscription_tier: tierInfo.tier,
                credits_monthly_allowance: tierInfo.credits,
                credits_balance: tierInfo.credits,
              })
              .eq("id", user.id);
            await supabase.from("subscriptions").upsert({
              user_id: user.id,
              stripe_subscription_id: sub.id,
              stripe_customer_id: session.customer as string,
              status: sub.status,
              tier: tierInfo.tier,
              current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
            }, { onConflict: "stripe_subscription_id" });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
        if (customer.email) {
          const user = await findUserByEmail(supabase, customer.email);
          if (user && sub.status === "active") {
            const productId = sub.items.data[0].price.product as string;
            const tierInfo = TIER_MAP[productId] || { tier: "pro", credits: 50 };
            await supabase.from("profiles")
              .update({ subscription_tier: tierInfo.tier, credits_monthly_allowance: tierInfo.credits })
              .eq("id", user.id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
        if (customer.email) {
          const user = await findUserByEmail(supabase, customer.email);
          if (user) {
            await supabase.from("profiles")
              .update({ subscription_tier: "free", credits_monthly_allowance: 3 })
              .eq("id", user.id);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe-webhook] Payment failed for invoice ${invoice.id}`);
        break;
      }
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error processing ${event.type}:`, err);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
