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
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4 bg-gradient-hero overflow-hidden">
      {/* Radial coral glow behind headline (§7.3) */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "600px",
          background: "radial-gradient(ellipse at center, hsla(350, 80%, 58%, 0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full"
        variants={containerVariants(0.1)}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow tag */}
        <motion.div variants={fadeUpVariants(0)}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-body font-medium mb-6 border border-primary/20">
            ✦ Built for Vinted sellers
          </span>
        </motion.div>

        {/* Headline — delay 0ms (§7.3 entrance sequence) */}
        <motion.h1
          className="text-hero font-display font-extrabold text-foreground mb-5 max-w-3xl"
          variants={fadeUpVariants(0)}
        >
          Turn phone photos
          <br />
          <span className="text-primary">into sales.</span>
        </motion.h1>

        {/* Subheadline — delay 100ms */}
        <motion.p
          className="text-lg md:text-[1.125rem] font-body font-normal text-muted-foreground max-w-xl mb-8 leading-relaxed"
          variants={fadeUpVariants(0.1)}
        >
          AI photo studio + listing tools for Vinted sellers.
        </motion.p>

        {/* CTA buttons — delay 200ms */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 mb-3"
          variants={fadeUpVariants(0.2)}
        >
          <Button
            size="lg"
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold px-8 rounded-full shadow-coral hover:shadow-coral-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 h-12 text-[15px]"
            onClick={() => scrollTo("#pricing")}
          >
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-border font-body font-medium px-8 rounded-full h-12 text-[15px] hover:bg-muted hover:border-border-hover transition-all duration-200"
            onClick={() => scrollTo("#how-it-works")}
          >
            See How It Works ↓
          </Button>
        </motion.div>

        {/* Caption below CTAs */}
        <motion.p
          className="text-xs font-body text-muted-foreground/70 mb-12"
          variants={fadeUpVariants(0.2)}
        >
          No credit card required · Your first item is free
        </motion.p>

        {/* Before/After Comparison — delay 400ms, aspect 16:9 */}
        <motion.div
          className="w-full max-w-3xl"
          variants={fadeUpVariants(0.4)}
        >
          <BeforeAfterSlider
            beforeLabel="Original Photo"
            afterLabel="Vintifi Enhanced"
            beforeGradient="linear-gradient(145deg, hsl(220 15% 28%) 0%, hsl(215 10% 18%) 100%)"
            afterGradient="linear-gradient(145deg, hsl(30 60% 95%) 0%, hsl(350 40% 93%) 50%, hsl(280 30% 95%) 100%)"
            className="aspect-video w-full shadow-xl"
            autoReveal
            autoRevealDelay={800}
          />
          {/* Subtext below comparison (§7.3) */}
          <p className="mt-4 text-base font-body font-medium italic text-muted-foreground text-center">
            "Your phone camera is enough."
          </p>
          <p className="mt-1 text-xs font-mono text-muted-foreground/50 text-center tracking-wider uppercase">
            Drag slider to compare · Placeholder gradients — real photos coming soon
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
