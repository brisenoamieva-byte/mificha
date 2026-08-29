"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

export function JoinAcademyContent({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [academyName, setAcademyName] = useState("la academia");
  const [invitedName, setInvitedName] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [inviteRes, sessionRes] = await Promise.all([
          fetch(`/fut/api/invite/${encodeURIComponent(token)}`),
          supabase.auth.getSession(),
        ]);
        const payload = (await inviteRes.json()) as {
          error?: string;
          academy_name?: string;
          invited_name?: string | null;
        };
        if (!inviteRes.ok) {
          throw new Error(payload.error || "Invitación no válida.");
        }
        if (cancelled) return;
        setAcademyName(payload.academy_name ?? "la academia");
        setInvitedName(payload.invited_name ?? null);
        setLoggedIn(Boolean(sessionRes.data.session));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Invitación no válida.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function join() {
    setJoining(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/fut/login?next=${encodeURIComponent(`/fut/unirse/${token}`)}`);
        return;
      }
      const response = await fetch(`/fut/api/invite/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo unir.");
      toast.success("Ya puedes capturar diagnósticos.");
      router.replace("/fut/dashboard/diagnostico");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo unir.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <header className="border-b border-mf-border bg-white px-4 py-4">
        <BrandLogoLink href="/" />
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-mf-border bg-white p-8">
          {loading ? (
            <p className="text-sm text-mf-text-secondary">Cargando invitación…</p>
          ) : error ? (
            <>
              <h1 className="text-2xl font-semibold text-mf-text">Invitación no válida</h1>
              <p className="mt-2 text-sm text-mf-text-secondary">{error}</p>
              <Link href="/fut/login" className="mf-btn-primary mt-6">
                Ir a iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-brand">
                Invitación a equipo
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-mf-text">
                {invitedName ? `${invitedName}, ` : ""}únete a {academyName}
              </h1>
              <p className="mt-3 text-sm text-mf-text-secondary">
                Vas a poder llenar diagnósticos y ver las fichas de los jugadores.
                Entra con el correo al que te invitaron.
              </p>
              {loggedIn ? (
                <button
                  type="button"
                  disabled={joining}
                  onClick={() => void join()}
                  className="mf-btn-primary mt-6 w-full"
                >
                  {joining ? "Uniendo…" : "Entrar al panel"}
                </button>
              ) : (
                <div className="mt-6 grid gap-3">
                  <Link
                    href={`/fut/login?next=${encodeURIComponent(`/fut/unirse/${token}`)}`}
                    className="mf-btn-primary w-full"
                  >
                    Ya tengo cuenta
                  </Link>
                  <Link
                    href={`/fut/signup?next=${encodeURIComponent(`/fut/unirse/${token}`)}`}
                    className="mf-btn-secondary w-full"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
