import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SellWizardState, SellWizardAction } from "@/lib/sell-wizard-state";
import { useOptimiseListing } from "@/hooks/useOptimiseListing";

interface StepOptimiseProps {
  state: SellWizardState;
  dispatch: React.Dispatch<SellWizardAction>;
}

export function StepOptimise({ state, dispatch }: StepOptimiseProps) {
  const { item, isOptimising, firstItemFree } = state;
  const hasData = !!item.optimisedTitle;
  const optimise = useOptimiseListing();

  async function generate() {
    dispatch({ type: 'SET_OPTIMISING', loading: true });
    try {
      const result = await optimise.mutateAsync({
        title: item.title,
        description: item.description,
        brand: item.brand,
        category: item.category,
        size: item.size,
        condition: item.condition,
        colour: item.color,
        photoUrls: item.enhancedPhotos.map((e, i) => e ?? item.originalPhotos[i]).filter(Boolean) as string[],
        sell_wizard: true,
      });
      dispatch({
        type: 'SET_OPTIMISED_DATA',
        title: result.optimised_title,
        description: result.optimised_description,
        hashtags: result.hashtags,
      });
    } catch (err) {
      // error handled by toast in hook
    } finally {
      dispatch({ type: 'SET_OPTIMISING', loading: false });
    }
  }

  return (
    <div className="space-y-6">
      {!hasData && !isOptimising && (
        <div className="text-center py-8 space-y-5">
          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground">Ready to write your listing</p>
            <p className="text-sm text-muted-foreground">
              AI will generate an optimised title, description, and hashtags based on your item details.
            </p>
          </div>
          <button
            onClick={generate}
            className="min-h-[44px] px-8 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors shadow-[0_4px_14px_hsla(350,80%,58%,0.3)] hover:-translate-y-0.5"
          >
            <Sparkles size={16} />
            Generate Optimised Listing
            {!firstItemFree && (
              <span className="px-1.5 py-0.5 rounded-md bg-primary-foreground/20 text-[10px] font-mono">
                1 cr
              </span>
            )}
            {firstItemFree && (
              <span className="px-1.5 py-0.5 rounded-md bg-primary-foreground/20 text-[10px] font-mono">
                Free
              </span>
            )}
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {isOptimising && (
        <div className="space-y-5">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
      )}

      {/* Generated content */}
      <AnimatePresence>
        {hasData && !isOptimising && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="space-y-5"
          >
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-foreground">Title</label>
                <span className="text-xs text-muted-foreground font-mono">
                  {item.optimisedTitle.length} / 100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={item.optimisedTitle}
                onChange={e =>
                  dispatch({ type: 'SET_ITEM_DATA', payload: { optimisedTitle: e.target.value } })
                }
                className="w-full bg-surface-sunken border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-foreground">Description</label>
                <span className="text-xs text-muted-foreground font-mono">
                  {item.optimisedDescription.length} / 500
                </span>
              </div>
              <textarea
                rows={5}
                maxLength={500}
                value={item.optimisedDescription}
                onChange={e =>
                  dispatch({ type: 'SET_ITEM_DATA', payload: { optimisedDescription: e.target.value } })
                }
                className="w-full bg-surface-sunken border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">
                Hashtags <span className="text-muted-foreground font-normal">(tap to remove)</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {item.hashtags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => dispatch({ type: 'TOGGLE_HASHTAG', tag })}
                    className="px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/15 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Regenerate */}
            <button
              onClick={generate}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={13} />
              ↻ Regenerate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
