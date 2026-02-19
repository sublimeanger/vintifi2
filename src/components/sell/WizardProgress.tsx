import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Add Item" },
  { label: "Photos" },
  { label: "Optimise" },
  { label: "Price" },
  { label: "Pack" },
];

interface WizardProgressProps {
  currentStep: number;
  completedSteps: number[];
}

export function WizardProgress({ currentStep, completedSteps }: WizardProgressProps) {
  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden sm:flex items-start mb-8">
        {STEPS.map((step, i) => {
          const num = i + 1;
          const isPast = completedSteps.includes(num);
          const isCurrent = currentStep === num;
          const isFuture = !isPast && !isCurrent;

          return (
            <div key={num} className="flex items-start flex-1 last:flex-none">
              {/* Node + label */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isPast
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-surface-sunken border-border text-muted-foreground"
                    }`}
                  >
                    {isPast ? (
                      <Check size={16} className="text-primary-foreground" />
                    ) : (
                      <span className="text-xs font-semibold">{num}</span>
                    )}
                  </div>
                  {isCurrent && (
                    <div
                      className="absolute inset-0 rounded-full -m-1"
                      style={{ boxShadow: "0 0 0 4px hsla(350,80%,58%,0.15)" }}
                    />
                  )}
                </div>
                {/* Label */}
                <span
                  className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    isCurrent ? "text-primary" : isPast ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 relative h-[18px] flex items-center mx-1 mt-[18px]">
                  <div className="w-full h-0.5 bg-border rounded-full relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      initial={false}
                      animate={{ width: isPast ? "100%" : isCurrent ? "50%" : "0%" }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Mobile ── */}
      <div className="sm:hidden mb-6">
        <div className="flex items-center gap-1.5 justify-center">
          {STEPS.map((step, i) => {
            const num = i + 1;
            const isPast = completedSteps.includes(num);
            const isCurrent = currentStep === num;

            return (
              <motion.div
                key={num}
                className={`h-2.5 rounded-full transition-colors duration-300 ${
                  isCurrent
                    ? "bg-primary"
                    : isPast
                    ? "bg-primary/60"
                    : "bg-border"
                }`}
                animate={{ width: isCurrent ? 32 : 10 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            );
          })}
        </div>
        {/* Active label */}
        <p className="text-center text-xs text-muted-foreground mt-2">
          Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].label}
        </p>
      </div>
    </>
  );
}
