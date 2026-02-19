import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import type { SellWizardState, SellWizardAction } from "@/lib/sell-wizard-state";
import { clearWizardSession } from "@/lib/sell-wizard-state";
import { useUpsertListing } from "@/hooks/useListings";
import { useAuth } from "@/contexts/AuthContext";

interface StepPackProps {
  state: SellWizardState;
  dispatch: React.Dispatch<SellWizardAction>;
}

function CopySection({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-surface-sunken border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <button
          onClick={handleCopy}
          className="text-xs font-medium text-primary flex items-center gap-1 hover:text-primary/80 transition-colors min-h-[32px] px-2"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap break-words">{value}</p>
    </div>
  );
}

export function StepPack({ state, dispatch }: StepPackProps) {
  const { item, isSaving, savedListingId } = state;
  const [copiedAll, setCopiedAll] = useState(false);
  const upsertListing = useUpsertListing();
  const { user, refreshProfile } = useAuth();

  const photo0 = item.originalPhotos[0];
  const enhanced0 = item.enhancedPhotos[0] ?? photo0;

  async function handleSave() {
    dispatch({ type: 'SET_SAVING', loading: true });
    try {
      const conditionMap: Record<string, string> = {
        'New with tags': 'new_with_tags',
        'New without tags': 'new_without_tags',
        'Very good': 'very_good',
        'Good': 'good',
        'Satisfactory': 'satisfactory',
      };
      const saved = await upsertListing.mutateAsync({
        user_id: user!.id,
        title: item.title,
        optimised_title: item.optimisedTitle || undefined,
        description: item.description,
        optimised_description: item.optimisedDescription || undefined,
        brand: item.brand,
        category: item.category,
        size: item.size,
        condition: (conditionMap[item.condition] as any) ?? undefined,
        colour: item.color,
        original_photos: item.originalPhotos,
        enhanced_photos: item.enhancedPhotos.filter(Boolean) as string[],
        hashtags: item.hashtags,
        suggested_price: item.suggestedPrice ?? undefined,
        price_range_low: item.priceRange?.low ?? undefined,
        price_range_median: item.priceRange?.median ?? undefined,
        price_range_high: item.priceRange?.high ?? undefined,
        chosen_price: item.chosenPrice ?? undefined,
        source_url: item.source_url || undefined,
        status: 'draft',
      });
      clearWizardSession();
      dispatch({ type: 'SET_SAVED', listingId: saved.id });
      toast.success('Item saved! 🎉');
      await refreshProfile();
    } catch {
      toast.error('Failed to save — please try again');
      dispatch({ type: 'SET_SAVING', loading: false });
    }
  }
  }

  function handleCopyAll() {
    const text = [
      item.optimisedTitle || item.title,
      '',
      item.optimisedDescription || item.description,
      '',
      item.hashtags.join(' '),
      '',
      `Price: £${item.chosenPrice?.toFixed(2) ?? '—'}`,
    ].join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function handleStartAnother() {
    clearWizardSession();
    dispatch({ type: 'RESET' });
  }

  return (
    <div className="space-y-6">
      {/* Hero before/after */}
      {photo0 && (
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.2 }}
          className="aspect-[4/5] rounded-2xl overflow-hidden"
        >
          <BeforeAfterSlider
            beforeSrc={photo0}
            afterSrc={enhanced0}
            autoReveal={true}
            className="w-full h-full"
          />
        </motion.div>
      )}

      {/* Enhanced photo strip */}
      {item.originalPhotos.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">All photos</span>
            <button
              onClick={() => window.open(item.enhancedPhotos[0] ?? item.originalPhotos[0], '_blank')}
              className="text-xs text-primary hover:underline"
            >
              Download all
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {item.originalPhotos.map((url, i) => (
              <div key={i} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-surface-sunken border border-border">
                <img
                  src={item.enhancedPhotos[i] ?? url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copyable sections */}
      <div className="space-y-3">
        <CopySection
          label="Title"
          value={item.optimisedTitle || item.title || '—'}
        />
        <CopySection
          label="Description"
          value={item.optimisedDescription || item.description || '—'}
        />
        {item.hashtags.length > 0 && (
          <CopySection
            label="Hashtags"
            value={item.hashtags.join(' ')}
          />
        )}

        {/* Price */}
        <div className="bg-surface-sunken border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Price</span>
            <span className="font-mono text-2xl font-bold text-foreground">
              £{item.chosenPrice?.toFixed(2) ?? '—'}
            </span>
            <span className="text-xs text-muted-foreground ml-2 capitalize">{item.priceStrategy}</span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`£${item.chosenPrice?.toFixed(2) ?? ''}`)}
            className="min-h-[36px] px-3 rounded-lg border border-border hover:bg-surface transition-colors flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Copy size={12} />
            Copy
          </button>
        </div>
      </div>

      {/* Actions */}
      {!savedListingId ? (
        <div className="space-y-3">
          <button
            onClick={handleCopyAll}
            className="w-full min-h-[44px] rounded-xl border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-surface-sunken transition-colors"
          >
            {copiedAll ? <Check size={15} /> : <Copy size={15} />}
            {copiedAll ? 'Copied ✓' : 'Copy All to Clipboard'}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-[0_4px_14px_hsla(350,80%,58%,0.3)] hover:-translate-y-0.5"
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              'Save & Finish ✓'
            )}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2"
        >
          <div className="text-center space-y-1">
            <p className="text-base font-semibold text-foreground">🎉 Item saved!</p>
            <p className="text-sm text-muted-foreground">Ready to list it on Vinted? Copy the details above.</p>
          </div>
          <button
            onClick={handleStartAnother}
            className="w-full min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            Start another item →
          </button>
        </motion.div>
      )}
    </div>
  );
}
