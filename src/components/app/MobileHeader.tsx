import { Link } from "react-router-dom";
import { Sparkles, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Mock data (Phase 3: replace with auth context) ─────────────────────────
const CREDITS = 47;
const CREDITS_LIMIT = 50;

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  const isCritical = CREDITS <= 2;
  const isLow = CREDITS / CREDITS_LIMIT <= 0.2 && !isCritical;
  // Normal: neutral background, coral sparkle icon (per spec §3.2)
  const isNormal = !isCritical && !isLow;

  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center px-4 gap-3 border-b border-border/60 backdrop-blur-xl lg:hidden"
      style={{ background: "hsl(var(--background) / 0.92)" }}
    >
      {/* Logo */}
      <Link
        to="/dashboard"
        className="font-display text-lg font-bold text-primary tracking-tight flex-1"
      >
        Vintifi
      </Link>

      {/* Credits pill */}
      <Link
        to="/settings"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-colors min-h-[32px]",
          isCritical
            ? "bg-destructive/10 text-destructive"
            : isLow
              ? "bg-warning/10 text-warning"
              : "bg-muted text-foreground", // Normal: neutral bg, foreground text
        )}
        aria-label={`${CREDITS} credits remaining`}
      >
        {isCritical ? (
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="flex items-center gap-1.5"
          >
            {/* Critical: amber/red sparkle */}
            <Sparkles size={12} />
            <span>{CREDITS}</span>
          </motion.div>
        ) : (
          <>
            {/* Normal state: coral sparkle per spec; Low: amber via parent text colour */}
            <Sparkles
              size={12}
              className={isNormal ? "text-primary" : undefined}
            />
            <span>{CREDITS}</span>
          </>
        )}
      </Link>

      {/* Hamburger */}
      <button
        onClick={onMenuOpen}
        className="flex items-center justify-center rounded-lg hover:bg-surface-sunken transition-colors min-h-[44px] min-w-[44px]"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
    </header>
  );
}
