"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Presentation } from "lucide-react";

export function PitchDeckNavLink({ onClose }: { onClose?: () => void }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/interno/pitch-access")
      .then((response) => response.json())
      .then((data: { allowed?: boolean }) => {
        if (!cancelled) setAllowed(Boolean(data.allowed));
      })
      .catch(() => {
        if (!cancelled) setAllowed(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!allowed) return null;

  return (
    <Link
      href="/interno/pitch"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClose}
      className="mf-nav-link border-t border-mf-border mt-2 pt-3"
    >
      <Presentation className="h-[18px] w-[18px] shrink-0" />
      Pitch deck
    </Link>
  );
}
