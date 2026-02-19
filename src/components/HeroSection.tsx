import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { containerVariants, fadeUpVariants } from "@/lib/motion";

const HeroSection: React.FC = () => {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-12 px-4 bg-gradient-hero overflow-hidden">
      {/* Subtle radial glow behind headline */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, hsl(350 80% 58% / 0.07) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
        variants={containerVariants(0.12)}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeUpVariants(0)}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-body font-medium mb-6 border border-primary/20">
            ✦ Built for Vinted sellers
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-hero font-display font-extrabold text-foreground mb-5"
          variants={fadeUpVariants(0.08)}
        >
          Turn phone photos
          <br />
          <span className="text-primary">into sales.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl font-body text-muted-foreground max-w-lg mb-8 leading-relaxed"
          variants={fadeUpVariants(0.16)}
        >
          AI-powered photo editing and smart listings for Vinted sellers. Professional results in seconds — no design skills needed.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 mb-14"
          variants={fadeUpVariants(0.24)}
        >
          <Button
            size="lg"
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold px-8 rounded-full shadow-coral h-12 text-base"
            onClick={() => scrollTo("#pricing")}
          >
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-border font-body font-medium px-8 rounded-full h-12 text-base hover:bg-accent"
            onClick={() => scrollTo("#how-it-works")}
          >
            See How It Works ↓
          </Button>
        </motion.div>

        {/* Hero BeforeAfterSlider */}
        <motion.div
          className="w-full max-w-2xl"
          variants={fadeUpVariants(0.36)}
        >
          <BeforeAfterSlider
            beforeLabel="Original Photo"
            afterLabel="Vintifi Enhanced"
            beforeGradient="linear-gradient(145deg, hsl(220 15% 30%) 0%, hsl(220 10% 20%) 100%)"
            afterGradient="linear-gradient(145deg, hsl(30 70% 92%) 0%, hsl(350 50% 90%) 50%, hsl(280 40% 92%) 100%)"
            className="aspect-[4/3] w-full shadow-xl"
            autoReveal
            autoRevealDelay={800}
          />
          <p className="mt-3 text-xs font-mono text-muted-foreground text-center tracking-wider uppercase">
            Drag slider · Placeholder images shown — real photos coming soon
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
