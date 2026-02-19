import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useListings } from "@/hooks/useListings";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft:    { label: "Draft",  className: "bg-muted text-muted-foreground" },
  active:   { label: "Active", className: "bg-success/10 text-success" },
  sold:     { label: "Sold",   className: "bg-primary/10 text-primary" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
};

export default function Listings() {
  const { data: listings, isLoading } = useListings();

  if (isLoading) {
    return (
      <PageTransition>
        <PageHeader title="My Items" subtitle="All your active and sold listings" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </PageTransition>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <PageTransition>
        <PageHeader title="My Items" subtitle="All your active and sold listings" />
        <EmptyState
          icon={<Package size={28} />}
          title="No items yet"
          description="Your saved listings will appear here once you complete the sell wizard."
          ctaLabel="List an item"
          ctaTo="/sell"
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader
        title="My Items"
        subtitle={`${listings.length} item${listings.length !== 1 ? "s" : ""}`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings.map(listing => {
          const photo = listing.enhanced_photos?.[0] ?? listing.original_photos?.[0];
          const badge = STATUS_BADGE[listing.status] ?? STATUS_BADGE.draft;
          return (
            <Link
              key={listing.id}
              to={`/listings/${listing.id}`}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Photo */}
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {photo ? (
                  <img
                    src={photo}
                    alt={listing.title ?? "Item"}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <Package size={28} className="text-muted-foreground/40" />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-semibold text-foreground truncate leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {listing.optimised_title || listing.title || "Untitled"}
                </p>
                {listing.brand && (
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{listing.brand}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  {listing.chosen_price || listing.suggested_price ? (
                    <span className="font-mono text-xs font-bold text-primary">
                      £{(listing.chosen_price ?? listing.suggested_price)?.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">No price</span>
                  )}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageTransition>
  );
}
