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
  Sparkles,
  Zap,
} from "lucide-react";
import {
  buildFounderOutreachMessage,
  FOUNDER_CONVERSION_CRITERIA,
  FOUNDER_DEMO_PRECHECK,
  FOUNDER_DEMO_WOW_MOMENTS,
  FOUNDER_LIVE_DEMO_SCRIPT,
  FOUNDER_WEEK_PLAN,
  PRODUCTION_SQL_ORDER,
  PRODUCTION_SQL_SCRIPTS,
} from "@/lib/founder-playbook";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

interface PlatformHealth {
  sql: {
    matchSchedule: boolean | null;
    guardianContact: boolean | null;
    profileViews: boolean | null;
  };
  resend: {
    ready: boolean;
  };
  launchFree: boolean;
  checksAvailable?: boolean;
}

const defaultOutreach = buildFounderOutreachMessage({
  contactName: "[nombre del director]",
  matchDate: "[fecha del partido]",
  academyName: "[nombre de la academia]",
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

  const coreSqlReady =
    health?.sql.matchSchedule === true &&
    health?.sql.guardianContact === true &&
    health?.sql.profileViews === true;

  async function copyOutreach() {
    await navigator.clipboard.writeText(defaultOutreach);
    toast.success("Mensaje copiado. Personaliza nombre, academia y fecha.");
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
              Playbook venta + demo en vivo
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              Pitch 7 slides (~5 min) + demo en vivo (~10 min): problema → solución → cuatro pasos → red → cierre.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/interno/demo-one-pager"
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-500/15"
            >
              One-pager PDF
            </Link>
            <Link
              href="/interno/patrocinio-mars"
              className="inline-flex items-center gap-2 rounded-full border border-[#0000B2]/40 bg-[#0000B2]/15 px-4 py-2 text-sm font-semibold text-[#B8B8FF] hover:bg-[#0000B2]/25"
            >
              Patrocinio Mars
            </Link>
            <Link
              href="/interno/pitch"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a1628] hover:bg-white/95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Pitch (F = presentar)
            </Link>
            <Link
              href="/interno/jornadas"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15"
            >
              Jornadas
            </Link>
            <Link
              href="/interno/gobernanza"
              className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 hover:bg-violet-500/15"
            >
              Quién hace qué
            </Link>
            <Link
              href="/interno/temporadas"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Temporadas
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10 sm:px-10">
        <section className="rounded-2xl border border-sky-400/25 bg-sky-500/[0.08] p-6">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 text-sky-300" />
            <div>
              <h2 className="text-lg font-semibold">Demo en vivo · 15 minutos</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Sigue este guión en la llamada. El wow es gobernanza + aviso automático al tutor
                con preview OG — ensáyalo una vez antes de la academia real.
              </p>
            </div>
          </div>
          <ol className="mt-6 space-y-4">
            {FOUNDER_LIVE_DEMO_SCRIPT.map((step) => (
              <li
                key={step.title}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                      Min {step.minute}
                    </p>
                    <p className="mt-1 font-semibold text-white">{step.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">{step.action}</p>
                    {step.wow ? (
                      <p className="mt-2 text-sm font-medium text-emerald-300">
                        Wow: {step.wow}
                      </p>
                    ) : null}
                  </div>
                  {step.href ? (
                    <Link
                      href={step.href}
                      target={step.href.startsWith("/dashboard") ? undefined : "_blank"}
                      className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                    >
                      Abrir
                      <ExternalLink className="ml-1 inline h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.08] p-6">
          <h2 className="text-lg font-semibold">Efectos wow (memoriza estos 5)</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {FOUNDER_DEMO_WOW_MOMENTS.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-emerald-400/20 bg-black/20 px-4 py-3"
              >
                <p className="font-semibold text-emerald-200">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-white/70">{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Antes de la demo (precheck)</h2>
          <ul className="mt-4 space-y-2">
            {FOUNDER_DEMO_PRECHECK.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-white/75">
                <Circle className="mt-1 h-3.5 w-3.5 shrink-0 text-white/40" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Estado de plataforma</h2>
          <ul className="mt-5 space-y-3">
            <HealthRow
              done={health?.sql.matchSchedule}
              label="SQL #13 — calendario (status, kickoff_at)"
            />
            <HealthRow
              done={health?.sql.guardianContact}
              label="SQL #11 + #22 — contacto y avisos automáticos a tutores"
            />
            <HealthRow
              done={health?.sql.profileViews}
              label="SQL #18 — contador aperturas de ficha"
            />
            <HealthRow
              done={health?.resend.ready}
              label="Resend con dominio verificado"
              hint={
                health?.resend.ready
                  ? undefined
                  : "WhatsApp basta para el piloto — email es opcional."
              }
            />
            <HealthRow done={health?.launchFree ?? true} label="Modo lanzamiento activo" />
          </ul>
          {coreSqlReady ? (
            <p className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              Core listo para demo (#11, #13, #18). Temporadas/jornadas (#14–#17) deben estar
              aplicados para el flujo centralizado.
            </p>
          ) : null}
          {healthError ? (
            <p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Corre{" "}
              <code className="text-amber-200">verify-production-readiness.sql</code> en Supabase.
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Mensaje WhatsApp (prospección)</h2>
              <p className="mt-2 text-sm text-white/60">
                Una academia caliente. Enfatiza demo 15 min + academia fundadora.
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
          <h2 className="text-lg font-semibold">Plan de la semana</h2>
          <ol className="mt-5 space-y-4">
            {FOUNDER_WEEK_PLAN.map((item) => (
              <li key={item.day} className="flex gap-4 text-sm">
                <span className="w-28 shrink-0 font-semibold text-amber-300">{item.day}</span>
                <span className="text-white/75">{item.task}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
          <h2 className="text-lg font-semibold text-amber-100">Academia convertida cuando…</h2>
          <ul className="mt-4 space-y-2">
            {FOUNDER_CONVERSION_CRITERIA.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-amber-50/90">
                <Circle className="h-3.5 w-3.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">SQL en Supabase (orden recomendado)</h2>
          <p className="mt-2 text-sm text-white/60">
            Ejecuta en SQL Editor. Orden: {PRODUCTION_SQL_ORDER.join(" → ")}.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {PRODUCTION_SQL_SCRIPTS.map((script) => (
              <li key={script.id}>
                <span className="font-mono text-emerald-300">#{script.id}</span> ·{" "}
                <code className="text-sky-200">{script.file}</code> — {script.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Sesión B · post-partido real</h2>
          <ol className="mt-4 space-y-2 text-sm text-white/75">
            <li>1. Organizador publica marcador + acta; academia captura convocados + minutos (~1 min).</li>
            <li>2. MiFicha avisa tutores automáticamente — confirma contador de enviados.</li>
            <li>3. Dashboard → confirma «3 visitas únicas» de padres.</li>
            <li>4. Pide testimonio al director (audio 30 s o WhatsApp escrito).</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/partidos/nuevo"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Captura
            </Link>
            <Link
              href="/dashboard/plantel/tutores"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" />
              Tutores
            </Link>
          </div>
        </section>
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
