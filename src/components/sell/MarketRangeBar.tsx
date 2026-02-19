import { motion } from "framer-motion";
import type { PriceRange } from "@/lib/sell-wizard-state";

interface MarketRangeBarProps {
  priceRange: PriceRange;
  chosenPrice: number | null;
}

export function MarketRangeBar({ priceRange, chosenPrice }: MarketRangeBarProps) {
  const { low, median, high } = priceRange;
  const range = high - low;

  // Position of the chosen price on the track (0–100%)
  const chosenPosition =
    chosenPrice !== null && range > 0
      ? Math.min(100, Math.max(0, ((chosenPrice - low) / range) * 100))
      : 50;

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      {/* Price labels row */}
      <div className="flex justify-between mb-3">
        <div className="text-center">
          <p className="font-mono text-sm font-semibold text-foreground">£{low}</p>
          <p className="text-[10px] text-muted-foreground">Low</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-sm font-semibold text-foreground">£{median}</p>
          <p className="text-[10px] text-muted-foreground">Median</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-sm font-semibold text-foreground">£{high}</p>
          <p className="text-[10px] text-muted-foreground">High</p>
        </div>
      </div>

      {/* Gradient track */}
      <div className="relative h-3 mb-1">
        <div className="w-full h-full bg-gradient-to-r from-success/30 via-primary/30 to-accent/30 rounded-full" />

        {/* Fixed dot markers */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-success/60 border-2 border-background" />
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/60 border-2 border-background" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-accent/60 border-2 border-background" />

        {/* Animated chosen price dot */}
        {chosenPrice !== null && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-foreground border-2 border-background shadow-lg flex items-center justify-center z-10"
            animate={{ left: `${chosenPosition}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="w-2 h-2 rounded-full bg-background" />
          </motion.div>
        )}
      </div>

      {chosenPrice !== null && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          Chosen price: <span className="font-mono font-semibold text-foreground">£{chosenPrice.toFixed(2)}</span>
        </p>
      )}
    </div>
  );
}
