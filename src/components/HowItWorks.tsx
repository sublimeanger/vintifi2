import React from "react";
import { Camera, Wand2, TrendingUp } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const steps = [
  {
    num: "01",
    icon: <Camera className="w-6 h-6" />,
    title: "Snap your item",
    description:
      "Take a quick photo on your phone — any background, any lighting. Don't worry about perfection.",
  },
  {
    num: "02",
    icon: <Wand2 className="w-6 h-6" />,
    title: "Vintifi transforms it",
    description:
      "Our AI removes backgrounds, improves lighting, and generates a professional product image in seconds.",
  },
  {
    num: "03",
    icon: <TrendingUp className="w-6 h-6" />,
    title: "List and sell faster",
    description:
      "AI-written descriptions, smart pricing suggestions, and trend insights help you sell at the best price.",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-secondary/40">
      <div className="container">
        <ScrollReveal className="text-center mb-14">
          <h2 className="text-section font-display font-bold text-foreground mb-4">
            Professional listings in 3 steps.
          </h2>
          <p className="text-base font-body text-muted-foreground max-w-md mx-auto">
            From phone snap to live listing — the whole process takes under 2 minutes.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-border z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 0.1}>
                <div className="flex md:flex-col items-start md:items-center gap-5 md:gap-4 md:text-center group">
                  {/* Step number + icon */}
                  <div className="relative flex-none">
                    {/* Large decorative number */}
                    <span className="absolute -top-4 -left-2 font-display font-extrabold text-6xl text-primary/12 select-none leading-none">
                      {step.num}
                    </span>
                    <div className="relative w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      {step.icon}
                    </div>
                  </div>

                  {/* Mobile: vertical dot connector */}
                  {i < steps.length - 1 && (
                    <div className="md:hidden ml-6 flex flex-col items-center gap-1 h-8">
                      <div className="w-px h-full bg-border" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
