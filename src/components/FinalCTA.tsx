import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

const FinalCTA: React.FC = () => {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* gradient-dark background (§3.4) */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, hsl(230 20% 8%) 0%, hsl(250 20% 16%) 100%)",
        }}
      />
      {/* Subtle coral glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, hsla(350, 80%, 58%, 0.10) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 flex flex-col items-center text-center">
        <ScrollReveal>
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/15 text-white/50 text-sm font-body mb-6">
            Ready to start?
          </span>

          {/* Headline — Sora h1, white (§7.9) */}
          <h2
            className="font-display font-extrabold text-white mb-5 max-w-2xl mx-auto"
            style={{
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            Your next listing deserves
            <br />
            better photos.
          </h2>

          {/* Subtext (§7.9) */}
          <p
            className="text-[1.125rem] font-body mb-10 leading-relaxed max-w-lg mx-auto"
            style={{ color: "hsla(0, 0%, 100%, 0.70)" }}
          >
            Transform your first item free — no card required.
          </p>

          {/* Single coral beacon button */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-bold px-10 py-4 h-auto rounded-full shadow-coral hover:shadow-coral-hover transition-all duration-200 text-[15px]"
              onClick={() => scrollTo("#pricing")}
            >
              Get Started Free
            </Button>
          </motion.div>

          <p
            className="mt-4 text-xs font-mono tracking-wider"
            style={{ color: "hsla(0, 0%, 100%, 0.30)" }}
          >
            No credit card required · Cancel anytime
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FinalCTA;
