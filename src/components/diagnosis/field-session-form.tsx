"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { DiagnosisEvidenceCapture } from "@/components/diagnosis/diagnosis-evidence-capture";
import { MeasureField } from "@/components/diagnosis/measure-field";
import {
  GPH_CLOSING_CHECKS,
  GPH_PENALTIES,
  GPH_PERCENTILE_NOTE,
  GPH_PHYSICAL_TESTS,
  GPH_PROTOCOL_STAGES,
  GPH_ROTATION_CAMPO,
  GPH_ROTATION_PORTERO,
  GPH_SESSION_TYPES,
  GPH_STATION_TESTS,
  GPH_VENUE_CODES,
  averageAttempt,
  bestAttempt,
  emptyTestCapture,
  fieldSessionProgress,
  formatMeasure,
  formatTestRaw,
  isRatioKind,
  isTestCaptureComplete,
  suggestedScore,
  testNeedsBilateral,
  testNeedsRadar,
  testsForBattery,
  weakerFootPercent,
  emptyClosing,
  type GphFieldSession,
  type GphPhysicalCapture,
  type GphProtocolStage,
  type GphSessionType,
  type GphStationTest,
  type GphTestCapture,
} from "@/lib/gph-field-protocol";
import { DIAGNOSIS_SCALE, indicatorById, type DiagnosisModule } from "@/lib/player-diagnosis";
import { cn } from "@/lib/utils";

interface FieldSessionFormProps {
  academyId: string;
  module: DiagnosisModule;
  session: GphFieldSession;
  onChange: (session: GphFieldSession) => void;
}

function triLabel(value: boolean | null) {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "—";
}

function cycleTri(value: boolean | null): boolean | null {
  if (value === null) return true;
  if (value === true) return false;
  return null;
}

function captureFor(session: GphFieldSession, test: GphStationTest): GphTestCapture {
  const base = session.tests[test.id] ?? emptyTestCapture(test);
  const attempts =
    base.attempts.length >= test.attempts
      ? base.attempts
      : [...base.attempts, ...Array.from({ length: test.attempts - base.attempts.length }, () => null)];
  return {
    ...emptyTestCapture(test),
    ...base,
    attempts,
    opportunities: base.opportunities ?? test.maxPoints ?? null,
  };
}

function attemptMeta(test: GphStationTest) {
  if (test.kind === "time") {
    return {
      label: "Tiempo",
      unit: "s",
      integer: false,
      hint: "Segundos ya con penalización (+1 cono, +2 pérdida).",
    };
  }
  if (test.kind === "distance") {
    return {
      label: "Marca",
      unit: test.unit,
      integer: false,
      hint: test.record,
    };
  }
  return {
    label: "Intento",
    unit: test.unit,
    integer: true,
    hint: test.record,
  };
}

