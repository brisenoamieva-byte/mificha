"use client";

import { useEffect, useRef } from "react";

interface TutorFichaViewTrackerProps {
  token: string;
}

export function TutorFichaViewTracker({ token }: TutorFichaViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current || !token) return;
    trackedRef.current = true;

    void fetch("/fut/api/public/tutor-ficha-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      keepalive: true,
    });
  }, [token]);

  return null;
}
