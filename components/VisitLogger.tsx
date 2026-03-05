"use client";

import { useEffect } from "react";

/**
 * Calls /api/visit once on mount to log this visitor's location (from server-side IP geo).
 * No UI; runs in the background so admin can see "Visitors" with detected locations.
 */
export function VisitLogger() {
  useEffect(() => {
    fetch("/api/visit").catch(() => {});
  }, []);
  return null;
}
