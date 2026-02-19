import { Link } from "react-router-dom";
import { ShoppingBag, Camera, TrendingUp, ChevronRight } from "lucide-react";

const ACTIONS = [
  {
    label: "Sell an Item",
    description: "List something new in minutes",
    icon: ShoppingBag,
    to: "/sell",
    primary: true,
  },
  {
    label: "Photo Studio",
    description: "Enhance your product photos with AI",
    icon: Camera,
    to: "/vintography",
    primary: false,
  },
  {
    label: "Trends",
    description: "See what's selling right now",
    icon: TrendingUp,
    to: "/trends",
    primary: false,
  },
];

export function QuickActions() {
  return (
    <div className="mb-6">
      <h2
        className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className={`group relative rounded-2xl border p-4 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                action.primary
                  ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                  : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  action.primary
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground group-hover:text-foreground transition-colors"
                }`}
              >
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold text-sm leading-tight ${
                    action.primary ? "text-primary" : "text-foreground"
                  }`}
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {action.label}
                </p>
                <p
                  className="text-xs text-muted-foreground mt-0.5 leading-snug"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {action.description}
                </p>
              </div>
              <ChevronRight
                size={15}
                className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
