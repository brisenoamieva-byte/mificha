"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GphLogo } from "@/components/ui/gph-logo";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import {
  GPH_MANUAL_VERSION,
  GPH_PENALTIES,
  GPH_PERCENTILE_NOTE,
  GPH_PHYSICAL_TESTS,
  GPH_PRINCIPLE,
  GPH_PROTOCOL_STAGES,
  GPH_ROTATION_CAMPO,
  GPH_ROTATION_PORTERO,
  GPH_WEEK_360,
  testsForBattery,
  type GphProtocolStage,
} from "@/lib/gph-field-protocol";
import type { DiagnosisModule } from "@/lib/player-diagnosis";

export function GphProtocolContent() {
  const [module, setModule] = useState<DiagnosisModule>("campo");
  const [stage, setStage] = useState<GphProtocolStage>("iniciacion");
  const tests = useMemo(() => testsForBattery(module, stage, "360"), [module, stage]);
  const rotation = module === "portero" ? GPH_ROTATION_PORTERO : GPH_ROTATION_CAMPO;

  return (
    <div className="diagnosis-report mx-auto max-w-3xl space-y-6">
      <Link
        href="/fut/dashboard/diagnostico/nuevo"
        className="inline-flex items-center gap-1 text-sm text-mf-text-secondary hover:text-mf-brand print:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a capturar
      </Link>

      <article className="overflow-hidden rounded-2xl border border-mf-border bg-white">
        <header className="flex items-center justify-between gap-4 border-b border-mf-border-subtle px-5 py-3">
          <GphLogo size="sm" />
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-text-muted">
              Manual en cancha
            </p>
            <p className="text-xs text-mf-text-secondary">{GPH_MANUAL_VERSION}</p>
          </div>
        </header>
        <div className="h-[4px] bg-mf-gph" aria-hidden />

        <div className="space-y-5 px-5 py-5">
          <p className="text-sm leading-6 text-mf-text-secondary">{GPH_PRINCIPLE}</p>
          <p className="text-sm text-mf-text">
            La validez depende de repetir las mismas condiciones. Marcar distancias con cinta;
            un ensayo de familiarización no cuenta. Protocolo GPH ·{" "}
            <BrandWordmark className="text-sm" />.
          </p>

          <div className="flex flex-wrap gap-2 print:hidden">
            {(["campo", "portero"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setModule(item)}
                className={
                  module === item
                    ? "mf-btn-primary"
                    : "rounded-full border border-mf-border px-4 py-2 text-sm"
                }
              >
                {item === "campo" ? "Jugadores" : "Porteros"}
              </button>
            ))}
            {GPH_PROTOCOL_STAGES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStage(item)}
                className={
                  stage === item
                    ? "mf-btn-primary"
                    : "rounded-full border border-mf-border px-4 py-2 text-sm"
                }
              >
                {item === "iniciacion" ? "Iniciación" : "Desarrollo"}
              </button>
            ))}
            <button type="button" onClick={() => window.print()} className="mf-btn-ghost">
              Imprimir
            </button>
          </div>

          <ol className="grid gap-2 sm:grid-cols-5">
            {rotation.map((item) => (
              <li key={item.title} className="rounded-xl bg-mf-canvas px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                  {item.minutes}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-mf-text">{item.title}</p>
                <p className="mt-1 text-[11px] text-mf-text-muted">{item.detail}</p>
              </li>
            ))}
          </ol>

          <div className="space-y-3">
            {tests.map((test) => (
              <article key={test.id} className="rounded-xl border border-mf-border-subtle p-3">
                <p className="text-sm font-semibold text-mf-text">
                  {test.number}. {test.label}
                  {test.usage === "plus" ? (
                    <span className="ml-2 text-[10px] uppercase text-mf-gph">360</span>
                  ) : (
                    <span className="ml-2 text-[10px] uppercase text-mf-text-muted">E / 360</span>
                  )}
                </p>
                <dl className="mt-2 grid gap-2 text-[13px] text-mf-text-secondary sm:grid-cols-3">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-mf-text-muted">
                      Montaje
                    </dt>
                    <dd className="mt-0.5">{test.setup}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-mf-text-muted">
                      Ejecución
                    </dt>
                    <dd className="mt-0.5">{test.execution}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-mf-text-muted">
                      Registrar
                    </dt>
                    <dd className="mt-0.5">{test.record}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          {stage === "desarrollo" || module === "campo" ? (
            <section>
              <p className="text-sm font-semibold text-mf-text">Semana GPH 360</p>
              <ul className="mt-2 space-y-2">
                {GPH_WEEK_360.map((day) => (
                  <li key={day.day} className="rounded-xl bg-mf-canvas px-3 py-2 text-sm">
                    <span className="font-semibold">Día {day.day}. {day.title}.</span>{" "}
                    <span className="text-mf-text-secondary">{day.tests} Entregable: {day.deliverable}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs font-medium text-mf-text">Físico (día 2, con fisioterapia)</p>
              <ul className="mt-1 space-y-1 text-xs text-mf-text-secondary">
                {GPH_PHYSICAL_TESTS.map((item) => (
                  <li key={item.id}>
                    {item.label}: {item.protocol}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <ul className="space-y-1 text-xs text-mf-text-muted">
            {GPH_PENALTIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-xs text-mf-text-secondary">{GPH_PERCENTILE_NOTE}</p>
          <p className="text-xs text-mf-text-muted">
            Cierre: pruebas completas, videos identificados, datos cargados, incidencias,
            reporte programado y fecha de retroalimentación. Nutrición se anota aparte; no
            entra al 1–5 de fútbol.
          </p>
        </div>
      </article>
    </div>
  );
}
