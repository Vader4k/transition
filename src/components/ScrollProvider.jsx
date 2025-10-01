"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScrollProvider({ children }) {

  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,     // easing duration
        lerp: 0.1,         // smoothing
        smoothWheel: true, // enable mouse wheel smoothing
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  );
}
