"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Presentation, Rocket } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function PitchDeckNavLink({ onClose }: { onClose?: () => void }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch("/api/interno/pitch-access", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = (await response.json()) as { allowed?: boolean };
      if (!cancelled) setAllowed(Boolean(data.allowed));
    }

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!allowed) return null;

  return (
    <div className="mt-2 space-y-1 border-t border-mf-border pt-3">
      <Link
        href="/interno/pitch"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="mf-nav-link"
      >
        <Presentation className="h-[18px] w-[18px] shrink-0" />
        Pitch deck
      </Link>
      <Link
        href="/interno/lanzamiento"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="mf-nav-link"
      >
        <Rocket className="h-[18px] w-[18px] shrink-0" />
        Playbook lanzamiento
      </Link>
    </div>
  );
}
