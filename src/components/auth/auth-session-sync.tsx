"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/** Sesiones viejas (createClient → localStorage) → cookies del browser client. */
function readLegacyLocalSession(): {
  access_token: string;
  refresh_token: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("sb-") || !key.includes("auth-token")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as {
        access_token?: string;
        refresh_token?: string;
        currentSession?: { access_token?: string; refresh_token?: string };
        session?: { access_token?: string; refresh_token?: string };
      };
      const access_token =
        parsed.access_token ||
        parsed.currentSession?.access_token ||
        parsed.session?.access_token;
      const refresh_token =
        parsed.refresh_token ||
        parsed.currentSession?.refresh_token ||
        parsed.session?.refresh_token;
      if (access_token && refresh_token) {
        return { access_token, refresh_token };
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

/**
 * Tras login en el cliente, refresca RSC para que Kit PDF / Explorar / Activar
 * lean la cookie. También migra sesiones que solo estaban en localStorage.
 */
export function AuthSessionSync() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.refresh();
        return;
      }

      const legacy = readLegacyLocalSession();
      if (!legacy) return;

      const { error } = await supabase.auth.setSession(legacy);
      if (!error) router.refresh();
    })();
  }, [router]);

  return null;
}