export function FieldSessionForm({ academyId, module, session, onChange }: FieldSessionFormProps) {
  const tests = testsForBattery(module, session.protocolStage, session.sessionType);
  const rotation = module === "portero" ? GPH_ROTATION_PORTERO : GPH_ROTATION_CAMPO;
  const physicalTests = GPH_PHYSICAL_TESTS.filter(
    (item) => !item.desarrolloOnly || session.protocolStage === "desarrollo",
  );
  const progress = fieldSessionProgress(session, module);
  const closing = session.closing ?? emptyClosing();
  const only360 = GPH_STATION_TESTS.filter(
    (test) =>
      test.module === module &&
      test.stage === session.protocolStage &&
      test.usage === "plus",
  );

  function patch(partial: Partial<GphFieldSession>) {
    onChange({ ...session, ...partial });
  }

  function patchTest(test: GphStationTest, next: GphTestCapture, mode: "raw" | "score" = "raw") {
    const auto = suggestedScore(test, next);
    const score = mode === "score" ? next.score : auto != null ? auto : next.score;
    onChange({
      ...session,
      tests: {
        ...session.tests,
        [test.id]: { ...next, score },
      },
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-mf-border bg-white p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-mf-text">1. Estaciones en cancha</h2>
          <p className="mt-1 text-xs text-mf-text-muted">
            Captura el dato de cada prueba en su unidad. El 1–5 y la ficha salen de aquí.{" "}
            <Link href="/fut/dashboard/diagnostico/protocolo" className="font-semibold text-mf-brand hover:underline">
              Montaje
            </Link>
          </p>
          {session.sessionType === "esencial" && only360.length > 0 ? (
            <p className="mt-1 text-[11px] text-mf-text-muted">
              Numeración del manual. En Esencial no aparecen{" "}
              {only360.map((test) => test.number).join(", ")} ({only360
                .map((test) => test.label)
                .join(", ")}): son solo de 360.
            </p>
          ) : null}
        </div>
        <p
          className={cn(
            "text-xs font-semibold tabular-nums",
            progress.filled === progress.total ? "text-mf-accent-dark" : "text-mf-text-muted",
          )}
        >
          {progress.filled}/{progress.total} pruebas
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-medium text-mf-text-muted">
          Batería
          <select
            value={session.protocolStage}
            onChange={(e) =>
              patch({ protocolStage: e.target.value as GphProtocolStage, tests: {}, physical: {} })
            }
            className="mf-input mt-1"
          >
            {GPH_PROTOCOL_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage === "iniciacion" ? "Iniciación" : "Desarrollo"}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Tipo de sesión
          <select
            value={session.sessionType}
            onChange={(e) => patch({ sessionType: e.target.value as GphSessionType })}
            className="mf-input mt-1"
          >
            {GPH_SESSION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "esencial" ? "Esencial" : "360"}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Sede GPH
          <select
            value={session.venueCode}
            onChange={(e) => patch({ venueCode: e.target.value })}
            className="mf-input mt-1"
          >
            <option value="">Elegir</option>
            {GPH_VENUE_CODES.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Dorsal / número
          <input
            value={session.bibNumber ?? ""}
            onChange={(e) => patch({ bibNumber: e.target.value })}
            className="mf-input mt-1"
            placeholder="En todos los registros"
          />
        </label>
        <label className="text-xs font-medium text-mf-text-muted sm:col-span-2">
          Equipo / escuela actual
          <input
            value={session.currentClub ?? ""}
            onChange={(e) => patch({ currentClub: e.target.value })}
            className="mf-input mt-1"
            placeholder="Club o colegio"
          />
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Superficie
          <input
            value={session.surface}
            onChange={(e) => patch({ surface: e.target.value })}
            className="mf-input mt-1"
            placeholder="Pasto, sintética…"
          />
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Clima
          <input
            value={session.weather}
            onChange={(e) => patch({ weather: e.target.value })}
            className="mf-input mt-1"
            placeholder="Despejado, calor…"
          />
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Balón talla
          <input
            value={session.ballSize}
            onChange={(e) => patch({ ballSize: e.target.value })}
            className="mf-input mt-1"
            inputMode="numeric"
            placeholder="4 o 5"
          />
        </label>
        <MeasureField
          label="PSI"
          value={session.ballPsi === "" ? null : parseMeasureSafe(session.ballPsi)}
          onChange={(value) => patch({ ballPsi: value == null ? "" : formatMeasure(value, false) })}
          integer={false}
          min={0}
          max={16}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["familiarizationDone", "Ensayo de familiarización (no cuenta)"],
            ["regulationDistance", "Distancia reglamentaria"],
            ["ballSurfaceLogged", "Balón y superficie anotados"],
            ["keyTestsVideo", "Pruebas clave en video"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => patch({ [key]: cycleTri(session[key]) })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              session[key] === true
                ? "border-mf-brand bg-mf-brand-soft text-mf-brand"
                : "border-mf-border text-mf-text-secondary",
            )}
          >
            {label}: {triLabel(session[key])}
          </button>
        ))}
      </div>

      <ol className="grid gap-2 sm:grid-cols-5">
        {rotation.map((item) => (
          <li key={item.title} className="rounded-xl bg-mf-canvas px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
              {item.minutes}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-mf-text">{item.title}</p>
          </li>
        ))}
      </ol>

      <div className="space-y-3">
        {tests.map((test) => {
          const capture = captureFor(session, test);
          const auto = suggestedScore(test, capture);
          const complete = isTestCaptureComplete(test, session.tests[test.id] ?? capture);
          const indicator = test.indicatorId ? indicatorById(test.indicatorId) : null;
          const meta = attemptMeta(test);
          const best = bestAttempt(capture, test.kind);
          const avg = averageAttempt(capture);
          return (
            <article
              key={test.id}
              className={cn(
                "rounded-xl border p-3",
                complete ? "border-mf-accent/40 bg-mf-accent-soft/30" : "border-mf-border-subtle",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-mf-text">
                    {test.number}. {test.label}
                    {test.usage === "plus" ? (
                      <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-mf-gph">
                        360
                      </span>
                    ) : (
                      <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-mf-text-muted">
                        E
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-mf-text-muted">{test.execution}</p>
                  <p className="mt-0.5 text-[11px] text-mf-text-secondary">
                    Anotar: {test.record}
                    {indicator ? ` · Pasa a ${indicator.label}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => patchTest(test, { ...capture, flagged: !capture.flagged })}
                  className={cn(
                    "rounded-lg p-2",
                    capture.flagged ? "text-mf-brand" : "text-mf-text-muted",
                  )}
                  title="Prioridad"
                >
                  <Star className="h-4 w-4" fill={capture.flagged ? "currentColor" : "none"} />
                </button>
              </div>

              {isRatioKind(test.kind) ? (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MeasureField
                    label={test.kind === "points" ? "Puntos" : "Aciertos"}
                    value={capture.hits}
                    integer
                    max={test.maxPoints ? test.maxPoints * 2 : undefined}
                    onChange={(hits) => patchTest(test, { ...capture, hits })}
                  />
                  <MeasureField
                    label={test.kind === "points" ? "Máximo" : "Sobre"}
                    value={capture.opportunities}
                    integer
                    min={1}
                    onChange={(opportunities) => patchTest(test, { ...capture, opportunities })}
                  />
                  {test.kind === "ratio" ? (
                    <MeasureField
                      label="Errores"
                      value={capture.errors}
                      integer
                      onChange={(errors) => patchTest(test, { ...capture, errors })}
                    />
                  ) : null}
                  {testNeedsBilateral(test) ? (
                    <>
                      <MeasureField
                        label="Der"
                        value={capture.rightHits}
                        integer
                        onChange={(rightHits) => patchTest(test, { ...capture, rightHits })}
                      />
                      <MeasureField
                        label="Izq"
                        value={capture.leftHits}
                        integer
                        onChange={(leftHits) => patchTest(test, { ...capture, leftHits })}
                      />
                    </>
                  ) : null}
                  {testNeedsRadar(test) ? (
                    <MeasureField
                      label="Radar"
                      unit="km/h"
                      value={capture.radarKmh}
                      integer={false}
                      onChange={(radarKmh) => patchTest(test, { ...capture, radarKmh })}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-[11px] text-mf-text-muted">{meta.hint}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {capture.attempts.map((value, index) => (
                      <MeasureField
                        key={index}
                        label={`${meta.label} ${index + 1}`}
                        unit={index === 0 ? meta.unit : undefined}
                        value={value}
                        integer={meta.integer}
                        className="w-[4.75rem]"
                        onChange={(nextValue) => {
                          const next = [...capture.attempts];
                          next[index] = nextValue;
                          patchTest(test, { ...capture, attempts: next });
                        }}
                      />
                    ))}
                  </div>
                  {testNeedsBilateral(test) ? (
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-xs">
                      <MeasureField
                        label="Contactos Der"
                        value={capture.rightHits}
                        integer
                        onChange={(rightHits) => patchTest(test, { ...capture, rightHits })}
                      />
                      <MeasureField
                        label="Contactos Izq"
                        value={capture.leftHits}
                        integer
                        onChange={(leftHits) => patchTest(test, { ...capture, leftHits })}
                      />
                    </div>
                  ) : null}
                  {testNeedsRadar(test) ? (
                    <div className="mt-2 max-w-[8rem]">
                      <MeasureField
                        label="Radar"
                        unit="km/h"
                        value={capture.radarKmh}
                        integer={false}
                        onChange={(radarKmh) => patchTest(test, { ...capture, radarKmh })}
                      />
                    </div>
                  ) : null}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-mf-text-muted">
                <span className="tabular-nums text-mf-text-secondary">
                  Ficha: {formatTestRaw(test, capture)}
                </span>
                {best != null && !isRatioKind(test.kind) ? (
                  <span>Mejor {formatMeasure(best, meta.integer)}</span>
                ) : null}
                {avg != null && capture.attempts.filter((item) => item != null).length > 1 ? (
                  <span>Prom. {avg.toFixed(1)}</span>
                ) : null}
                {weakerFootPercent(capture.leftHits, capture.rightHits) != null ? (
                  <span>
                    Pie menor {Math.round(weakerFootPercent(capture.leftHits, capture.rightHits) ?? 0)}%
                  </span>
                ) : null}
                <label className="inline-flex items-center gap-1">
                  Relevancia
                  <select
                    value={capture.relevance}
                    onChange={(e) =>
                      patchTest(test, {
                        ...capture,
                        relevance: Number(e.target.value) as 1 | 2 | 3,
                      })
                    }
                    className="rounded-md border border-mf-border bg-white px-1.5 py-0.5"
                  >
                    <option value={1}>1 baja</option>
                    <option value={2}>2 media</option>
                    <option value={3}>3 alta</option>
                  </select>
                </label>
              </div>

              <div className="mt-3">
                <p className="text-[11px] font-medium text-mf-text-muted">
                  1–5 en ficha
                  {auto != null ? ` · sugerido ${auto}` : " · márcalo (esta prueba no tiene tabla automática)"}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {DIAGNOSIS_SCALE.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      title={level.hint}
                      onClick={() => patchTest(test, { ...capture, score: level.value }, "score")}
                      className={cn(
                        "h-9 w-9 rounded-lg text-sm font-semibold tabular-nums",
                        capture.score === level.value
                          ? "bg-mf-brand text-white"
                          : "bg-mf-canvas text-mf-text-secondary hover:bg-mf-brand-soft",
                      )}
                    >
                      {level.value}
                    </button>
                  ))}
                </div>
              </div>

              <input
                value={capture.note}
                onChange={(e) => patchTest(test, { ...capture, note: e.target.value })}
                placeholder="Nota de estación (pie, penalización, incidente…)"
                className="mf-input mt-3"
              />
            </article>
          );
        })}
      </div>

      {progress.missing.length > 0 ? (
        <p className="text-xs text-mf-warning">
          Faltan: {progress.missing.map((test) => test.label).join(", ")}.
        </p>
      ) : (
        <p className="text-xs text-mf-accent-dark">Estaciones completas. El dato ya alimenta la ficha.</p>
      )}

      {session.sessionType === "360" ? (
        <div className="rounded-xl border border-mf-border-subtle p-3">
          <p className="text-sm font-semibold text-mf-text">Físico y funcional · 360</p>
          <p className="mt-1 text-[11px] text-mf-text-muted">
            Anota cada intento en su unidad. Supervisión de fisioterapia. Detener ante dolor,
            mareo o restricción conocida. {GPH_PERCENTILE_NOTE}
          </p>
          <div className="mt-3 space-y-4">
            {physicalTests.map((test) => {
              const capture: GphPhysicalCapture = session.physical[test.id] ?? {
                attempts: Array.from({ length: test.attempts }, () => null),
                note: "",
                score: null,
              };
              const attempts =
                capture.attempts.length >= test.attempts
                  ? capture.attempts
                  : [
                      ...capture.attempts,
                      ...Array.from({ length: test.attempts - capture.attempts.length }, () => null),
                    ];
              return (
                <div key={test.id}>
                  <p className="text-xs font-medium text-mf-text">{test.label}</p>
                  <p className="text-[11px] text-mf-text-muted">{test.protocol}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {attempts.map((value, index) => (
                      <MeasureField
                        key={index}
                        label={`Intento ${index + 1}`}
                        unit={index === 0 ? test.unit : undefined}
                        value={value}
                        integer={false}
                        className="w-[4.75rem]"
                        onChange={(nextValue) => {
                          const next = [...attempts];
                          next[index] = nextValue;
                          patch({
                            physical: {
                              ...session.physical,
                              [test.id]: { ...capture, attempts: next },
                            },
                          });
                        }}
                      />
                    ))}
                  </div>
                  <input
                    value={capture.note}
                    onChange={(e) =>
                      patch({
                        physical: {
                          ...session.physical,
                          [test.id]: { ...capture, attempts, note: e.target.value },
                        },
                      })
                    }
                    placeholder="Nota (asimetría, dolor, no realizó…)"
                    className="mf-input mt-2"
                  />
                  <div className="mt-2">
                    <p className="text-[11px] font-medium text-mf-text-muted">
                      1–5 · {indicatorById(test.indicatorId)?.label ?? "físico"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {DIAGNOSIS_SCALE.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          title={level.hint}
                          onClick={() =>
                            patch({
                              physical: {
                                ...session.physical,
                                [test.id]: { ...capture, attempts, score: level.value },
                              },
                            })
                          }
                          className={cn(
                            "h-9 w-9 rounded-lg text-sm font-semibold tabular-nums",
                            capture.score === level.value
                              ? "bg-mf-brand text-white"
                              : "bg-mf-canvas text-mf-text-secondary hover:bg-mf-brand-soft",
                          )}
                        >
                          {level.value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <DiagnosisEvidenceCapture
        academyId={academyId}
        module={module}
        session={session}
        onChange={onChange}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-mf-text-muted">
          Observación inmediata
          <textarea
            value={session.observation}
            onChange={(e) => patch({ observation: e.target.value })}
            className="mf-input mt-1 min-h-20"
            placeholder="Lo que viste en cancha, no la etiqueta."
          />
        </label>
        <label className="text-xs font-medium text-mf-text-muted">
          Incidencia o intento repetido
          <textarea
            value={session.incident}
            onChange={(e) => patch({ incident: e.target.value })}
            className="mf-input mt-1 min-h-20"
            placeholder="Servicio inválido repetido, dolor, intento anulado…"
          />
        </label>
      </div>

      <div className="rounded-xl border border-mf-border-subtle p-3">
        <p className="text-sm font-semibold text-mf-text">Cierre operativo</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GPH_CLOSING_CHECKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                patch({
                  closing: {
                    ...closing,
                    [item.id]: cycleTri(closing[item.id]),
                  },
                })
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                session.closing?.[item.id] === true
                  ? "border-mf-brand bg-mf-brand-soft text-mf-brand"
                  : "border-mf-border text-mf-text-secondary",
              )}
            >
              {item.label}: {triLabel(closing[item.id])}
            </button>
          ))}
        </div>
        <label className="mt-3 block text-xs font-medium text-mf-text-muted">
          Fecha de retroalimentación
          <input
            type="date"
            value={closing.feedbackDate}
            onChange={(e) =>
              patch({
                closing: { ...closing, feedbackDate: e.target.value },
              })
            }
            className="mf-input mt-1 max-w-xs"
          />
        </label>
      </div>

      <ul className="space-y-1 text-[11px] text-mf-text-muted">
        {GPH_PENALTIES.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function parseMeasureSafe(raw: string) {
  const normalized = raw.trim().replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}
