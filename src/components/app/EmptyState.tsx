import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaTo?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaTo,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className,
      )}
    >
      {/* Icon container — coral/8 */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "hsl(350 80% 58% / 0.08)" }}
      >
        <span className="text-primary">{icon}</span>
      </div>

      <h2
        className="text-lg font-bold text-foreground mb-2"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {title}
      </h2>

      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}

      {ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
