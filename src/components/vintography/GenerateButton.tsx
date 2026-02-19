import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VintographyState, VintographyAction } from "@/lib/vintography-state";
import { getPipelineCredits } from "@/lib/vintography-state";
import { processImage } from "@/lib/vintography-api";
import { useAuth } from "@/contexts/AuthContext";

interface GenerateButtonProps {
  state: VintographyState;
  dispatch: React.Dispatch<VintographyAction>;
}

export function GenerateButton({ state, dispatch }: GenerateButtonProps) {
  const { profile, refreshProfile } = useAuth();
  const { pipeline, isProcessing, activeStepId, modelWizardStep } = state;
  const activeStep = pipeline.find(s => s.id === activeStepId);

  // Hide when in AI Model wizard and not on step 3
  if (activeStep?.operation === 'ai_model' && modelWizardStep < 3) return null;

  const credits = getPipelineCredits(pipeline);
  const disabled = pipeline.length === 0 || isProcessing;

  async function handleGenerate() {
    if (disabled || !state.originalPhotoUrl) return;

    dispatch({ type: 'START_PROCESSING' });

    let currentUrl = state.originalPhotoUrl;
    try {
      for (let i = 0; i < pipeline.length; i++) {
        const step = pipeline[i];
        const result = await processImage(currentUrl, step.operation, step.params);
        if (!result.success) throw new Error(result.error ?? 'Processing failed');
        currentUrl = result.imageUrl;
        if (i < pipeline.length - 1) {
          dispatch({ type: 'PROCESSING_STEP_COMPLETE', stepIndex: i, imageUrl: currentUrl });
        }
      }
      dispatch({ type: 'PROCESSING_COMPLETE', imageUrl: currentUrl });
      // Refresh credits after successful processing
      await refreshProfile();
    } catch (err) {
      dispatch({ type: 'PROCESSING_ERROR', error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  return (
    <motion.button
      onClick={handleGenerate}
      disabled={disabled}
      whileHover={!disabled ? { y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={cn(
        "w-full min-h-[44px] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
        disabled
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-primary text-primary-foreground shadow-primary hover:bg-primary/90"
      )}
      style={!disabled ? { boxShadow: "0 4px 14px hsla(350,80%,58%,0.3)" } : undefined}
    >
      {isProcessing ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Processing…
        </>
      ) : (
        <>
          ✨ Generate · {credits} credit{credits !== 1 ? 's' : ''}
        </>
      )}
    </motion.button>
  );
}
