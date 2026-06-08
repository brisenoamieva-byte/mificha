"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import {
  buildFounderOutreachMessage,
  FOUNDER_CONVERSION_CRITERIA,
  FOUNDER_WEEK_PLAN,
  PRODUCTION_SQL_SCRIPTS,
} from "@/lib/founder-playbook";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

interface PlatformHealth {
  sql: {
    matchSchedule: boolean | null;
    guardianContact: boolean | null;
  };
  resend: {
    ready: boolean;
  };
  launchFree: boolean;
  checksAvailable?: boolean;
}

const defaultOutreach = buildFounderOutreachMessage({
  contactName: "[nombre]",
  matchDate: "[fecha del partido]",
});

export function FounderLaunchPlaybook() {
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    async function loadHealth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch("/api/interno/platform-health", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        setHealth((await response.json()) as PlatformHealth);
        setHealthError(false);
        return;
      }

      setHealthError(true);
    }

    void loadHealth();
  }, []);

  const sqlReady =
    health?.sql.matchSchedule === true && health?.sql.guardianContact === true;
  const sqlPending =
    health?.sql.matchSchedule === false || health?.sql.guardianContact === false;

  async function copyOutreach() {
    await navigator.clipboard.writeText(defaultOutreach);
    toast.success("Mensaje copiado. Personaliza nombre y fecha.");
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <header className="border-b border-white/10 px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Interno · MiFicha
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Playbook primera academia
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/interno/jornadas"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15"
            >
              Jornadas
            </Link>
            <Link
              href="/interno/temporadas"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15"
            >
              Temporadas
            </Link>
            <Link
              href="/interno/pitch"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Pitch deck
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a1628] hover:bg-white/95"
            >
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10 sm:px-10">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Estado de plataforma</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Revisa esto antes de la demo con una academia real.
          </p>
          <ul className="mt-5 space-y-3">
            <HealthRow
              done={health?.sql.matchSchedule}
              label="SQL #13 — calendario (status, kickoff_at)"
            />
            <HealthRow
              done={health?.sql.guardianContact}
              label="SQL #11 — email del tutor (guardian_email)"
            />
            <HealthRow
              done={health?.resend.ready}
              label="Resend con dominio verificado (mificha.mx)"
              hint={
                health?.resend.ready
                  ? undefined
                  : "Usa WhatsApp desde Plantel hasta verificar dominio."
              }
            />
            <HealthRow
              done={health?.launchFree ?? true}
              label="Modo lanzamiento gratis activo"
            />
          </ul>
          {sqlReady ? (
            <p className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              Base de datos lista — scripts #11 y #13 aplicados. No necesitas volver a
              correrlos.
            </p>
          ) : null}
          {healthError ? (
            <p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              No se pudo verificar automáticamente. Corre{" "}
              <code className="text-amber-200">verify-production-readiness.sql</code> en
              Supabase; si todo es true, estás listo.
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Plan de la semana</h2>
          <ol className="mt-5 space-y-4">
            {FOUNDER_WEEK_PLAN.map((item) => (
              <li key={item.day} className="flex gap-4 text-sm">
                <span className="w-24 shrink-0 font-semibold text-amber-300">
                  {item.day}
                </span>
                <span className="text-white/75">{item.task}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Mensaje WhatsApp</h2>
              <p className="mt-2 text-sm text-white/60">
                Una academia caliente. Personaliza nombre y fecha del partido.
              </p>
            </div>
            <button
              type="button"
              onClick={copyOutreach}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              <Copy className="h-4 w-4" />
              Copiar
            </button>
          </div>
          <pre className="mt-5 overflow-x-auto rounded-xl bg-black/30 p-4 text-sm leading-6 text-white/80 whitespace-pre-wrap">
            {defaultOutreach}
          </pre>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Sesión A (30 min)</h2>
          <ol className="mt-4 space-y-2 text-sm text-white/75">
            <li>1. Crear cuenta o iniciar sesión juntos.</li>
            <li>2. Importar Excel del plantel en /dashboard/plantel.</li>
            <li>3. Confirmar jornada publicada por MiFicha en /dashboard/partidos.</li>
            <li>4. Activar 1 ficha con consentimiento y mandar QR de prueba.</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/plantel"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Plantel
            </Link>
            <Link
              href="/dashboard/partidos"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Partidos
            </Link>
            <Link
              href="/interno/jornadas"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Jornadas (interno)
            </Link>
            <Link
              href="/dashboard/plantel/imprimir"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" />
              QR imprimibles
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
          <h2 className="text-lg font-semibold text-amber-100">
            Academia convertida cuando…
          </h2>
          <ul className="mt-4 space-y-2">
            {FOUNDER_CONVERSION_CRITERIA.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-amber-50/90">
                <Circle className="h-3.5 w-3.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {sqlPending ? (
          <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
            <h2 className="text-lg font-semibold text-amber-100">
              SQL pendiente en Supabase
            </h2>
            <p className="mt-2 text-sm text-amber-50/80">
              El estado de plataforma arriba marca scripts faltantes. Ejecuta solo los
              que correspondan en SQL Editor.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-amber-50/90">
              {PRODUCTION_SQL_SCRIPTS.filter((script) => {
                if (script.id === 11) return health?.sql.guardianContact === false;
                if (script.id === 13) return health?.sql.matchSchedule === false;
                return false;
              }).map((script) => (
                <li key={script.id}>
                  #{script.id} · <code className="text-amber-200">{script.file}</code> —{" "}
                  {script.label}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function HealthRow({
  done,
  label,
  hint,
}: {
  done?: boolean | null;
  label: string;
  hint?: string;
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      {done === true ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
      ) : done === false ? (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
      )}
      <div>
        <p className="text-white/85">{label}</p>
        {hint ? <p className="mt-1 text-white/50">{hint}</p> : null}
      </div>
    </li>
  );
}
