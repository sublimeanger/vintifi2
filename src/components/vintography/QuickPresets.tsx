import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VintographyState, VintographyAction } from "@/lib/vintography-state";

interface Preset {
  id: string;
  label: string;
  operations: string[];
  credits: number;
  tier: 'free' | 'pro';
}

const PRESETS: Preset[] = [
  { id: 'marketplace', label: 'Marketplace Ready', operations: ['clean_bg', 'enhance'], credits: 2, tier: 'free' },
  { id: 'editorial', label: 'Editorial', operations: ['lifestyle_bg'], credits: 1, tier: 'pro' },
  { id: 'quick_clean', label: 'Quick Clean', operations: ['clean_bg'], credits: 1, tier: 'free' },
  { id: 'steam_list', label: 'Steam & List', operations: ['steam', 'clean_bg'], credits: 2, tier: 'free' },
];

const MOCK_TIER: 'free' | 'pro' = 'pro';

function isPresetActive(state: VintographyState, preset: Preset): boolean {
  const pipelineOps = state.pipeline.map(s => s.operation);
  if (pipelineOps.length !== preset.operations.length) return false;
  return preset.operations.every((op, i) => pipelineOps[i] === op);
}

interface QuickPresetsProps {
  state: VintographyState;
  dispatch: React.Dispatch<VintographyAction>;
}

export function QuickPresets({ state, dispatch }: QuickPresetsProps) {
  function applyPreset(preset: Preset) {
    // Reset pipeline then add each step
    // We do this by clearing and re-adding
    const ops = preset.operations;
    // Dispatch a sequence: clear pipeline then add each step
    // Since we can't do multiple dispatches cleanly, we rely on SELECT_OPERATION
    // For presets, we want to set the pipeline directly - use ADD_PIPELINE_STEP pattern
    // Simple approach: remove all then add
    state.pipeline.forEach(s => dispatch({ type: 'REMOVE_PIPELINE_STEP', id: s.id }));
    // Use setTimeout(0) to let removals settle
    setTimeout(() => {
      ops.forEach(op => dispatch({ type: 'ADD_PIPELINE_STEP', operation: op as any }));
    }, 0);
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-3 py-2">
      {PRESETS.map(preset => {
        const active = isPresetActive(state, preset);
        const locked = preset.tier === 'pro' && MOCK_TIER === 'free';

        return (
          <button
            key={preset.id}
            onClick={() => !locked && applyPreset(preset)}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-surface border-border text-foreground hover:border-border-hover"
            )}
          >
            {locked && <Lock size={12} className="text-accent" />}
            <span>{preset.label}</span>
            <span className={cn("font-mono text-[11px]", active ? "text-primary-foreground/70" : "text-muted-foreground")}>
              {preset.credits}cr
            </span>
          </button>
        );
      })}
    </div>
  );
}
