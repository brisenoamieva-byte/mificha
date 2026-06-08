"use client";

import { useEffect, useRef } from "react";

interface ProfileViewTrackerProps {
  slug: string;
}

export function ProfileViewTracker({ slug }: ProfileViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current || !slug) return;
    trackedRef.current = true;

    void fetch("/api/public/profile-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    });
  }, [slug]);

  return null;
}
