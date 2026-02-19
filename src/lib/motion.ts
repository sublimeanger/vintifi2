import type { Variants, Transition } from "framer-motion";

// ── Spring Presets ─────────────────────────────────────────────────────────

export const springs = {
  snappy: { type: "spring", stiffness: 400, damping: 30 } as Transition,
  gentle: { type: "spring", stiffness: 200, damping: 28 } as Transition,
  smooth: { type: "spring", stiffness: 120, damping: 20 } as Transition,
  bouncy: { type: "spring", stiffness: 300, damping: 18 } as Transition,
};

// ── Stagger Constants ──────────────────────────────────────────────────────

export const stagger = {
  fast: 0.06,
  normal: 0.08,
  slow: 0.12,
};

// ── Variant Factories ──────────────────────────────────────────────────────

export function fadeUpVariants(delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...springs.gentle, delay },
    },
  };
}

export function fadeInVariants(delay = 0): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay },
    },
  };
}

export function scaleInVariants(delay = 0): Variants {
  return {
    hidden: { opacity: 0, scale: 0.94 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { ...springs.snappy, delay },
    },
  };
}

// Container that staggers children
export function containerVariants(staggerChildren = stagger.normal): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren },
    },
  };
}

// Card hover (lift + shadow)
export const cardHover = {
  rest: { y: 0, boxShadow: "var(--shadow-md)" },
  hover: {
    y: -2,
    boxShadow: "var(--shadow-lg)",
    transition: springs.snappy,
  },
};
