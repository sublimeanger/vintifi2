import React from "react";
import { Star, Zap, Users } from "lucide-react";

// Using qualitative proof (§7.4 — for early stage when numbers < 50 sellers)
const proofItems = [
  {
    icon: <Star className="w-4 h-4 fill-current" style={{ color: "hsl(42 92% 56%)" }} />,
    text: "Trusted by Vinted sellers",
  },
  { separator: true },
  {
    icon: <Zap className="w-4 h-4 text-primary" />,
    text: "Professional photos in seconds",
  },
  { separator: true },
  {
    icon: <Users className="w-4 h-4 text-success" />,
    text: "No design skills needed",
  },
];

const SocialProofBar: React.FC = () => {
  return (
    <section
      className="py-5 border-y border-border/60"
      style={{ background: "hsl(var(--surface-sunken))" }}
    >
      <div className="container">
        {/* Desktop: row | Mobile: stacked */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {proofItems.map((item, i) =>
            "separator" in item ? (
              <span key={i} className="hidden sm:block w-px h-4 bg-border" />
            ) : (
              <div key={i} className="flex items-center gap-2">
                {item.icon}
                <span className="text-sm font-body font-medium text-muted-foreground">
                  {item.text}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
