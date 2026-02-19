import { motion } from "framer-motion";
import { Download, RotateCcw, ArrowLeft } from "lucide-react";
import { Link, NavigateFunction } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { VintographyState, VintographyAction } from "@/lib/vintography-state";

const MOCK_CREDITS = 47;

interface ResultActionsProps {
  state: VintographyState;
  dispatch: React.Dispatch<VintographyAction>;
  returnToWizard?: boolean;
  photoIndex?: number;
  navigate?: NavigateFunction;
}

export function ResultActions({ state, dispatch, returnToWizard, photoIndex = 0, navigate }: ResultActionsProps) {
  const { resultPhotoUrl } = state;
  if (!resultPhotoUrl) return null;

  function handleDownload() {
    window.open(resultPhotoUrl!, '_blank');
  }

  function handleSave() {
    if (returnToWizard && navigate) {
      sessionStorage.setItem('vintifi_studio_result', JSON.stringify({ photoIndex, resultUrl: resultPhotoUrl }));
      navigate('/sell');
      return;
    }
    console.log('[ResultActions] Save to Listing (stub)', resultPhotoUrl);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.3 }}
      className="space-y-3 pt-3"
    >
      {/* Primary actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-primary"
        >
          {returnToWizard ? (
            <><ArrowLeft size={15} />Return to Sell Wizard</>
          ) : (
            'Save to Listing'
          )}
        </button>
        <button
          onClick={handleDownload}
          className="min-h-[44px] w-11 rounded-xl border border-border flex items-center justify-center hover:bg-surface-sunken transition-colors"
          aria-label="Download"
        >
          <Download size={18} className="text-foreground/70" />
        </button>
      </div>

      {/* Try again */}
      <button
        onClick={() => dispatch({ type: 'RESET' })}
        className="w-full min-h-[44px] rounded-xl border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-surface-sunken transition-colors"
      >
        <RotateCcw size={15} />
        Try a different effect
      </button>

      {/* Credits */}
      {MOCK_CREDITS <= 5 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            <span className="font-mono">{MOCK_CREDITS}</span> credits remaining
          </span>
          <Link to="/settings" className="text-xs font-medium text-primary hover:underline">
            Top up →
          </Link>
        </div>
      )}
    </motion.div>
  );
}
