import { Eraser, ImageIcon, Sparkles, Wind, LayoutGrid, PersonStanding, UserCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Operation, VintographyState, UserTier } from "@/lib/vintography-state";
import { isOperationLocked } from "@/lib/vintography-state";
import type { VintographyAction } from "@/lib/vintography-state";
import { useAuth } from "@/contexts/AuthContext";

interface OperationDef {
  id: Operation;
  label: string;
  icon: React.ReactNode;
  credits: number;
  tier: UserTier;
}

const OPERATIONS: OperationDef[] = [
  { id: 'clean_bg', label: 'Remove BG', icon: <Eraser size={20} />, credits: 1, tier: 'free' },
  { id: 'lifestyle_bg', label: 'Lifestyle', icon: <ImageIcon size={20} />, credits: 1, tier: 'free' },
  { id: 'enhance', label: 'Enhance', icon: <Sparkles size={20} />, credits: 1, tier: 'free' },
  { id: 'steam', label: 'Steam', icon: <Wind size={20} />, credits: 1, tier: 'pro' },
  { id: 'flatlay', label: 'Flat Lay', icon: <LayoutGrid size={20} />, credits: 1, tier: 'pro' },
  { id: 'mannequin', label: 'Mannequin', icon: <PersonStanding size={20} />, credits: 1, tier: 'pro' },
  { id: 'ai_model', label: 'AI Model', icon: <UserCircle2 size={20} />, credits: 4, tier: 'business' },
];

interface OperationBarProps {
  state: VintographyState;
  dispatch: React.Dispatch<VintographyAction>;
}

function OperationButton({
  op,
  isSelected,
  locked,
  onSelect,
  onDeselect,
  onLocked,
}: {
  op: OperationDef;
  isSelected: boolean;
  locked: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onLocked: () => void;
}) {
  function handleClick() {
    if (locked) { onLocked(); return; }
    if (isSelected) { onDeselect(); return; }
    onSelect();
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[72px] lg:min-w-0",
        isSelected
          ? "bg-primary/10 ring-2 ring-primary text-primary"
          : locked
          ? "opacity-60 text-muted-foreground hover:bg-surface-sunken"
          : "text-foreground hover:bg-surface-sunken"
      )}
    >
      {locked && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center z-10">
          <Lock size={9} color="white" strokeWidth={3} />
        </span>
      )}
      <span className={cn(isSelected ? "text-primary" : "text-foreground/70")}>
        {op.icon}
      </span>
      <span className="text-[11px] font-medium leading-tight text-center">{op.label}</span>
      <span className="text-[9px] font-mono text-muted-foreground">{op.credits}cr</span>
    </button>
  );
}

export function OperationBar({ state, dispatch }: OperationBarProps) {
  const { profile } = useAuth();
  const selectedOperations = new Set(state.pipeline.map(s => s.operation));
  // Map subscription_tier to UserTier for lock checking
  const tier: UserTier =
    profile?.subscription_tier === 'business' || profile?.subscription_tier === 'scale' || profile?.subscription_tier === 'enterprise'
      ? 'business'
      : profile?.subscription_tier === 'pro'
      ? 'pro'
      : 'free';

  return (
    <>
      {/* Desktop: 4-col grid */}
      <div className="hidden lg:grid grid-cols-4 gap-2 p-3">
        {OPERATIONS.map(op => (
          <OperationButton
            key={op.id}
            op={op}
            isSelected={selectedOperations.has(op.id)}
            locked={isOperationLocked(op.id, tier)}
            onSelect={() => dispatch({ type: 'SELECT_OPERATION', operation: op.id })}
            onDeselect={() => dispatch({ type: 'DESELECT_OPERATION' })}
            onLocked={() => dispatch({ type: 'OPEN_UPGRADE_MODAL' })}
          />
        ))}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide px-1 py-2">
        {OPERATIONS.map(op => (
          <OperationButton
            key={op.id}
            op={op}
            isSelected={selectedOperations.has(op.id)}
            locked={isOperationLocked(op.id, tier)}
            onSelect={() => dispatch({ type: 'SELECT_OPERATION', operation: op.id })}
            onDeselect={() => dispatch({ type: 'DESELECT_OPERATION' })}
            onLocked={() => dispatch({ type: 'OPEN_UPGRADE_MODAL' })}
          />
        ))}
      </div>
    </>
  );
}
