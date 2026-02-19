import React from "react";
import { Camera, FileText, BarChart2, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/ScrollReveal";

interface Feature {
  icon: React.ReactNode;
  badge?: string;
  title: string;
  description: string;
  mockupGradient: string;
  large?: boolean;
}

const features: Feature[] = [
  {
    icon: <Camera className="w-6 h-6" />,
    badge: "Most Popular Feature",
    title: "AI Photo Studio",
    description:
      "One tap transforms your phone snap into a professional product photo. Background removal, lighting enhancement, and flat-lay styling — automatically.",
    mockupGradient: "linear-gradient(135deg, hsl(350 60% 92%) 0%, hsl(30 60% 94%) 50%, hsl(280 30% 92%) 100%)",
    large: true,
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Smart Descriptions",
    description:
      "AI generates compelling, accurate item descriptions from your photos. Includes size, condition, material, and brand detection.",
    mockupGradient: "linear-gradient(135deg, hsl(200 50% 88%) 0%, hsl(220 40% 92%) 100%)",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Price Intelligence",
    description:
      "Real-time pricing data from Vinted's marketplace. See what similar items sold for and get an optimal price recommendation.",
    mockupGradient: "linear-gradient(135deg, hsl(140 40% 86%) 0%, hsl(160 30% 90%) 100%)",
  },
  {
    icon: <Compass className="w-6 h-6" />,
    title: "Trend Radar",
    description:
      "Know which styles and brands are trending before you list. Time your listings for maximum visibility and sell-through.",
    mockupGradient: "linear-gradient(135deg, hsl(42 70% 88%) 0%, hsl(38 50% 92%) 100%)",
  },
];

const FeatureShowcase: React.FC = () => {
  const [mainFeature, ...otherFeatures] = features;

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <ScrollReveal className="text-center mb-14">
          <h2 className="text-section font-display font-bold text-foreground mb-4">
            Everything you need to sell faster.
          </h2>
          <p className="text-base font-body text-muted-foreground max-w-md mx-auto">
            Vintifi handles everything from photo to listing so you can focus on what matters — finding great pieces.
          </p>
        </ScrollReveal>

        {/* Main feature — full width */}
        <ScrollReveal className="mb-6">
          <div
            className="relative rounded-3xl overflow-hidden border border-border shadow-lg"
            style={{ background: mainFeature.mockupGradient }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                {mainFeature.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-body font-semibold mb-5 w-fit">
                    ✦ {mainFeature.badge}
                  </span>
                )}
                <div className="w-12 h-12 rounded-2xl bg-background/70 backdrop-blur-sm flex items-center justify-center text-primary mb-4 border border-border/50">
                  {mainFeature.icon}
                </div>
                <h3 className="font-display font-bold text-foreground text-2xl md:text-3xl mb-4">
                  {mainFeature.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed text-base">
                  {mainFeature.description}
                </p>
              </div>
              {/* Mockup placeholder */}
              <div className="hidden md:flex items-center justify-center p-8">
                <div className="w-full max-w-xs h-64 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 text-primary">
                      {mainFeature.icon}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                      UI Preview
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Smaller features — 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherFeatures.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.08}>
              <div
                className="rounded-2xl border border-border shadow-md overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 h-full"
                style={{ background: feature.mockupGradient }}
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-background/60 backdrop-blur-sm flex items-center justify-center text-primary mb-4 border border-border/40">
                    {feature.icon}
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  {/* Mockup mini placeholder */}
                  <div className="mt-4 h-24 rounded-xl bg-background/40 border border-border/30 flex items-center justify-center">
                    <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
                      Preview
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
