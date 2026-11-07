"use client";

import { MotionConfig } from "motion/react";

/**
 * App-wide motion settings. reducedMotion="user" turns off transform and layout
 * animation for people who ask for reduced motion in their operating system.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
