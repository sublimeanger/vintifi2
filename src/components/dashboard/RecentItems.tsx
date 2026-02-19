import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";
import type { Listing } from "@/types/database";

interface Props {
  listings: Listing[];
}

const CONDITION_LABEL: Record<string, string> = {
  new_with_tags: "New with tags",
  new_without_tags: "New without tags",
  very_good: "Very good",
  good: "Good",
  satisfactory: "Satisfactory",
};

export function RecentItems({ listings }: Props) {
  if (listings.length === 0) return null;

  const recent = listings.slice(0, 8);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Recent Items
        </h2>
        <Link
          to="/listings"
          className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-1.5 transition-all"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          See all <ArrowRight size={12} />
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {recent.map((listing) => (
          <Link
            key={listing.id}
            to={`/listings/${listing.id}`}
            className="snap-start flex-shrink-0 w-36 sm:w-44 rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* Photo */}
            <div className="w-full aspect-square bg-muted flex items-center justify-center overflow-hidden">
              {listing.enhanced_photos?.[0] || listing.original_photos?.[0] ? (
                <img
                  src={listing.enhanced_photos?.[0] || listing.original_photos?.[0]}
                  alt={listing.title ?? "Item"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Package size={24} className="text-muted-foreground/40" />
              )}
            </div>

            {/* Info */}
            <div className="p-2.5">
              <p
                className="text-xs font-semibold text-foreground truncate leading-tight"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {listing.optimised_title || listing.title || "Untitled"}
              </p>
              {listing.brand && (
                <p
                  className="text-[11px] text-muted-foreground truncate mt-0.5"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {listing.brand}
                </p>
              )}
              {listing.chosen_price || listing.suggested_price ? (
                <p
                  className="text-xs font-bold text-primary mt-1 tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  £{(listing.chosen_price ?? listing.suggested_price)?.toFixed(2)}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
