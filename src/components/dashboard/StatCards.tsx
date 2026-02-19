import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types/database";

interface Props {
  listings: Listing[];
  creditsBalance: number;
  creditsMonthlyAllowance: number;
}

export function StatCards({ listings, creditsBalance, creditsMonthlyAllowance }: Props) {
  const isUnlimited = creditsBalance >= 999999;
  const isLow =
    !isUnlimited &&
    creditsBalance <= Math.max(2, Math.floor(creditsMonthlyAllowance * 0.2));

  const photosEnhanced = listings.reduce(
    (sum, l) => sum + (l.enhanced_photos?.length ?? 0),
    0
  );

  // Listing health: % of listings with optimised_title filled
  const withTitle = listings.filter((l) => l.optimised_title).length;
  const health =
    listings.length > 0 ? Math.round((withTitle / listings.length) * 100) : 0;

  const cards = [
    {
      label: "Items Listed",
      value: listings.length.toString(),
      to: "/listings",
      mono: true,
      warn: false,
    },
    {
      label: "Photos Enhanced",
      value: photosEnhanced.toString(),
      to: "/vintography",
      mono: true,
      warn: false,
    },
    {
      label: "Credits",
      value: isUnlimited ? "∞" : creditsBalance.toString(),
      to: "/settings",
      mono: true,
      warn: isLow,
    },
    {
      label: "Listing Health",
      value: listings.length === 0 ? "—" : `${health}%`,
      to: "/listings",
      mono: false,
      warn: health > 0 && health < 50,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <Link
          key={card.label}
          to={card.to}
          className={cn(
            "group rounded-2xl border bg-card p-4 flex flex-col gap-1.5",
            "hover:shadow-md transition-all duration-200 hover:-translate-y-0.5",
            card.warn ? "border-amber-300/60" : "border-border"
          )}
        >
          <span
            className="text-xs text-muted-foreground uppercase tracking-wide"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {card.label}
          </span>
          <span
            className={cn(
              "text-2xl font-bold leading-none",
              card.warn ? "text-amber-500" : "text-foreground",
              card.mono && "tabular-nums"
            )}
            style={{
              fontFamily: card.mono ? "'JetBrains Mono', monospace" : "'Sora', sans-serif",
            }}
          >
            {card.value}
          </span>
        </Link>
      ))}
    </div>
  );
}
