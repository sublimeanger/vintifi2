import { useReducer, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageTransition } from "@/components/app/PageTransition";
import { WizardProgress } from "@/components/sell/WizardProgress";
import { WizardFooter } from "@/components/sell/WizardFooter";
import { FirstItemFreeBanner } from "@/components/sell/FirstItemFreeBanner";
import { StepAddItem } from "@/components/sell/steps/StepAddItem";
import { StepPhotos } from "@/components/sell/steps/StepPhotos";
import { StepOptimise } from "@/components/sell/steps/StepOptimise";
import { StepPrice } from "@/components/sell/steps/StepPrice";
import { StepPack } from "@/components/sell/steps/StepPack";
import {
  sellWizardReducer,
  initialWizardState,
  sessionRecoveryInit,
  saveWizardSession,
} from "@/lib/sell-wizard-state";
import { useAuth } from "@/contexts/AuthContext";

export default function Sell() {
  const { profile } = useAuth();
  const [state, dispatch] = useReducer(
    sellWizardReducer,
    initialWizardState,
    sessionRecoveryInit
  );
  const [showValidation, setShowValidation] = useState(false);

  // Sync firstItemFree from real profile data once profile loads
  useEffect(() => {
    if (profile !== null) {
      const firstItemFree = profile.first_item_pass_used === false;
      if (state.firstItemFree !== firstItemFree) {
        dispatch({ type: 'SET_FIRST_ITEM_FREE', value: firstItemFree });
      }
    }
  }, [profile?.first_item_pass_used]);

  // Persist state to sessionStorage on every change
  useEffect(() => {
    saveWizardSession(state);
  }, [state]);

  // On mount: pick up Photo Studio result from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('vintifi_studio_result');
    if (raw) {
      try {
        const { photoIndex, resultUrl } = JSON.parse(raw);
        dispatch({ type: 'SET_ENHANCED_PHOTO', index: photoIndex, url: resultUrl });
      } catch {
        // malformed — ignore
      } finally {
        sessionStorage.removeItem('vintifi_studio_result');
      }
    }
  }, []);

  function handleNext() {
    // Step 1 validation
    if (state.currentStep === 1) {
      const { item } = state;
      const valid =
        item.title.trim() &&
        item.brand.trim() &&
        item.category &&
        item.size.trim() &&
        item.condition &&
        item.originalPhotos.length > 0;
      if (!valid) {
        setShowValidation(true);
        return;
      }
    }
    setShowValidation(false);
    dispatch({ type: 'NEXT_STEP' });
  }

  function handlePrev() {
    setShowValidation(false);
    dispatch({ type: 'PREV_STEP' });
  }

  const { currentStep, completedSteps, direction, firstItemFree } = state;

  // Loading state per step
  const isLoading =
    (currentStep === 1 && state.isImporting) ||
    (currentStep === 3 && state.isOptimising) ||
    (currentStep === 4 && state.isPricing) ||
    (currentStep === 5 && state.isSaving);

  // Next disabled for step 3/4 if no data yet
  const nextDisabled =
    (currentStep === 3 && !state.item.optimisedTitle) ||
    (currentStep === 4 && !state.item.priceRange);

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <StepAddItem
            state={state}
            dispatch={dispatch}
            showValidation={showValidation}
          />
        );
      case 2:
        return <StepPhotos state={state} dispatch={dispatch} />;
      case 3:
        return <StepOptimise state={state} dispatch={dispatch} />;
      case 4:
        return <StepPrice state={state} dispatch={dispatch} />;
      case 5:
        return <StepPack state={state} dispatch={dispatch} />;
      default:
        return null;
    }
  }

  return (
    <PageTransition>
      <div className="max-w-[680px] mx-auto px-4 py-6 lg:py-10">
        {/* Free banner */}
        {firstItemFree && <FirstItemFreeBanner />}

        {/* Progress */}
        <WizardProgress currentStep={currentStep} completedSteps={completedSteps} />

        {/* Step heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
            {currentStep === 1 && "Add Your Item"}
            {currentStep === 2 && "Enhance Your Photos"}
            {currentStep === 3 && "Optimise Your Listing"}
            {currentStep === 4 && "Set Your Price"}
            {currentStep === 5 && "Your Vinted-Ready Pack"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentStep === 1 && "Import from Vinted or fill in the details manually."}
            {currentStep === 2 && "Remove backgrounds or open the full Photo Studio for each photo."}
            {currentStep === 3 && "AI generates a title, description, and hashtags you can edit."}
            {currentStep === 4 && "See what similar items sell for and choose your strategy."}
            {currentStep === 5 && "Everything you need to list on Vinted — ready to copy."}
          </p>
        </div>

        {/* Animated step content */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Footer — not shown on step 2 (has its own continue) or step 5 (has its own save) */}
        {currentStep !== 2 && currentStep !== 5 && (
          <WizardFooter
            currentStep={currentStep}
            onNext={handleNext}
            onPrev={handlePrev}
            nextDisabled={nextDisabled}
            isLoading={isLoading}
          />
        )}
        {/* Step 5 still needs a Previous button */}
        {currentStep === 5 && (
          <div className="border-t border-border mt-10 pt-6">
            <button
              onClick={handlePrev}
              className="min-h-[44px] px-5 rounded-xl border border-border text-sm font-medium text-foreground flex items-center gap-2 hover:bg-surface-sunken transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
