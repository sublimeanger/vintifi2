import { ArrowLeft, Loader2 } from "lucide-react";

const NEXT_LABELS: Record<number, string> = {
  1: "Continue to Photos",
  3: "Continue to Pricing",
  4: "See Your Listing Pack",
  5: "Save & Finish ✓",
};

interface WizardFooterProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  nextDisabled?: boolean;
  isLoading?: boolean;
  backOnly?: boolean;
}

export function WizardFooter({
  currentStep,
  onNext,
  onPrev,
  nextDisabled = false,
  isLoading = false,
  backOnly = false,
}: WizardFooterProps) {
  const label = NEXT_LABELS[currentStep] ?? "Continue";

  return (
    <div className="border-t border-border mt-10 pt-6 flex items-center justify-between">
      {/* Previous */}
      {currentStep > 1 ? (
        <button
          onClick={onPrev}
          disabled={isLoading}
          className="min-h-[44px] px-5 rounded-xl border border-border text-sm font-medium text-foreground flex items-center gap-2 hover:bg-surface-sunken transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      ) : (
        <div />
      )}

      {/* Next — hidden in backOnly mode */}
      {!backOnly && (
        <button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className={`min-h-[44px] px-6 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
            nextDisabled || isLoading
              ? "bg-surface-sunken text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground shadow-[0_4px_14px_hsla(350,80%,58%,0.3)] hover:-translate-y-0.5 hover:bg-primary/90"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Processing…
            </>
          ) : (
            label
          )}
        </button>
      )}
    </div>
  );
}
