import { useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export type SheetHeight = "auto" | "sm" | "md" | "lg" | "full";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: SheetHeight;
  showHandle?: boolean;
  className?: string;
}

const heightMap: Record<SheetHeight, string> = {
  auto: "max-h-[85vh]",
  sm: "h-[30vh]",
  md: "h-[50vh]",
  lg: "h-[75vh]",
  full: "h-[95vh]",
};

export function BottomSheet({
  isOpen,
  onClose,
  children,
  height = "auto",
  showHandle = true,
  className,
}: BottomSheetProps) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 200], [1, 0]);

  function handleDragEnd(_: unknown, info: { offset: { y: number }; velocity: { y: number } }) {
    // Spec: dismiss on drag offset > 100px OR velocity > 500
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-background pointer-events-auto overflow-hidden",
              heightMap[height],
              className,
            )}
            style={{
              y,
              // Top corners only: 20px (per spec §9.2)
              borderRadius: "20px 20px 0 0",
              // Warm-tinted shadow
              boxShadow: "0 -4px 20px hsla(230, 20%, 12%, 0.1)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            {showHandle && (
              <div className="flex justify-center pt-2.5 pb-2 cursor-grab active:cursor-grabbing">
                {/* Handle: 36px × 4px, rounded-full, bg-foreground/15 per spec */}
                <div
                  className="rounded-full"
                  style={{
                    width: 36,
                    height: 4,
                    background: "hsl(var(--foreground) / 0.15)",
                  }}
                />
              </div>
            )}
            <motion.div style={{ opacity }} className="overflow-y-auto h-full">
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
