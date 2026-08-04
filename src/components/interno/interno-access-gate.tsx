"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface InternoAccessGateProps {
  nextPath: string;
  loadingLabel: string;
  children: ReactNode;
}

export function InternoAccessGate({
  nextPath,
  loadingLabel,
  children,
}: InternoAccessGateProps) {
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

        const response = await fetch("/fut/api/interno/pitch-access", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = (await response.json()) as { allowed?: boolean };

        if (cancelled) return;

        if (!response.ok || !data.allowed) {
          router.replace("/fut/dashboard");
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <p className="text-sm text-white/50">{loadingLabel}</p>
      </div>
    );
  }

  return <>{children}</>;
}
