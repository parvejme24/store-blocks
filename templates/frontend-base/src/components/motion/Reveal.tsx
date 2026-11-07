"use client";

import { motion, type HTMLMotionProps } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = HTMLMotionProps<"div"> & {
  /** Seconds to wait before animating, useful for staggered lists. */
  delay?: number;
  /** Vertical distance in px the element travels while fading in. */
  distance?: number;
};

/**
 * Fades and slides a block in once it scrolls into view. Plays only once.
 * Respects reduced motion through MotionProvider.
 */
export function Reveal({ delay = 0, distance = 24, children, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
