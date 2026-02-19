import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import { useCreateCheckout } from "@/hooks/useStripe";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    priceSuffix: "forever",
    description: "Perfect to get started",
    cta: "Get Started",
    ctaVariant: "outline" as const,
    popular: false,
    tier: null,
    features: [
      "Your first item free",
      "Background removal",
      "Basic listing description",
      "Vinted price check (3/mo)",
      "Standard processing speed",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    priceSuffix: "/month",
    description: "For active Vinted sellers",
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    popular: true,
    tier: "pro",
    features: [
      "50 credits / month",
      "AI model shots",
      "Flat-lay styling",
      "Smart descriptions (unlimited)",
      "Price Intelligence",
      "Trend Radar access",
      "Priority processing",
    ],
  },
  {
    name: "Business",
    monthlyPrice: 24.99,
    annualPrice: 19.99,
    priceSuffix: "/month",
    description: "For power sellers & resellers",
    cta: "Start Free Trial",
    ctaVariant: "outline" as const,
    popular: false,
    tier: "business",
    features: [
      "200 credits / month",
      "Everything in Pro",
      "Bulk photo processing",
      "CSV listing export",
      "Multi-platform listings",
      "Analytics dashboard",
      "Priority support",
    ],
  },
];

const PricingSection: React.FC = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 md:py-28" style={{ background: "hsl(var(--surface-sunken))" }}>
      <div className="container">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-section font-display font-bold text-foreground mb-4">
            Simple pricing. Start free.
          </h2>
          <p className="text-[1.125rem] font-body text-muted-foreground max-w-md mx-auto mb-8">
            Your first item is completely on us. No card required.
          </p>

          {/* Monthly / Annual toggle */}
          <div
            className="inline-flex items-center gap-1 rounded-full p-1"
            style={{ background: "hsl(var(--border))" }}
          >
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-200",
                !annual
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-200",
                annual
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className="ml-1.5 text-xs text-success font-semibold">Save 20%</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Cards — Pro is first on mobile, middle on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <ScrollReveal delay={0} className="order-2 md:order-1">
            <TierCard tier={tiers[0]} annual={annual} />
          </ScrollReveal>
          <ScrollReveal delay={0.08} className="order-1 md:order-2 md:-translate-y-2">
            <TierCard tier={tiers[1]} annual={annual} />
          </ScrollReveal>
          <ScrollReveal delay={0.16} className="order-3 md:order-3">
            <TierCard tier={tiers[2]} annual={annual} />
          </ScrollReveal>
        </div>

        <ScrollReveal className="text-center mt-8">
          <p className="text-sm font-body text-muted-foreground">
            Need more credits?{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
              Top up anytime from £2.99
            </span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

function TierCard({ tier, annual }: { tier: (typeof tiers)[number]; annual: boolean }) {
  const price = annual ? tier.annualPrice : tier.monthlyPrice;
  const checkout = useCreateCheckout();
  const navigate = useNavigate();

  async function handleCta() {
    if (!tier.tier) {
      // Free plan → go to sign up
      navigate("/signup");
      return;
    }
    try {
      await checkout.mutateAsync({ type: "subscription", tier: tier.tier, annual });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open checkout — please try again");
    }
  }

  return (
    <div
      className={cn(
        "rounded-[14px] border p-6 md:p-8 bg-card flex flex-col h-full transition-shadow duration-300",
        tier.popular
          ? "border-primary border-2 shadow-lg"
          : "border-border shadow-sm hover:shadow-md"
      )}
    >
      {tier.popular && (
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-body font-semibold"
            style={{
              background: "linear-gradient(135deg, hsl(350 80% 58%) 0%, hsl(20 85% 58%) 100%)",
            }}
          >
            ★ Most Popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="font-display font-bold text-foreground text-xl mb-1">{tier.name}</h3>
        <p className="text-sm font-body text-muted-foreground">{tier.description}</p>
      </div>

      {/* Price with animated transition */}
      <div className="mb-6 flex items-end gap-1 h-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={annual ? `${tier.name}-annual` : `${tier.name}-monthly`}
            className="font-display font-extrabold text-[2.5rem] leading-none text-foreground"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            £{price}
          </motion.span>
        </AnimatePresence>
        <span className="text-sm font-body text-muted-foreground mb-1">
          {tier.priceSuffix}
          {annual && tier.monthlyPrice > 0 && ", billed annually"}
        </span>
      </div>

      <Button
        variant={tier.ctaVariant}
        className={cn(
          "w-full rounded-full font-body font-semibold mb-6 h-11 transition-all duration-200",
          tier.popular
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-coral hover:shadow-coral-hover hover:-translate-y-0.5"
            : "border-border hover:bg-muted"
        )}
        onClick={handleCta}
        disabled={checkout.isPending}
      >
        {checkout.isPending ? <Loader2 size={15} className="animate-spin mr-2" /> : null}
        {tier.cta}
      </Button>

      <ul className="space-y-3 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-success mt-0.5 flex-none" />
            <span className="text-sm font-body text-foreground/80">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PricingSection;
