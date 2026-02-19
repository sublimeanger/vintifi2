import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  Camera,
  PlusCircle,
  Package,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_USER = { displayName: "Jamie", creditsRemaining: 47, creditsLimit: 50 };

const PRIMARY_LINKS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Photo Studio", icon: Camera, to: "/vintography" },
  { label: "Sell", icon: PlusCircle, to: "/sell" },
  { label: "My Items", icon: Package, to: "/listings" },
];

const SECONDARY_LINKS = [
  { label: "Price Check", icon: Sparkles, to: "/price-check" },
  { label: "Listing Optimiser", icon: SlidersHorizontal, to: "/optimize" },
  { label: "Trends", icon: TrendingUp, to: "/trends" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { creditsRemaining, creditsLimit } = MOCK_USER;
  const pct = Math.min(100, (creditsRemaining / creditsLimit) * 100);

  function handleNav(to: string) {
    onClose();
    navigate(to);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[360px] bg-background shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-sunken flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto pt-16 pb-6 px-6 flex flex-col gap-6">
              {/* Primary nav */}
              <nav className="space-y-1">
                {PRIMARY_LINKS.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <button
                      key={item.to}
                      onClick={() => handleNav(item.to)}
                      className={cn(
                        "w-full flex items-center gap-3 py-2 text-left min-h-[44px] transition-colors",
                        isActive ? "text-primary" : "text-foreground hover:text-primary/80",
                      )}
                      style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 600 }}
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <hr className="border-border" />

              {/* Secondary nav */}
              <nav className="space-y-1">
                {SECONDARY_LINKS.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <button
                      key={item.to}
                      onClick={() => handleNav(item.to)}
                      className={cn(
                        "w-full flex items-center gap-3 py-2 text-left min-h-[44px] transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      style={{ fontSize: 16, fontWeight: 500 }}
                    >
                      <item.icon size={18} className="flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <hr className="border-border" />

              {/* Credits meter (compact) */}
              <div className="rounded-xl p-3.5 bg-muted space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Credits</span>
                  <span className="font-mono text-xs text-foreground">
                    {creditsRemaining} / {creditsLimit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Footer actions */}
              <div className="space-y-1 mt-auto">
                <button
                  onClick={() => handleNav("/settings")}
                  className="w-full flex items-center gap-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                >
                  <Settings size={18} />
                  Settings
                </button>
                <button
                  onClick={onClose}
                  className="w-full flex items-center gap-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors min-h-[44px]"
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
