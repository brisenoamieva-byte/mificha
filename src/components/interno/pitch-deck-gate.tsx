"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PitchDeckView } from "@/components/interno/pitch-deck-view";
import { supabase } from "@/lib/supabase";

export function PitchDeckGate() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?next=/interno/pitch");
        return;
      }

      const response = await fetch("/api/interno/pitch-access", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = (await response.json()) as { allowed?: boolean };

      if (cancelled) return;

      if (!data.allowed) {
        router.replace("/dashboard");
        return;
      }

      setReady(true);
    }

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <p className="text-sm text-white/50">Cargando pitch deck…</p>
      </div>
    );
  }

  return <PitchDeckView />;
}
