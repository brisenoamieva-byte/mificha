"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { PARTNERSHIP_HUB_PATH } from "@/lib/partnership-access";
import { supabase } from "@/lib/supabase";

interface PartnershipAccessGateProps {
  nextPath?: string;
  loadingLabel?: string;
  children: ReactNode;
}

export function PartnershipAccessGate({
  nextPath = PARTNERSHIP_HUB_PATH,
  loadingLabel = "Verificando acceso de socios…",
  children,
}: PartnershipAccessGateProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace(`/fut/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        const response = await fetch("/fut/api/interno/partnership-access", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const data = (await response.json()) as { allowed?: boolean };

        if (cancelled) return;

        if (!response.ok || !data.allowed) {
          router.replace("/fut");
          return;
        }

        setReady(true);
      } catch {
        if (!cancelled) {
          router.replace(`/fut/login?next=${encodeURIComponent(nextPath)}`);
        }
      }
    }

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mf-canvas">
        <p className="text-sm text-mf-text-muted">{loadingLabel}</p>
      </div>
    );
  }

  return <>{children}</>;
}
