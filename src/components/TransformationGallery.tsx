import React from "react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ScrollReveal from "@/components/ScrollReveal";

const transformations = [
  {
    label: "Background Removal",
    description: "Clean white background in one tap",
    beforeGradient: "linear-gradient(145deg, hsl(220 15% 35%) 0%, hsl(220 10% 22%) 100%)",
    afterGradient: "linear-gradient(145deg, hsl(0 0% 98%) 0%, hsl(220 15% 96%) 100%)",
    beforeLabel: "Cluttered BG",
    afterLabel: "Clean White",
  },
  {
    label: "Flat-Lay Pro",
    description: "Styled top-down editorial product shots",
    beforeGradient: "linear-gradient(145deg, hsl(30 20% 40%) 0%, hsl(220 10% 28%) 100%)",
    afterGradient: "linear-gradient(145deg, hsl(40 60% 92%) 0%, hsl(30 50% 88%) 100%)",
    beforeLabel: "Handheld Shot",
    afterLabel: "Flat-Lay Styled",
  },
  {
    label: "AI Model Shot",
    description: "See your item worn on a virtual model",
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
          <p className="text-base font-body text-muted-foreground max-w-lg mx-auto">
            Real items. Real transformations. All done by Vintifi's AI.{" "}
            <span className="text-muted-foreground/60 text-sm">(Placeholder gradients — real photos coming soon)</span>
          </p>
        </ScrollReveal>

        {/* Desktop: 3-col grid | Tablet: 2-col | Mobile: horizontal scroll snap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-sm:flex max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:pb-4 max-sm:scrollbar-hide max-sm:-mx-4 max-sm:px-4">
          {transformations.map((t, i) => (
            <ScrollReveal
              key={t.label}
              delay={i * 0.08}
              className="max-sm:flex-none max-sm:w-[85vw] max-sm:snap-center"
            >
              <div className="group rounded-[20px] overflow-hidden bg-card border border-border shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 h-full">
                {/* 4:5 portrait slider */}
                <BeforeAfterSlider
                  beforeGradient={t.beforeGradient}
                  afterGradient={t.afterGradient}
                  beforeLabel={t.beforeLabel}
                  afterLabel={t.afterLabel}
                  className="aspect-[4/5] w-full"
                />
                <div className="p-4 md:p-5">
                  <h3 className="font-display font-semibold text-foreground text-base mb-1">
                    {t.label}
                  </h3>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">
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
