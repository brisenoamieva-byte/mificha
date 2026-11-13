"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type HealthPayload = {
  resend?: {
    ready?: boolean;
    hasKey?: boolean;
    fromIsDev?: boolean;
    fromDomain?: string | null;
    hint?: string | null;
  };
  mercadoPago?: {
    ready?: boolean;
    hint?: string | null;
  };
  diagnosisBooking?: {
    ready?: boolean;
    source?: string;
    hint?: string | null;
    opsSteps?: readonly string[];
  };
  error?: string;
};

function StatusRow({
  ok,
  label,
  detail,
}: {
  ok: boolean | null;
  label: string;
  detail?: string | null;
}) {
  return (
    <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-start gap-2">
        {ok == null ? (
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-white/50" />
        ) : ok ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{label}</p>
          {detail ? (
            <p className="mt-1 text-sm leading-6 text-white/65">{detail}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function PlatformOpsStatus() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          if (!cancelled) {
            setHealth({ error: "Inicia sesión para ver el estado operativo." });
            setLoading(false);
          }
          return;
        }
        const response = await fetch("/fut/api/interno/platform-health", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = (await response.json()) as HealthPayload;
        if (!cancelled) setHealth(payload);
      } catch {
        if (!cancelled) {
          setHealth({ error: "No se pudo leer el estado operativo." });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const mpOk = health?.mercadoPago?.ready ?? null;
  const mailOk = health?.resend?.ready ?? null;
  const bookingOk = health?.diagnosisBooking?.ready ?? null;
  const bookingSteps = health?.diagnosisBooking?.opsSteps ?? [];

  return (
    <section className="rounded-2xl border border-amber-400/25 bg-amber-500/[0.08] p-5">
      <h2 className="text-base font-semibold">Estado operativo</h2>
      <p className="mt-1 text-sm leading-6 text-white/65">
        Cobro, correo y agenda GPH: lo que bloquea recibos, invitaciones y el
        diagnóstico de $2,030.
      </p>
      <ul className="mt-4 space-y-2">
        {loading ? (
          <StatusRow ok={null} label="Revisando…" />
        ) : health?.error ? (
          <StatusRow ok={false} label="No disponible" detail={health.error} />
        ) : (
          <>
            <StatusRow
              ok={mpOk}
              label="Mercado Pago · diagnóstico"
              detail={
                mpOk
                  ? "Checkout de diagnóstico activo en este entorno."
                  : health?.mercadoPago?.hint
              }
            />
            <StatusRow
              ok={mailOk}
              label="Correo · Resend"
              detail={
                mailOk
                  ? `Remitente listo${
                      health?.resend?.fromDomain
                        ? ` (@${health.resend.fromDomain})`
                        : ""
                    }.`
                  : health?.resend?.hint
              }
            />
            <StatusRow
              ok={bookingOk}
              label="Agenda · Calendly / Google"
              detail={health?.diagnosisBooking?.hint}
            />
          </>
        )}
      </ul>
      {!loading && !health?.error && bookingOk === false && bookingSteps.length > 0 ? (
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-white/70">
          {bookingSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
