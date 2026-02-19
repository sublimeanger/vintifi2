import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ThumbnailGrid } from "./shared";
import { cn } from "@/lib/utils";
import type { OperationParams } from "@/lib/vintography-state";

interface ModelShotWizardProps {
  params: OperationParams;
  onChange: (params: Partial<OperationParams>) => void;
  wizardStep: number;
  onWizardStep: (step: number) => void;
}

const GENDER_OPTIONS = [
  { value: 'woman', label: 'Woman', emoji: '👩' },
  { value: 'man', label: 'Man', emoji: '👨' },
];

const LOOK_OPTIONS = [
  { value: '1', label: 'Look 1', emoji: '1️⃣' },
  { value: '2', label: 'Look 2', emoji: '2️⃣' },
  { value: '3', label: 'Look 3', emoji: '3️⃣' },
  { value: '4', label: 'Look 4', emoji: '4️⃣' },
  { value: '5', label: 'Look 5', emoji: '5️⃣' },
  { value: '6', label: 'Look 6', emoji: '6️⃣' },
];

const POSE_OPTIONS = [
  { value: 'standing', label: 'Standing', emoji: '🧍' },
  { value: 'walking', label: 'Walking', emoji: '🚶' },
  { value: 'sitting', label: 'Sitting', emoji: '🪑' },
  { value: 'leaning', label: 'Leaning', emoji: '🤸' },
  { value: 'candid', label: 'Candid', emoji: '📸' },
  { value: 'editorial', label: 'Editorial', emoji: '✨' },
];

const BACKGROUND_OPTIONS = [
  { value: 'studio_white', label: 'Studio White', color: '#FAFAFA' },
  { value: 'studio_grey', label: 'Studio Grey', color: '#C8C8C8' },
  { value: 'urban', label: 'Urban', emoji: '🏙️' },
  { value: 'beach', label: 'Beach', emoji: '🏖️' },
  { value: 'garden', label: 'Garden', emoji: '🌿' },
  { value: 'cafe', label: 'Café', emoji: '☕' },
  { value: 'rooftop', label: 'Rooftop', emoji: '🌇' },
  { value: 'minimal', label: 'Minimal', color: '#F0EDE8' },
];

const STEP_TITLES = ['Model & Style', 'Pose & Background', 'Review'];

export function ModelShotWizard({ params, onChange, wizardStep, onWizardStep }: ModelShotWizardProps) {
  const [direction, setDirection] = useState(1);

  function goNext() {
    setDirection(1);
    onWizardStep(wizardStep + 1);
  }

  function goBack() {
    setDirection(-1);
    onWizardStep(wizardStep - 1);
  }

  const canGoNext1 = !!params.gender && !!params.look;
  const canGoNext2 = !!params.pose && !!params.modelBackground;

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5 justify-center mb-3">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                "rounded-full transition-all duration-200",
                s === wizardStep
                  ? "w-6 h-2 bg-primary"
                  : s < wizardStep
                  ? "w-2 h-2 bg-primary/40"
                  : "w-2 h-2 bg-border"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground font-medium">
          Step {wizardStep} of 3 — {STEP_TITLES[wizardStep - 1]}
        </p>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={wizardStep}
            custom={direction}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="px-4 pb-4 space-y-5"
          >
            {wizardStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {GENDER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => onChange({ gender: opt.value })}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        params.gender === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border-hover"
                      )}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <ThumbnailGrid
                  label="Model Look"
                  options={LOOK_OPTIONS}
                  value={params.look ?? '1'}
                  onChange={v => onChange({ look: v })}
                  columns={3}
                />
              </>
            )}

            {wizardStep === 2 && (
              <>
                <ThumbnailGrid
                  label="Pose"
                  options={POSE_OPTIONS}
                  value={params.pose ?? 'standing'}
                  onChange={v => onChange({ pose: v })}
                  columns={2}
                />
                <ThumbnailGrid
                  label="Background"
                  options={BACKGROUND_OPTIONS}
                  value={params.modelBackground ?? 'studio_white'}
                  onChange={v => onChange({ modelBackground: v })}
                  columns={4}
                />
              </>
            )}

            {wizardStep === 3 && (
              <>
                {/* Summary card */}
                <div className="bg-surface-sunken rounded-xl p-4 space-y-2 text-sm mt-2">
                  <p className="font-semibold text-foreground mb-3">Summary</p>
                  {[
                    ['Model', params.gender === 'woman' ? 'Woman' : 'Man'],
                    ['Look', `Look ${params.look}`],
                    ['Pose', params.pose ?? 'Standing'],
                    ['Background', params.modelBackground?.replace('_', ' ') ?? 'Studio White'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium capitalize">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Full garment toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Show full garment</p>
                    <p className="text-xs text-muted-foreground">Include sleeves, hem, and collar</p>
                  </div>
                  <Switch
                    checked={params.fullGarment ?? true}
                    onCheckedChange={v => onChange({ fullGarment: v })}
                  />
                </div>

                {/* Description textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Additional description (optional)
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                    rows={3}
                    placeholder="e.g. show the label, open jacket, etc."
                    value={params.description ?? ''}
                    onChange={e => onChange({ description: e.target.value })}
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        {wizardStep > 1 && (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-surface-sunken transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
        {wizardStep < 3 && (
          <button
            onClick={goNext}
            disabled={wizardStep === 1 ? !canGoNext1 : !canGoNext2}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 justify-center",
              (wizardStep === 1 ? canGoNext1 : canGoNext2)
                ? "bg-primary text-primary-foreground shadow-primary hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Next
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
