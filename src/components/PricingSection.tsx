import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect to get started",
    cta: "Start for Free",
    ctaVariant: "outline" as const,
    popular: false,
    features: [
      "5 photo edits per month",
      "Background removal",
      "Basic listing description",
      "Vinted price check (3/mo)",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    description: "For active Vinted sellers",
    cta: "Start Pro Free",
    ctaVariant: "default" as const,
    popular: true,
    features: [
      "Unlimited photo edits",
      "AI Model shots",
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
    description: "For power sellers & resellers",
    cta: "Start Business Free",
    ctaVariant: "outline" as const,
    popular: false,
    features: [
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
    <section id="pricing" className="py-20 md:py-28 bg-secondary/40">
      <div className="container">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-section font-display font-bold text-foreground mb-4">
            Simple pricing. Start free.
          </h2>
          <p className="text-base font-body text-muted-foreground max-w-md mx-auto mb-8">
            No credit card required. Upgrade anytime. Top up anytime from £2.99.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-secondary rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all",
                !annual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all",
                annual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className="ml-1.5 text-xs text-success font-semibold">Save 20%</span>
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, i) => (
            <ScrollReveal
              key={tier.name}
              delay={i * 0.08}
              className={cn(tier.popular && "md:-translate-y-2")}
            >
              <div
                className={cn(
                  "rounded-2xl border p-6 md:p-8 bg-card transition-all duration-300 hover:shadow-lg h-full flex flex-col",
                  tier.popular
                    ? "border-primary shadow-coral ring-1 ring-primary/30"
                    : "border-border shadow-md"
                )}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-body font-semibold">
                      ✦ Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display font-bold text-foreground text-xl mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-sm font-body text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6 flex items-end gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={annual ? "annual" : "monthly"}
                      className="font-display font-extrabold text-4xl text-foreground"
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.25 }}
                    >
                      £{annual ? tier.annualPrice : tier.monthlyPrice}
                    </motion.span>
                  </AnimatePresence>
                  {(tier.monthlyPrice > 0 || tier.annualPrice > 0) && (
                    <span className="text-sm font-body text-muted-foreground mb-1.5">
                      /{annual ? "mo, billed annually" : "month"}
                    </span>
                  )}
                </div>

                <Button
                  variant={tier.ctaVariant}
                  className={cn(
                    "w-full rounded-full font-body font-semibold mb-6",
                    tier.popular && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-coral"
                  )}
                >
                  {tier.cta}
                </Button>

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm font-body">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-none" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="text-center mt-8">
          <p className="text-sm font-mono text-muted-foreground">
            Need more edits? Top up anytime from £2.99 — no subscription required.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PricingSection;
