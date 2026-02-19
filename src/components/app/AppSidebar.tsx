import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Camera,
  PlusCircle,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
  const isLow = remaining / limit <= 0.2 && remaining > 0;
  const isCritical = remaining <= 2 && !isUnlimited;
  const isEmpty = remaining === 0;
  const showTopUp = remaining / limit <= 0.2 && !isUnlimited; // ≤20% remaining

  const barColor = isEmpty
    ? "bg-destructive"
    : isLow || isCritical
      ? "bg-warning"
      : "bg-primary";

  return (
    <motion.div
      className="rounded-xl p-3.5 space-y-2"
      style={{ background: "hsl(0 0% 100% / 0.06)" }}
      // Critical: gentle pulse glow on the card itself
      animate={isCritical ? {
        boxShadow: [
          "0 0 0px hsla(32, 95%, 55%, 0)",
          "0 0 12px hsla(32, 95%, 55%, 0.3)",
          "0 0 0px hsla(32, 95%, 55%, 0)",
        ]
      } : { boxShadow: "0 0 0px transparent" }}
      transition={isCritical ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
    >
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

      {/* "Top up →" appears when ≤20% remaining */}
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
    </motion.div>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const displayName = profile?.display_name ?? 'User';
  const tierLabel = profile?.subscription_tier
    ? profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)
    : 'Free';
  const creditsRemaining = profile?.credits_balance ?? 0;
  const creditsLimit = profile?.credits_monthly_allowance ?? 3;
  const isUnlimited = creditsRemaining >= 999999;

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-40"
      style={{
        background: "hsl(230, 20%, 8%)",
        borderRight: "1px solid hsl(230, 15%, 16%)",
      }}
    >
      {/* Wordmark */}
      <div className="px-4 pt-5 pb-5">
        <Link
          to="/dashboard"
          className="font-display text-xl font-bold text-primary tracking-tight hover:opacity-90 transition-opacity"
        >
          Vintifi
        </Link>
      </div>

      {/* Subtle divider below logo */}
      <div style={{ borderTop: "1px solid hsl(230, 15%, 16%)", marginBottom: 8 }} />

      {/* Primary nav */}
      <nav className="flex-none px-3 space-y-0.5 pt-1">
        {PRIMARY_NAV.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all min-h-[44px]",
                isActive
                  ? "font-semibold"
                  : item.brightInactive
                    ? "text-white/75 hover:text-white/90 hover:bg-white/[0.06]"
                    : "text-sidebar-muted hover:text-white/80 hover:bg-white/[0.06]",
              )}
              // Active text: lighter coral for dark bg readability
              style={isActive ? { color: "hsl(350, 80%, 65%)" } : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-[10px]"
                  style={{ background: "hsl(350 80% 58% / 0.12)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon size={20} className="relative z-10 flex-shrink-0" />
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
          <span className="text-xs font-bold font-display" style={{ color: "hsl(350, 80%, 65%)" }}>
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
            onClick={signOut}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
