"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface InternoAccessGateProps {
  nextPath: string;
  loadingLabel: string;
  children: ReactNode;
  /**
   * `founder` = solo Ricardo (playbook de lanzamiento).
   * `interno` = lista PITCH_ALLOWED_* (herramientas internas).
   */
  access?: "interno" | "founder";
}

export function InternoAccessGate({
  nextPath,
  loadingLabel,
  children,
  access = "interno",
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
          router.replace(`/fut/entrar?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        const accessPath =
          access === "founder"
            ? "/fut/api/interno/founder-access"
            : "/fut/api/interno/pitch-access";

        const response = await fetch(accessPath, {
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
          router.replace(`/fut/entrar?next=${encodeURIComponent(nextPath)}`);
        }
      }
    }

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [access, nextPath, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <p className="text-sm text-white/50">{loadingLabel}</p>
      </div>
    );
  }

  return <>{children}</>;
}
