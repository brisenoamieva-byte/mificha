"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Rocket } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AcademyLaunchCompletePanel } from "@/components/dashboard/academy-launch-complete-panel";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import {
  buildOnboardingSteps,
  computeOnboardingProgress,
  getOnboardingSummary,
  type OnboardingProgress,
} from "@/lib/academy-readiness";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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

    setProgress(
      computeOnboardingProgress(
        academy,
        playersResult.data ?? [],
        scheduledResult.count ?? 0,
        completedResult.count ?? 0,
      ),
    );
    setLoading(false);
  }, [academy]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const steps = useMemo(
    () => (progress ? buildOnboardingSteps(progress) : []),
    [progress],
  );
  const summary = useMemo(() => getOnboardingSummary(steps), [steps]);
  const nextEssentialStep = summary.essentialSteps.find((step) => !step.done);

  if (!academy || loading || !progress) {
    return null;
  }

  if (summary.allEssentialDone) {
    return <AcademyLaunchCompletePanel academySlug={academy.slug} />;
  }

  return (
    <section className="mf-card overflow-hidden">
      <div className="border-b border-mf-border-subtle bg-mf-canvas px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1B4F8C]">
          <Rocket className="h-4 w-4" />
          Primer valor en 3 pasos
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          Plantel → captura → WhatsApp a un padre
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {summary.essentialDone} de {summary.essentialTotal} esenciales ·{" "}
          {summary.completedCount} de {summary.totalSteps} incluyendo opcionales
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1B4F8C] to-mf-accent-dark transition-all"
            style={{
              width: `${(summary.essentialDone / summary.essentialTotal) * 100}%`,
            }}
          />
        </div>
        {nextEssentialStep ? (
          <p className="mt-3 text-sm text-mf-accent-dark">
            Siguiente: {nextEssentialStep.title}
          </p>
        ) : null}
      </div>

      <ol className="divide-y divide-mf-border-subtle">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
              step.done && "bg-emerald-50/40",
              step.essential && !step.done && "bg-mf-accent-soft/20",
            )}
          >
            <div className="flex items-start gap-3">
              {step.done ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <Circle
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    step.essential ? "text-mf-accent-dark" : "text-slate-300",
                  )}
                />
              )}
              <div>
                <p className="font-medium text-slate-900">
                  {step.title}
                  {step.essential ? (
                    <span className="ml-2 text-xs font-normal text-mf-accent-dark">
                      esencial
                    </span>
                  ) : null}
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
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white",
                  step.essential
                    ? "bg-mf-accent-dark hover:bg-[#047857]"
                    : "bg-[#1B4F8C] hover:bg-[#164278]",
                )}
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
