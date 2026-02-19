import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeSrc?: string;
  afterSrc?: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeGradient?: string;
  afterGradient?: string;
  className?: string;
  autoReveal?: boolean;
  autoRevealDelay?: number;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
  beforeGradient = "linear-gradient(135deg, hsl(220 20% 40%) 0%, hsl(220 15% 25%) 100%)",
  afterGradient = "linear-gradient(135deg, hsl(350 60% 85%) 0%, hsl(30 80% 90%) 100%)",
  className,
  autoReveal = false,
  autoRevealDelay = 800,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const position = useMotionValue(50);
  const clipPath = useTransform(position, (v) => `inset(0 ${100 - v}% 0 0)`);

  const getRelativeX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 50;
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  // Auto-reveal wipe animation
  useEffect(() => {
    if (!autoReveal) return;
    const timer = setTimeout(() => {
      // Wipe from 0 → 65 over 1.2s
      animate(position, 65, {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        onComplete: () => setIsRevealed(true),
      });
    }, autoRevealDelay);
    return () => clearTimeout(timer);
  }, [autoReveal, autoRevealDelay, position]);

  // Mouse handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    position.set(getRelativeX(e.clientX));
  }, [getRelativeX, position]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      position.set(getRelativeX(e.clientX));
    };
    const onMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, getRelativeX, position]);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    position.set(getRelativeX(e.touches[0].clientX));
  }, [getRelativeX, position]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    position.set(getRelativeX(e.touches[0].clientX));
  }, [getRelativeX, position]);

  const handleLeft = useMotionValue("50%");
  useEffect(() => {
    return position.on("change", (v) => {
      handleLeft.set(`${v}%`);
    });
  }, [position, handleLeft]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl select-none cursor-col-resize",
        className
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {/* Before layer */}
      <div
        className="absolute inset-0"
        style={{
          background: beforeSrc ? undefined : beforeGradient,
        }}
      >
        {beforeSrc ? (
          <img src={beforeSrc} alt={beforeLabel} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full flex items-end p-4">
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest">
              {beforeLabel}
            </span>
          </div>
        )}
        {/* Vignette / noise texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white/80 text-xs font-mono uppercase tracking-wider">
            {beforeLabel}
          </span>
        </div>
      </div>

      {/* After layer — clipped */}
      <motion.div
        className="absolute inset-0"
        style={{
          clipPath,
          background: afterSrc ? undefined : afterGradient,
        }}
      >
        {afterSrc ? (
          <img src={afterSrc} alt={afterLabel} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-0.5 rounded-full bg-primary/80 backdrop-blur-sm text-primary-foreground text-xs font-mono uppercase tracking-wider">
            {afterLabel}
          </span>
        </div>
      </motion.div>

      {/* Divider line */}
      <motion.div
        className="absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        style={{ left: handleLeft }}
      />

      {/* Handle */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
        style={{ left: handleLeft }}
        animate={isRevealed ? "bounce" : "rest"}
        variants={{
          rest: {},
          bounce: {
            scale: [1, 1.18, 0.92, 1],
            transition: { duration: 0.5, ease: "easeOut" },
          },
        }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center gap-0.5",
            "ring-2 ring-white/50 transition-shadow",
            isDragging && "shadow-coral ring-primary/30"
          )}
        >
          <ChevronLeft className="w-3 h-3 text-foreground/60" />
          <ChevronRight className="w-3 h-3 text-foreground/60" />
        </div>
      </motion.div>
    </div>
  );
};

export default BeforeAfterSlider;
