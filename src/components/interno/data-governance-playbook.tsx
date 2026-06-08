"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import {
  MIFICHA_DATA_GOVERNANCE,
  getGovernanceResponsibilitiesFor,
} from "@/lib/match-data-governance";

const ACTOR_LABELS = {
  organizer: "Organizador",
  academy: "Academia",
  mificha: "MiFicha",
  parent: "Padres",
} as const;

export function DataGovernancePlaybook() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <header className="border-b border-white/10 px-6 py-5 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/interno/lanzamiento"
            className="inline-flex items-center gap-1 text-sm text-white/55 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Playbook de lanzamiento
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Interno · Modelo de datos
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Quién hace qué en MiFicha
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
            {MIFICHA_DATA_GOVERNANCE.principle}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-8 sm:px-10">
        <section className="grid gap-4 sm:grid-cols-2">
          {Object.entries(MIFICHA_DATA_GOVERNANCE.roles).map(([key, role]) => (
            <div
              key={key}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/90">
                {ACTOR_LABELS[key as keyof typeof ACTOR_LABELS]}
              </p>
              <h2 className="mt-2 font-semibold">{role.title}</h2>
              <p className="mt-2 text-sm text-white/60">{role.motto}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                {getGovernanceResponsibilitiesFor(key as keyof typeof ACTOR_LABELS).map(
                  (item) => (
                    <li key={item.id} className="flex gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/80" />
                      <span>{item.label}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Matriz de responsabilidades</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="pb-3 pr-4 font-medium">Dato</th>
                  <th className="pb-3 pr-4 font-medium">Responsable</th>
                  <th className="pb-3 font-medium">Por qué</th>
                </tr>
              </thead>
              <tbody>
                {MIFICHA_DATA_GOVERNANCE.responsibilities.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 align-top">
                    <td className="py-3 pr-4 font-medium text-white/90">{row.label}</td>
                    <td className="py-3 pr-4 text-emerald-200/90">
                      {ACTOR_LABELS[row.owner]}
                    </td>
                    <td className="py-3 text-white/60">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-6">
          <h2 className="text-lg font-semibold">Flujo post-partido (orden fijo)</h2>
          {MIFICHA_DATA_GOVERNANCE.workflow.map((step) => (
            <div key={step.phase} className="mt-5 border-t border-white/10 pt-5 first:mt-4 first:border-0 first:pt-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/80">
                {step.phase}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-white/45">Organizador</p>
                  <ul className="mt-2 space-y-1 text-sm text-white/75">
                    {step.organizer.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/45">Academia</p>
                  <ul className="mt-2 space-y-1 text-sm text-white/75">
                    {step.academy.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/45">MiFicha</p>
                  <ul className="mt-2 space-y-1 text-sm text-white/75">
                    {step.mificha.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="font-semibold">Eficiencia</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {MIFICHA_DATA_GOVERNANCE.efficiency.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="font-semibold">Credibilidad</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {MIFICHA_DATA_GOVERNANCE.credibility.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <Link
            href="/interno/jornadas"
            className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#0a1628]"
          >
            Ir a jornadas (marcador + acta)
          </Link>
          <Link
            href="/interno/lanzamiento"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5"
          >
            Playbook de venta
          </Link>
        </section>
      </main>
    </div>
  );
}
