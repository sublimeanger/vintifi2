import { useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type SheetHeight = "auto" | "sm" | "md" | "lg" | "full";

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
  sm: "h-[35vh]",
  md: "h-[55vh]",
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
  const constraintsRef = useRef(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 200], [1, 0]);

  function handleDragEnd(_: unknown, info: { offset: { y: number }; velocity: { y: number } }) {
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
          <div ref={constraintsRef} className="fixed inset-0 z-50 pointer-events-none" />
          <motion.div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[20px] overflow-hidden",
              "pointer-events-auto",
              heightMap[height],
              className,
            )}
            style={{ y, paddingBottom: "env(safe-area-inset-bottom)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-9 h-1 rounded-full bg-border" />
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
