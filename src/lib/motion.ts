import type { Variants, Transition } from "framer-motion";

// ── Spring Presets (§6.2) ──────────────────────────────────────────────────

export const springs = {
  // Snappy — for small, quick interactions (buttons, toggles, pills)
  snappy: { type: "spring", stiffness: 400, damping: 30 } as Transition,
  // Gentle — for medium transitions (cards appearing, drawers opening)
  gentle: { type: "spring", stiffness: 260, damping: 28 } as Transition,
  // Smooth — for large layout shifts (page transitions, panel resize)
  smooth: { type: "spring", stiffness: 180, damping: 24 } as Transition,
  // Bouncy — for celebratory moments (milestone banners, completion states)
  bouncy: { type: "spring", stiffness: 300, damping: 15 } as Transition,
};

// ── Stagger Constants (§6.2) ───────────────────────────────────────────────

export const stagger = {
  fast: 0.03,    // Dense lists (nav items, badges)
  normal: 0.06,  // Card grids, feature sections
  slow: 0.1,     // Hero elements, major reveals
};

// ── Variant Factories ──────────────────────────────────────────────────────

export function fadeUpVariants(delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: 20 },
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

// Scroll reveal (§6.4) — used by ScrollReveal component
export const scrollReveal = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 100, damping: 20 },
};

// Card hover lift (§6.5)
export const cardHover = {
  rest: { y: 0, boxShadow: "var(--shadow-sm)" },
  hover: {
    y: -2,
    boxShadow: "var(--shadow-md)",
    transition: springs.gentle,
  },
};
