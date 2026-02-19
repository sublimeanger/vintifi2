import React from "react";
import { Star, Zap, Users } from "lucide-react";

const stats = [
  { icon: <Star className="w-4 h-4 text-gold fill-gold" />, text: "4.9 rating from early sellers" },
  { separator: true },
  { icon: <Zap className="w-4 h-4 text-primary" />, text: "Professional photos in seconds" },
  { separator: true },
  { icon: <Users className="w-4 h-4 text-success" />, text: "No design skills needed" },
];

const SocialProofBar: React.FC = () => {
  return (
    <section className="py-4 bg-secondary/60 border-y border-border/60">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {stats.map((item, i) =>
            "separator" in item ? (
              <span key={i} className="hidden sm:block w-px h-4 bg-border" />
            ) : (
              <div key={i} className="flex items-center gap-2">
                {item.icon}
                <span className="text-sm font-mono text-muted-foreground">
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
