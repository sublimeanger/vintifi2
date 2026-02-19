import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { cn } from "@/lib/utils";
import type { VintographyState, Operation } from "@/lib/vintography-state";

interface PhotoCanvasProps {
  state: VintographyState;
}

function getProcessingLabel(operation: Operation): string {
  const map: Record<Operation, string> = {
    clean_bg: "Removing background…",
    lifestyle_bg: "Generating lifestyle scene…",
    enhance: "Enhancing photo…",
    decrease: "Optimising file size…",
    flatlay: "Creating flat lay…",
    mannequin: "Placing on mannequin…",
    steam: "De-wrinkling garment…",
    ai_model: "Generating model shot…",
  };
  return map[operation] ?? "Processing…";
}

export function PhotoCanvas({ state }: PhotoCanvasProps) {
  const { canvasState, originalPhotoUrl, resultPhotoUrl, pipeline, processingStepIndex } = state;
  const activeOperation = pipeline[processingStepIndex]?.operation;
  const totalSteps = pipeline.length;

  const inner = (
    <div className="relative rounded-xl overflow-hidden bg-surface shadow-lg aspect-[4/5] lg:aspect-auto lg:max-h-[calc(100vh-200px)]">
      {/* Photo */}
      {originalPhotoUrl && (
        <img
          src={originalPhotoUrl}
          alt="Product"
          className="w-full h-full object-cover"
        />
      )}

      {/* Processing overlay */}
      <AnimatePresence>
        {canvasState === 'processing' && (
          <>
            {/* Breathing glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                boxShadow: [
                  "inset 0 0 0px 0px hsla(350,80%,58%,0)",
                  "inset 0 0 40px 8px hsla(350,80%,58%,0.15)",
                  "inset 0 0 0px 0px hsla(350,80%,58%,0)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Processing chip */}
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-lg"
              style={{ background: "hsla(230,20%,12%,0.8)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <Loader2 size={14} className="animate-spin text-primary" />
              <span className="text-white text-xs font-medium">
                {activeOperation ? getProcessingLabel(activeOperation) : "Processing…"}
              </span>
              {totalSteps > 1 && (
                <span className="text-white/50 text-xs font-mono">
                  ({processingStepIndex + 1}/{totalSteps})
                </span>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Result: BeforeAfterSlider */}
      <AnimatePresence>
        {canvasState === 'result' && resultPhotoUrl && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <BeforeAfterSlider
              beforeSrc={originalPhotoUrl ?? undefined}
              afterSrc={resultPhotoUrl}
              beforeLabel="Before"
              afterLabel="After"
              className="w-full h-full"
              autoReveal
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile: sticky below header */}
      <div className="lg:hidden sticky top-14 z-10 -mx-4 px-4 pb-3 bg-background">
        {inner}
      </div>
      {/* Desktop: normal flow */}
      <div className="hidden lg:block">
        {inner}
      </div>
    </>
  );
}
