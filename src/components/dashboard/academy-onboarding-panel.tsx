"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Rocket } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { hasPublicConsent } from "@/lib/privacy";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Academy } from "@/types/database";

interface OnboardingProgress {
  profileReady: boolean;
  hasPlayers: boolean;
  hasScheduledMatch: boolean;
  hasCompletedMatch: boolean;
  hasGuardianEmails: boolean;
  hasShareableFicha: boolean;
  hasDiscoverablePlayer: boolean;
}

function isProfileReady(academy: Academy) {
  return Boolean(
    academy.city?.trim() &&
      academy.state?.trim() &&
      academy.description?.trim(),
  );
}

export function AcademyOnboardingPanel() {
  const { academy } = useDashboard();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!academy) return;

    setLoading(true);

    const [playersResult, scheduledResult, completedResult] = await Promise.all([
      supabase
        .from("players")
        .select("is_public, public_consent_at, is_discoverable, guardian_email")
        .eq("academy_id", academy.id),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("academy_id", academy.id)
        .in("status", ["scheduled", "postponed"]),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("academy_id", academy.id)
        .eq("status", "completed"),
    ]);

    const players = playersResult.data ?? [];

    setProgress({
      profileReady: isProfileReady(academy),
      hasPlayers: players.length > 0,
      hasScheduledMatch: (scheduledResult.count ?? 0) > 0,
      hasCompletedMatch: (completedResult.count ?? 0) > 0,
      hasGuardianEmails: players.some((player) => player.guardian_email?.trim()),
      hasShareableFicha: players.some((player) => hasPublicConsent(player)),
      hasDiscoverablePlayer: players.some(
        (player) => player.is_discoverable && hasPublicConsent(player),
      ),
    });
    setLoading(false);
  }, [academy]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const steps = useMemo(() => {
    if (!progress) return [];

    return [
      {
        id: "profile",
        done: progress.profileReady,
        title: "Completa el perfil de tu academia",
        description: "Ciudad, estado y descripción para generar confianza.",
        href: "/dashboard/configuracion",
        cta: "Ir a configuración",
      },
      {
        id: "plantel",
        done: progress.hasPlayers,
        title: "Carga tu plantel",
        description: "Importa Excel (con email del tutor) o agrega jugadores manualmente.",
        href: "/dashboard/plantel",
        cta: "Ir a plantel",
      },
      {
        id: "calendar",
        done: progress.hasScheduledMatch,
        title: "Publica tu calendario",
        description: "Fecha, hora y sede visibles para padres y scouts.",
        href: "/dashboard/partidos/programar",
        cta: "Programar partido",
      },
      {
        id: "match",
        done: progress.hasCompletedMatch,
        title: "Captura stats post-partido",
        description: "Activa Passport Score y el marcador semanal.",
        href: "/dashboard/partidos/nuevo",
        cta: "Registrar resultado",
      },
      {
        id: "guardians",
        done: progress.hasGuardianEmails,
        title: "Agrega contacto del tutor",
        description: "Email del padre/madre para reportes verificados.",
        href: "/dashboard/plantel",
        cta: "Editar jugadores",
      },
      {
        id: "share",
        done: progress.hasShareableFicha,
        title: "Activa y comparte una ficha con padres",
        description: "Consentimiento parental + ficha pública + WhatsApp.",
        href: "/dashboard/plantel",
        cta: "Compartir desde plantel",
      },
      {
        id: "explore",
        done: progress.hasDiscoverablePlayer,
        title: "Opcional: aparece en Explorar",
        description: "Para visorías — activa directorio en jugadores seleccionados.",
        href: "/explorar",
        cta: "Ver directorio",
        optional: true,
      },
    ];
  }, [progress]);

  const completedCount = steps.filter((step) => step.done).length;
  const requiredSteps = steps.filter((step) => !step.optional);
  const requiredDone = requiredSteps.filter((step) => step.done).length;
  const allRequiredDone =
    progress !== null && requiredDone === requiredSteps.length;

  if (!academy || loading || !progress || allRequiredDone) {
    return null;
  }

  return (
    <section className="mf-card overflow-hidden">
      <div className="border-b border-mf-border-subtle bg-mf-canvas px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1B4F8C]">
          <Rocket className="h-4 w-4" />
          Primeros pasos
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          Activa MiFicha en tu academia
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {completedCount} de {steps.length} pasos completados · fase de lanzamiento
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#1B4F8C] transition-all"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="divide-y divide-mf-border-subtle">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
              step.done && "bg-emerald-50/40",
            )}
          >
            <div className="flex items-start gap-3">
              {step.done ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
              )}
              <div>
                <p className="font-medium text-slate-900">
                  {step.title}
                  {step.optional ? (
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      (opcional)
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
              </div>
            </div>
            {!step.done ? (
              <Link
                href={step.href}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#1B4F8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#164278]"
              >
                {step.cta}
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
