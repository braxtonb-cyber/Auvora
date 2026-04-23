'use client';

import { MotionConfig as FramerMotionConfig, LazyMotion, domAnimation } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Root-level Framer Motion provider.
 *
 * Wraps the app tree with:
 *   • LazyMotion — loads `motion` animations on demand (smaller bundle,
 *     required if you use the `m` component instead of `motion`)
 *   • MotionConfig — sets a shared reducedMotion policy and a default
 *     transition fallback so components that forget to specify one still
 *     feel like AUVORA
 *
 * Must be in a client component (framer-motion hooks).
 */

export function MotionConfig({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict={false}>
      <FramerMotionConfig
        reducedMotion="user"
        transition={{
          type: 'spring',
          stiffness: 140,
          damping: 26,
          mass: 1.1,
        }}
      >
        {children}
      </FramerMotionConfig>
    </LazyMotion>
  );
}
