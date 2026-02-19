import { motion, AnimatePresence } from "framer-motion";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative w-full max-w-sm bg-background rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
              >
                <X size={15} />
              </button>

              {/* Gradient header */}
              <div
                className="px-6 pt-8 pb-6 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(350 80% 58%) 0%, hsl(20 85% 58%) 100%)",
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Zap size={24} color="white" fill="white" />
                </div>
                <h2
                  className="text-xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Upgrade to Pro
                </h2>
                <p className="text-sm text-white/80">Unlimited AI photos + listings</p>
              </div>

              {/* Feature list */}
              <div className="px-6 py-5 space-y-3">
                {[
                  "Unlimited photo backgrounds",
                  "AI listing descriptions",
                  "Price intelligence",
                  "Trend alerts",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                      ✓
                    </span>
                    {feat}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="px-6 pb-6 space-y-2">
                <Button className="w-full min-h-[44px] bg-primary hover:bg-primary/90">
                  Start 7-Day Free Trial
                </Button>
                <Button variant="ghost" className="w-full min-h-[44px] text-muted-foreground">
                  Top up credits
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
