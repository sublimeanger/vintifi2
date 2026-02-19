import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { GenerateButton } from "./GenerateButton";
import { OperationConfig } from "./OperationConfig";
import { PipelineStrip } from "./PipelineStrip";
import type { VintographyState, VintographyAction, Operation } from "@/lib/vintography-state";
import type { SheetHeight } from "@/components/ui/BottomSheet";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

function getDrawerHeight(operation: Operation | undefined): SheetHeight {
  if (!operation) return 'sm';
  switch (operation) {
    case 'ai_model': return 'lg';
    case 'lifestyle_bg': return 'md';
    case 'mannequin': return 'md';
    default: return 'sm';
  }
}

interface ConfigContainerProps {
  state: VintographyState;
  dispatch: React.Dispatch<VintographyAction>;
}

export function ConfigContainer({ state, dispatch }: ConfigContainerProps) {
  const isDesktop = useIsDesktop();
  const activeStep = state.pipeline.find(s => s.id === state.activeStepId);
  const drawerHeight = getDrawerHeight(activeStep?.operation);

  if (isDesktop) {
    // Desktop: inline flex column with sticky generate footer
    return (
      <div className="flex flex-col h-full border-t border-border">
        <div className="flex-1 overflow-y-auto">
          <PipelineStrip state={state} dispatch={dispatch} />
          {activeStep && <OperationConfig state={state} dispatch={dispatch} />}
          {!activeStep && state.pipeline.length > 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Select a step above to configure it.</p>
          )}
        </div>
        {state.pipeline.length > 0 && (
          <div className="relative">
            {/* Gradient fade */}
            <div
              className="absolute -top-6 left-0 right-0 h-6 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--background)))" }}
            />
            <div className="px-3 pb-3 pt-1">
              <GenerateButton state={state} dispatch={dispatch} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile: BottomSheet
  return (
    <BottomSheet
      isOpen={state.drawerOpen}
      onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}
      height={drawerHeight}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <PipelineStrip state={state} dispatch={dispatch} />
          {activeStep && <OperationConfig state={state} dispatch={dispatch} />}
        </div>
        <div className="px-4 pb-4 pt-2">
          <GenerateButton state={state} dispatch={dispatch} />
        </div>
      </div>
    </BottomSheet>
  );
}
