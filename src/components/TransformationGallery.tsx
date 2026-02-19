import React from "react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ScrollReveal from "@/components/ScrollReveal";

const transformations = [
  {
    label: "Background Removal",
    description: "Clean white background in one tap",
    beforeGradient: "linear-gradient(145deg, hsl(220 15% 35%) 0%, hsl(220 10% 22%) 100%)",
    afterGradient: "linear-gradient(145deg, hsl(0 0% 98%) 0%, hsl(220 20% 96%) 100%)",
    beforeLabel: "Cluttered BG",
    afterLabel: "Clean White",
  },
  {
    label: "Flat-Lay Pro",
    description: "Styled top-down product shots",
    beforeGradient: "linear-gradient(145deg, hsl(30 20% 40%) 0%, hsl(220 10% 28%) 100%)",
    afterGradient: "linear-gradient(145deg, hsl(40 60% 92%) 0%, hsl(30 50% 88%) 100%)",
    beforeLabel: "Handheld Shot",
    afterLabel: "Flat-Lay Styled",
  },
  {
    label: "AI Model Shot",
    description: "See your item worn on a model",
    beforeGradient: "linear-gradient(145deg, hsl(220 10% 32%) 0%, hsl(200 15% 22%) 100%)",
    afterGradient: "linear-gradient(145deg, hsl(350 40% 90%) 0%, hsl(280 30% 88%) 100%)",
    beforeLabel: "Flat Item",
    afterLabel: "On Model",
  },
];

const TransformationGallery: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-background">
      <div className="container">
        <ScrollReveal className="text-center mb-14">
          <h2 className="text-section font-display font-bold text-foreground mb-4">
            See the difference.
          </h2>
          <p className="text-base font-body text-muted-foreground max-w-md mx-auto">
            Drag each slider to reveal the Vintifi transformation. These are placeholder gradients — real AI results coming soon.
          </p>
        </ScrollReveal>

        {/* Desktop: 3-col grid | Mobile: horizontal scroll */}
        <div className="md:grid md:grid-cols-3 md:gap-6 flex md:flex-none overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {transformations.map((t, i) => (
            <ScrollReveal
              key={t.label}
              delay={i * 0.08}
              className="flex-none w-[85vw] md:w-auto snap-center"
            >
              <div className="group rounded-2xl overflow-hidden bg-card border border-border shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                {/* 4:5 portrait slider */}
                <BeforeAfterSlider
                  beforeGradient={t.beforeGradient}
                  afterGradient={t.afterGradient}
                  beforeLabel={t.beforeLabel}
                  afterLabel={t.afterLabel}
                  className="aspect-[4/5] w-full"
                />
                <div className="p-4">
                  <h3 className="font-display font-semibold text-foreground text-base mb-1">
                    {t.label}
                  </h3>
                  <p className="text-sm font-body text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransformationGallery;
