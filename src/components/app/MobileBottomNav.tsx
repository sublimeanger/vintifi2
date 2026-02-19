import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Camera, Plus, Package, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoreSheet } from "./MoreSheet";

const TABS = [
  { label: "Home", icon: Home, to: "/dashboard" },
  { label: "Studio", icon: Camera, to: "/vintography" },
  null, // FAB placeholder
  { label: "Items", icon: Package, to: "/listings" },
  { label: "More", icon: MoreHorizontal, to: null },
] as const;

export function MobileBottomNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden backdrop-blur-xl border-t border-border/60"
        style={{
          background: "hsl(var(--background) / 0.92)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-end justify-around h-[72px] px-2">
          {TABS.map((tab, i) => {
            // FAB (centre)
            if (tab === null) {
              return (
                <div key="fab" className="flex flex-col items-center relative -mt-6">
                  <Link
                    to="/sell"
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95"
                    style={{
                      background: "hsl(var(--primary))",
                      boxShadow: "0 4px 14px hsla(350, 80%, 58%, 0.3)",
                    }}
                    aria-label="Sell an item"
                  >
                    <Plus size={26} strokeWidth={2.5} color="white" />
                  </Link>
                  <span
                    className="text-[10px] font-sans mt-1 absolute -bottom-4"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    Sell
                  </span>
                </div>
              );
            }

            // "More" tab — opens MoreSheet
            if (tab.to === null) {
              const isActive = moreOpen;
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(true)}
                  className="flex flex-col items-center gap-1 py-2 min-w-[44px] min-h-[44px] justify-center relative"
                  aria-label="More"
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomnav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    size={20}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-primary" : "text-foreground/40",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-sans transition-colors",
                      isActive ? "text-primary" : "text-foreground/40",
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            // Regular tabs
            const isActive = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-col items-center gap-1 py-2 min-w-[44px] min-h-[44px] justify-center relative"
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomnav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-foreground/40",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-sans transition-colors",
                    isActive ? "text-primary" : "text-foreground/40",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <MoreSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
