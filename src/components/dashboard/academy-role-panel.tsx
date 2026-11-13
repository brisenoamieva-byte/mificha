"use client";

import Link from "next/link";
import { ArrowRight, Link2, Trophy, Users } from "lucide-react";
import { ACADEMY_ROLE } from "@/lib/academy-role";

const loopIcons = {
  plantel: Users,
  partidos: Trophy,
  tutores: Link2,
} as const;

export function AcademyRolePanel() {
  return (
    <section className="rounded-2xl border border-mf-border bg-white p-5 shadow-sm sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-brand">
        {ACADEMY_ROLE.eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold text-mf-text">{ACADEMY_ROLE.headline}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-mf-text-secondary">
        {ACADEMY_ROLE.summary}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-mf-brand/20 bg-mf-brand-soft/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-mf-brand">
            {ACADEMY_ROLE.split.academy.title}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-mf-text">
            {ACADEMY_ROLE.split.academy.lines.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-mf-border bg-mf-canvas px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-mf-text-muted">
            {ACADEMY_ROLE.split.tutor.title}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-mf-text-secondary">
            {ACADEMY_ROLE.split.tutor.lines.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {ACADEMY_ROLE.loop.map((step) => {
          const Icon = loopIcons[step.id as keyof typeof loopIcons] ?? Users;
          return (
            <Link
              key={step.id}
              href={step.href}
              className="group flex flex-col rounded-xl border border-mf-border bg-mf-canvas px-4 py-3 transition hover:border-mf-brand/40 hover:bg-white"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-mf-text">
                <Icon className="h-4 w-4 text-mf-brand" />
                {step.title}
              </span>
              <span className="mt-1.5 flex-1 text-xs leading-5 text-mf-text-muted">
                {step.detail}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-mf-brand">
                {step.cta}
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-mf-text-muted">{ACADEMY_ROLE.billingNote}</p>
    </section>
  );
}
