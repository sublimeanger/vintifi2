import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap, Target, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketRangeBar } from "@/components/sell/MarketRangeBar";
import type { SellWizardState, SellWizardAction, PriceStrategy } from "@/lib/sell-wizard-state";
import { usePriceCheck } from "@/hooks/usePriceCheck";
import { toast } from "sonner";

interface StepPriceProps {
  state: SellWizardState;
  dispatch: React.Dispatch<SellWizardAction>;
}

const STRATEGIES: { id: PriceStrategy; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'competitive',
    label: 'Competitive',
    icon: <Zap size={18} />,
    desc: 'Sell fast',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    icon: <Target size={18} />,
    desc: 'Best value',
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: <Crown size={18} />,
    desc: 'Max profit',
  },
];

export function StepPrice({ state, dispatch }: StepPriceProps) {
  const { item, isPricing, firstItemFree } = state;
  const hasData = !!item.priceRange;
  const priceCheck = usePriceCheck();

  async function runPriceCheck() {
    dispatch({ type: 'SET_PRICING', loading: true });
    try {
      const result = await priceCheck.mutateAsync({
        title: item.title,
        brand: item.brand,
        category: item.category,
        condition: item.condition,
        size: item.size,
        url: item.source_url || undefined,
        sell_wizard: true,
      });

      const low = result.priceRange?.low ?? result.price_range_low ?? 0;
      const median = result.priceRange?.median ?? result.price_range_median ?? 0;
      const high = result.priceRange?.high ?? result.price_range_high ?? 0;

      dispatch({
        type: 'SET_PRICE_DATA',
        priceRange: { low, median, high },
        suggestedPrice: result.suggestedPrice ?? result.suggested_price ?? median,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Price check failed — please try again');
      dispatch({ type: 'SET_PRICING', loading: false });
    } finally {
      dispatch({ type: 'SET_PRICING', loading: false });
    }
  }

  const strategyPrice = (s: PriceStrategy) => {
    if (!item.priceRange) return 0;
    return s === 'competitive' ? item.priceRange.low
      : s === 'premium' ? item.priceRange.high
      : item.priceRange.median;
  };

  return (
    <div className="space-y-6">
      {!hasData && !isPricing && (
        <div className="text-center py-8 space-y-5">
          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground">Check the market price</p>
            <p className="text-sm text-muted-foreground">
              See what similar items are selling for and choose your pricing strategy.
            </p>
          </div>
          <button
            onClick={runPriceCheck}
            className="min-h-[44px] px-8 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors shadow-[0_4px_14px_hsla(350,80%,58%,0.3)] hover:-translate-y-0.5"
          >
            <TrendingUp size={16} />
            Run Price Check
            <span className="px-1.5 py-0.5 rounded-md bg-primary-foreground/20 text-[10px] font-mono">
              {firstItemFree ? 'Free' : '1 cr'}
            </span>
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {isPricing && (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {hasData && !isPricing && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="space-y-5"
          >
            <MarketRangeBar
              priceRange={item.priceRange!}
              chosenPrice={item.chosenPrice}
            />

            {/* Strategy cards */}
            <div className="grid grid-cols-3 gap-3">
              {STRATEGIES.map(s => {
                const selected = item.priceStrategy === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => dispatch({ type: 'SET_PRICE_STRATEGY', strategy: s.id })}
                    className={`rounded-xl border p-3 flex flex-col items-center gap-1.5 transition-all min-h-[44px] ${
                      selected
                        ? "border-primary bg-primary/5 shadow-[0_0_0_2px_hsla(350,80%,58%,0.15)]"
                        : "border-border hover:border-primary/40 hover:bg-surface-sunken"
                    }`}
                  >
                    <span className={selected ? "text-primary" : "text-muted-foreground"}>
                      {s.icon}
                    </span>
                    <span className={`font-mono text-lg font-bold ${selected ? "text-primary" : "text-foreground"}`}>
                      £{strategyPrice(s.id)}
                    </span>
                    <span className="text-[11px] font-medium text-foreground">{s.label}</span>
                    <span className="text-[10px] text-muted-foreground">{s.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Manual override */}
            <div className="bg-surface-sunken border border-border rounded-xl p-4">
              <label className="block text-xs font-medium text-foreground mb-2">
                Or enter your own price
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono text-muted-foreground">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.chosenPrice ?? ''}
                  onChange={e => dispatch({ type: 'SET_CHOSEN_PRICE', price: parseFloat(e.target.value) || 0 })}
                  className="flex-1 bg-transparent font-mono text-lg font-bold text-foreground focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
