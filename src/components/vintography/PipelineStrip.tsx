import { X, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { VintographyState, VintographyAction, Operation } from "@/lib/vintography-state";
import { getPipelineCredits, getOperationCredits, AI_MODEL_CHAIN_ALLOWED } from "@/lib/vintography-state";

const ALL_ADDABLE: { id: Operation; label: string }[] = [
  { id: 'clean_bg', label: 'Remove Background' },
  { id: 'lifestyle_bg', label: 'Lifestyle BG' },
  { id: 'enhance', label: 'Enhance' },
  { id: 'decrease', label: 'Reduce Size' },
  { id: 'steam', label: 'Steam & De-wrinkle' },
  { id: 'flatlay', label: 'Flat Lay' },
  { id: 'mannequin', label: 'Mannequin' },
  { id: 'ai_model', label: 'AI Model Shot' },
];

interface PipelineStripProps {
  state: VintographyState;
  dispatch: React.Dispatch<VintographyAction>;
}

export function PipelineStrip({ state, dispatch }: PipelineStripProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { pipeline, activeStepId } = state;
  const totalCredits = getPipelineCredits(pipeline);

  const usedOps = new Set(pipeline.map(s => s.operation));
  const hasAiModel = pipeline.some(s => s.operation === 'ai_model');

  function getAddableOps(): typeof ALL_ADDABLE {
    if (pipeline.length >= 4) return [];
    return ALL_ADDABLE.filter(op => {
      if (usedOps.has(op.id)) return false;
      if (op.id === 'ai_model' && pipeline.length > 0) return false; // AI model only as first
      if (hasAiModel && !AI_MODEL_CHAIN_ALLOWED.includes(op.id)) return false;
      return true;
    });
  }

  if (pipeline.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {pipeline.map((step, i) => {
          const isActive = step.id === activeStepId;
          const label = ALL_ADDABLE.find(o => o.id === step.operation)?.label ?? step.operation;
          return (
            <div key={step.id} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-muted-foreground/30 flex-shrink-0" />}
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_STEP', id: step.id })}
                className={cn(
                  "flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-full border text-xs font-medium transition-all",
                  isActive
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-surface border-border text-foreground hover:border-border-hover"
                )}
              >
                <span>{label}</span>
                <span className="font-mono text-[10px] opacity-60">{getOperationCredits(step.operation)}cr</span>
                <button
                  onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_PIPELINE_STEP', id: step.id }); }}
                  className="ml-0.5 w-4 h-4 rounded-full hover:bg-foreground/10 flex items-center justify-center transition-colors"
                >
                  <X size={10} />
                </button>
              </button>
            </div>
          );
        })}

        {/* Add Effect Button */}
        {pipeline.length < 4 && (
          <div className="relative">
            <button
              onClick={() => setPopoverOpen(v => !v)}
              className="flex items-center gap-1 pl-2.5 pr-3 py-1.5 rounded-full border-2 border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-all"
            >
              <Plus size={12} />
              Add
            </button>
            {popoverOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPopoverOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 bg-surface border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
                  {getAddableOps().length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">No more effects available</p>
                  ) : (
                    getAddableOps().map(op => (
                      <button
                        key={op.id}
                        onClick={() => {
                          dispatch({ type: 'ADD_PIPELINE_STEP', operation: op.id });
                          setPopoverOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-surface-sunken transition-colors flex items-center justify-between gap-3"
                      >
                        <span>{op.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{getOperationCredits(op.id)}cr</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Credit total */}
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          Total: {totalCredits}cr
        </span>
      </div>
    </div>
  );
}
