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

  if (!academy || loading || !progress) {
    return null;
  }

  if (summary.allRequiredDone) {
    return <AcademyLaunchCompletePanel academySlug={academy.slug} />;
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
          {summary.completedCount} de {summary.totalSteps} pasos completados · academia
          fundadora
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#1B4F8C] transition-all"
            style={{
              width: `${(summary.completedCount / summary.totalSteps) * 100}%`,
            }}
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
