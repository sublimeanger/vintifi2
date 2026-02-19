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
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-dark" />
      {/* Subtle coral glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(350 80% 58% / 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 flex flex-col items-center text-center">
        <ScrollReveal>
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/15 text-white/60 text-sm font-body mb-6">
            Ready to start?
          </span>
          <h2
            className="font-display font-extrabold text-white mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.025em", lineHeight: 1.1 }}
          >
            Your next listing
            <br />
            deserves better photos.
          </h2>
          <p className="text-lg font-body text-white/60 max-w-lg mb-10 leading-relaxed">
            Join thousands of Vinted sellers who photograph less and sell more with Vintifi.
          </p>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-bold px-10 py-4 h-auto rounded-full shadow-coral text-lg"
              onClick={() => scrollTo("#pricing")}
            >
              Get Started Free
            </Button>
          </motion.div>
          <p className="mt-4 text-sm font-mono text-white/30 tracking-wider">
            No credit card required · Cancel anytime
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FinalCTA;
