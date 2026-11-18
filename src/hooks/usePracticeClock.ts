"use client";

import { useEffect } from "react";
import { tickPracticeClock } from "@/lib/progress";

const TICK_MS = 30_000;

/**
 * While a practice surface is open and visible, credit wall-clock practice time.
 */
export function usePracticeClock(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const pulse = () => {
      if (document.visibilityState !== "visible") return;
      tickPracticeClock();
    };

    pulse();
    const id = window.setInterval(pulse, TICK_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") pulse();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      pulse();
    };
  }, [enabled]);
}
