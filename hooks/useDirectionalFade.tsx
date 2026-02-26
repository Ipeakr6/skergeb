"use client";

import { useEffect, useRef, useState } from "react";

export type Phase = "hiddenTop" | "hiddenBottom" | "visible";

export function useDirectionalFade(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<Phase>("hiddenBottom");

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("visible");
        } else {
          const wentAbove = entry.boundingClientRect.top < 0;
          setPhase(wentAbove ? "hiddenTop" : "hiddenBottom");
        }
      },
      { threshold: 1.8, ...options },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return { ref, phase };
}
