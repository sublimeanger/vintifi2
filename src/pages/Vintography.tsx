import { useReducer, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/app/PageTransition";
import { UpgradeModal } from "@/components/app/UpgradeModal";
import { PhotoCanvas } from "@/components/vintography/PhotoCanvas";
import { QuickPresets } from "@/components/vintography/QuickPresets";
import { OperationBar } from "@/components/vintography/OperationBar";
import { ConfigContainer } from "@/components/vintography/ConfigContainer";
import { ResultActions } from "@/components/vintography/ResultActions";
import { StudioEmptyState } from "@/components/vintography/StudioEmptyState";
import { PreviousEdits } from "@/components/vintography/PreviousEdits";
import { vintographyReducer, initialState } from "@/lib/vintography-state";

export default function Vintography() {
  const [state, dispatch] = useReducer(vintographyReducer, initialState);
  const [searchParams] = useSearchParams();

  // Handle deep links from Sell Wizard
  useEffect(() => {
    const imageUrl = searchParams.get('imageUrl');
    if (imageUrl && !state.originalPhotoUrl) {
      dispatch({ type: 'SET_PHOTO', url: imageUrl });
    }
  }, [searchParams]);

  // Empty state: no photo loaded
  if (!state.originalPhotoUrl) {
    return (
      <PageTransition>
        <div className="max-w-lg mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
              Photo Studio
            </h1>
            <p className="text-sm text-muted-foreground mt-1">AI-powered product photography</p>
          </div>
          <StudioEmptyState dispatch={dispatch} />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* ── Desktop Layout ── */}
      <div className="hidden lg:flex gap-6 items-start">
        {/* Left panel: 400px, sticky */}
        <div
          className="w-[400px] flex-shrink-0 sticky top-8 flex flex-col rounded-2xl border border-border bg-surface overflow-hidden"
          style={{ maxHeight: "calc(100vh - 64px)" }}
        >
          <div className="px-3 pt-3 pb-1">
            <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
              Photo Studio
            </h1>
          </div>
          <QuickPresets state={state} dispatch={dispatch} />
          <div className="border-t border-border">
            <OperationBar state={state} dispatch={dispatch} />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <ConfigContainer state={state} dispatch={dispatch} />
          </div>
        </div>

        {/* Right panel: photo + results */}
        <div className="flex-1 space-y-4">
          <PhotoCanvas state={state} />
          {state.resultPhotoUrl && (
            <ResultActions state={state} dispatch={dispatch} />
          )}
          <PreviousEdits onSelect={url => dispatch({ type: 'SET_PHOTO', url })} />
        </div>
      </div>

      {/* ── Mobile Layout ── */}
      <div className="lg:hidden space-y-0">
        {/* Sticky canvas */}
        <PhotoCanvas state={state} />

        {/* Scrollable content below */}
        <div className="space-y-1 pt-2">
          <QuickPresets state={state} dispatch={dispatch} />
          <OperationBar state={state} dispatch={dispatch} />

          {state.resultPhotoUrl && (
            <div className="px-1">
              <ResultActions state={state} dispatch={dispatch} />
            </div>
          )}

          <PreviousEdits onSelect={url => dispatch({ type: 'SET_PHOTO', url })} />
        </div>

        {/* BottomSheet drawer — rendered outside flow */}
        <ConfigContainer state={state} dispatch={dispatch} />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={state.upgradeModalOpen}
        onClose={() => dispatch({ type: 'CLOSE_UPGRADE_MODAL' })}
      />
    </PageTransition>
  );
}
