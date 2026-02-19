import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, Copy, Check } from "lucide-react";
import { useState } from "react";
import { PageTransition } from "@/components/app/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";
import { useListing } from "@/hooks/useListings";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs font-medium text-primary flex items-center gap-1 hover:text-primary/80 transition-colors min-h-[32px] px-2"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListing(id);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="aspect-square w-full max-w-sm rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (error || !listing) {
    return (
      <PageTransition>
        <div className="text-center py-16 space-y-3">
          <Package size={36} className="mx-auto text-muted-foreground/40" />
          <p className="text-base font-semibold text-foreground">Item not found</p>
          <Link to="/listings" className="text-sm text-primary hover:underline">
            ← Back to My Items
          </Link>
        </div>
      </PageTransition>
    );
  }

  const photos = [...(listing.enhanced_photos ?? []), ...(listing.original_photos ?? [])].filter(Boolean);
  const title = listing.optimised_title || listing.title || "Untitled";
  const description = listing.optimised_description || listing.description || "";
  const hashtags = listing.hashtags ?? [];

  const rowClass = "bg-surface-sunken border border-border rounded-xl p-4";
  const labelClass = "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block";

  return (
    <PageTransition>
      <div className="max-w-2xl space-y-6">
        {/* Back */}
        <Link
          to="/listings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          My Items
        </Link>

        {/* Photo strip */}
        {photos.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {photos.slice(0, 5).map((url, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-36 h-36 rounded-2xl overflow-hidden border border-border bg-muted"
              >
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}

        {/* Price + status */}
        <div className="flex items-center gap-4">
          {listing.chosen_price || listing.suggested_price ? (
            <span className="font-mono text-3xl font-bold text-foreground">
              £{(listing.chosen_price ?? listing.suggested_price)?.toFixed(2)}
            </span>
          ) : null}
          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium capitalize">
            {listing.status}
          </span>
        </div>

        {/* Title */}
        <div className={rowClass}>
          <div className="flex items-center justify-between mb-1">
            <span className={labelClass}>Title</span>
            <CopyButton value={title} />
          </div>
          <p className="text-sm text-foreground font-medium">{title}</p>
        </div>

        {/* Description */}
        {description && (
          <div className={rowClass}>
            <div className="flex items-center justify-between mb-1">
              <span className={labelClass}>Description</span>
              <CopyButton value={description} />
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{description}</p>
          </div>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className={rowClass}>
            <div className="flex items-center justify-between mb-2">
              <span className={labelClass}>Hashtags</span>
              <CopyButton value={hashtags.join(" ")} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          {listing.brand && (
            <div className={rowClass}>
              <span className={labelClass}>Brand</span>
              <p className="text-sm text-foreground font-medium">{listing.brand}</p>
            </div>
          )}
          {listing.size && (
            <div className={rowClass}>
              <span className={labelClass}>Size</span>
              <p className="text-sm text-foreground font-medium">{listing.size}</p>
            </div>
          )}
          {listing.condition && (
            <div className={rowClass}>
              <span className={labelClass}>Condition</span>
              <p className="text-sm text-foreground font-medium capitalize">{listing.condition.replace(/_/g, " ")}</p>
            </div>
          )}
          {listing.category && (
            <div className={rowClass}>
              <span className={labelClass}>Category</span>
              <p className="text-sm text-foreground font-medium">{listing.category}</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
