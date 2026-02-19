import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Camera,
  PlusCircle,
  Package,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock data (replace with real auth context in Phase 3) ──────────────────
const MOCK_USER = {
  displayName: "Jamie",
  tierLabel: "Pro",
  creditsRemaining: 47,
  creditsLimit: 50,
  isUnlimited: false,
};

const PRIMARY_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Photo Studio", icon: Camera, to: "/vintography" },
  { label: "Sell", icon: PlusCircle, to: "/sell", brightInactive: true },
  { label: "My Items", icon: Package, to: "/listings" },
];

function CreditMeter({
  remaining,
  limit,
  isUnlimited,
}: {
  remaining: number;
  limit: number;
  isUnlimited: boolean;
}) {
  const pct = Math.min(100, (remaining / limit) * 100);
  const barColor =
    remaining === 0
      ? "bg-destructive"
      : remaining / limit <= 0.2
        ? "bg-warning"
        : "bg-primary";
  const showTopUp = remaining <= 5 && !isUnlimited;

  return (
    <div className="rounded-xl p-3.5 bg-white/[0.06] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 font-sans">Credits</span>
        {isUnlimited ? (
          <span className="font-mono text-xs text-white/80">∞ Unlimited</span>
        ) : (
          <span className="font-mono text-xs text-white/80">
            {remaining} / {limit}
          </span>
        )}
      </div>

      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", barColor)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          />
        </div>
      )}

      <AnimatePresence>
        {showTopUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Link
              to="/settings"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Top up →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const { displayName, tierLabel, creditsRemaining, creditsLimit, isUnlimited } = MOCK_USER;

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-30"
      style={{ background: "hsl(230, 20%, 8%)" }}
    >
      {/* Wordmark */}
      <div className="px-5 pt-6 pb-4">
        <Link
          to="/dashboard"
          className="font-display text-xl font-bold text-primary tracking-tight hover:opacity-90 transition-opacity"
        >
          Vintifi
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-none px-3 space-y-0.5">
        {PRIMARY_NAV.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                isActive
                  ? "text-primary"
                  : item.brightInactive
                    ? "text-white/75 hover:text-white/90 hover:bg-white/[0.06]"
                    : "text-sidebar-muted hover:text-white/80 hover:bg-white/[0.06]",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "hsl(350 80% 58% / 0.12)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={18} className="relative z-10 flex-shrink-0" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Credits meter */}
      <div className="px-3 pb-3">
        <CreditMeter
          remaining={creditsRemaining}
          limit={creditsLimit}
          isUnlimited={isUnlimited}
        />
      </div>

      {/* User profile row */}
      <div
        className="px-3 pb-5 pt-3 flex items-center gap-3"
        style={{ borderTop: "1px solid hsl(0 0% 100% / 0.08)" }}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary font-display">
            {displayName[0].toUpperCase()}
          </span>
        </div>

        {/* Name + tier */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate">{displayName}</p>
          <p className="text-xs text-white/40">{tierLabel}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            to="/settings"
            className="p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings size={15} />
          </Link>
          <button
            className="p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Sign out"
            onClick={() => console.log("sign out — wired in Phase 3")}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
