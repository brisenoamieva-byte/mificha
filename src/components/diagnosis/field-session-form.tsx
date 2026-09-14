"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { DiagnosisEvidenceCapture } from "@/components/diagnosis/diagnosis-evidence-capture";
import { MeasureField } from "@/components/diagnosis/measure-field";
import {
  GPH_BATTERY_SECTIONS,
  GPH_CLOSING_CHECKS,
  GPH_PENALTIES,
  GPH_PERCENTILE_NOTE,
  GPH_PROTOCOL_STAGES,
  GPH_REGULATION_RULE_COUNT,
  GPH_REGULATION_RULES,
  GPH_ROTATION_CAMPO,
  GPH_ROTATION_PORTERO,
  GPH_RUBRIC_06,
  GPH_SESSION_TYPES,
  GPH_SPEED_DRIBBLE_LABELS,
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
  passDistanceHitsTotal,
  physicalTestsForSession,
  shotDistanceEntry,
  shotDistanceSpecs,
  shotPowerBest,
  shotPrecisionTotal,
  testNeedsBilateral,
  testNeedsPassDistances,
  testNeedsRadar,
  testNeedsRubric06,
  testNeedsShotDistances,
  testNeedsSpeedDribbleRubric,
  testHeading,
  testsForBattery,
  weakerFootPercent,
  regulationOrderHits,
  regulationSlotMatches,
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
  const ruleSlots =
    test.id === "gph_reglas"
      ? Array.from({ length: GPH_REGULATION_RULE_COUNT }, (_, index) => base.ruleSlots?.[index] ?? "")
      : (base.ruleSlots ?? []);
  return {
    ...emptyTestCapture(test),
    ...base,
    attempts,
    ruleSlots,
    opportunities: base.opportunities ?? test.maxPoints ?? null,
  };
}

function attemptMeta(test: GphStationTest): {
  label: string;
  unit: string;
  integer: boolean;
  hint: string;
  attemptLabels?: readonly string[];
} {
  if (test.attemptLabels?.length) {
    return {
      label: "Intento",
      unit: test.unit,
      integer: test.kind !== "time" && test.kind !== "distance",
      hint: test.record,
      attemptLabels: test.attemptLabels,
    };
  }
  if (testNeedsSpeedDribbleRubric(test)) {
    return {
      label: "Rúbrica",
      unit: "",
      integer: true,
      hint: "2 rep. · 1 por perfil. 0 deficiente · 2 regular · 4 bueno · 6 óptimo.",
      attemptLabels: [...GPH_SPEED_DRIBBLE_LABELS],
    };
  }
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
  const physicalTests = physicalTestsForSession(session);
  const progress = fieldSessionProgress(session, module);
  const closing = session.closing ?? emptyClosing();
      const only360 = GPH_STATION_TESTS.filter(
    (test) =>
      !test.retired &&
      (test.appliesTo ?? [test.module]).includes(module) &&
      (test.stage === "ambos" || test.stage === session.protocolStage) &&
      test.usage === "plus",
  );
  const unsectionedTests = tests.filter((test) => !test.section);
  const orderedStationTests = [
    ...GPH_BATTERY_SECTIONS.flatMap((section) =>
      tests.filter((test) => test.section === section.id),
    ),
    ...unsectionedTests,
  ];

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
          <h2 className="text-base font-semibold text-mf-text">1–5. Batería GPH</h2>
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

      <div className="rounded-xl border border-mf-border-subtle p-3">
          <p className="text-sm font-semibold text-mf-text">1. Físicas</p>
          <p className="mt-1 text-[11px] text-mf-text-muted">
            Anota cada intento en su unidad. Supervisión de fisioterapia. Detener ante dolor,
            mareo o restricción conocida. {GPH_PERCENTILE_NOTE}
          </p>
          <div className="mt-3 space-y-4">
            {physicalTests.map((test, index) => {
              const prev = physicalTests[index - 1];
              const showSprintHeader =
                "group" in test &&
                test.group === "sprint" &&
                (!prev || !("group" in prev) || prev.group !== "sprint");
              const showFuerzaHeader =
                "group" in test &&
                test.group === "fuerza" &&
                (!prev || !("group" in prev) || prev.group !== "fuerza");
              const capture: GphPhysicalCapture = session.physical[test.id] ?? {
                attempts: Array.from({ length: test.attempts }, () => null),
                note: "",
                score: null,
              };
              const attempts = Array.from(
                { length: test.attempts },
                (_, i) => capture.attempts[i] ?? null,
              );
              return (
                <div key={test.id}>
                  {showSprintHeader ? (
                    <div className="mb-3 rounded-lg bg-mf-canvas px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-text">
                        1A) Sprint
                      </p>
                      <p className="mt-0.5 text-[11px] text-mf-text-muted">
                        Pruebas 5, 10, 20 y 30 m. Dos intentos por distancia; conservar el mejor.
                        Recuperación ~60 s entre intentos.
                      </p>
                    </div>
                  ) : null}
                  {showFuerzaHeader ? (
                    <div className="mb-3 rounded-lg bg-mf-canvas px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-text">
                        1E) Fuerza
                      </p>
                      <p className="mt-0.5 text-[11px] text-mf-text-muted">
                        1 intento de cada una. En 1 minuto, cuántas repeticiones.
                      </p>
                    </div>
                  ) : null}
                  <p className="text-xs font-medium text-mf-text">
                    {"code" in test && test.code ? `${test.code}) ${test.label}` : test.label}
                  </p>
                  <p className="text-[11px] text-mf-text-muted">{test.protocol}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {attempts.map((value, index) => (
                      <MeasureField
                        key={index}
                        label={`Intento ${index + 1}`}
                        unit={index === 0 ? test.unit : undefined}
                        value={value}
                        integer={test.unit === "rep"}
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

      <div className="space-y-3">
        {orderedStationTests.map((test, index) => {
          const prev = orderedStationTests[index - 1];
          const sectionMeta = GPH_BATTERY_SECTIONS.find((item) => item.id === test.section);
          const showSectionHeader = Boolean(test.section && test.section !== prev?.section);
          const showUnsectionedHeader = !test.section && Boolean(prev?.section || index === 0);
          const capture = captureFor(session, test);
          const auto = suggestedScore(test, capture);
          const complete = isTestCaptureComplete(test, session.tests[test.id] ?? capture);
          const indicator = test.indicatorId ? indicatorById(test.indicatorId) : null;
          const meta = attemptMeta(test);
          const best = bestAttempt(capture, test.kind);
          const avg = averageAttempt(capture);
          return (
            <div key={test.id} className="space-y-3">
              {showSectionHeader && sectionMeta ? (
                <div className="rounded-lg bg-mf-canvas px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-text">
                    {sectionMeta.number}. {sectionMeta.label}
                  </p>
                </div>
              ) : null}
              {showUnsectionedHeader ? (
                <div className="rounded-lg bg-mf-canvas px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-text">
                    Estaciones
                  </p>
                </div>
              ) : null}
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
                    {testHeading(test)}
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

              {test.id === "gph_reglas" ? (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] text-mf-text-muted">
                    {regulationOrderHits(capture.ruleSlots)}/{GPH_REGULATION_RULE_COUNT} en el
                    orden correcto · el jugador dicta; la clave es solo para el evaluador.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {capture.ruleSlots.map((value, slotIndex) => {
                      const key = GPH_REGULATION_RULES[slotIndex];
                      const spoken = value.trim();
                      const match = spoken ? regulationSlotMatches(slotIndex, spoken) : null;
                      return (
                        <label key={slotIndex} className="text-[11px] font-medium text-mf-text-muted">
                          Regla {slotIndex + 1}
                          {match === true ? " · ok" : match === false ? " · revisar" : ""}
                          <input
                            value={value}
                            onChange={(e) => {
                              const next = [...capture.ruleSlots];
                              next[slotIndex] = e.target.value;
                              patchTest(test, { ...capture, ruleSlots: next });
                            }}
                            className={cn(
                              "mf-input mt-1",
                              match === true
                                ? "border-mf-accent"
                                : match === false
                                  ? "border-mf-warning"
                                  : "",
                            )}
                            placeholder="Lo que dijo el jugador"
                          />
                          {key ? (
                            <span className="mt-0.5 block text-[10px] font-normal text-mf-text-muted">
                              Clave: {key.title}
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : isRatioKind(test.kind) ? (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {testNeedsShotDistances(test) ? (
                    <>
                      {(shotDistanceSpecs(test) ?? []).map((spec) => {
                        const entry = shotDistanceEntry(capture, spec.key);
                        return (
                          <div key={spec.key} className="col-span-2 contents sm:contents">
                            <MeasureField
                              label={`${spec.label} · precisión`}
                              value={entry.precision}
                              integer
                              max={test.maxPoints ?? undefined}
                              onChange={(precision) => {
                                const specs = shotDistanceSpecs(test) ?? [];
                                const keys = specs.map((item) => item.key);
                                const next: GphTestCapture = {
                                  ...capture,
                                  shotDistances: {
                                    ...capture.shotDistances,
                                    [spec.key]: { ...entry, precision },
                                  },
                                };
                                next.hits = shotPrecisionTotal(next, keys);
                                next.radarKmh = shotPowerBest(next, keys);
                                patchTest(test, next);
                              }}
                            />
                            <MeasureField
                              label={`${spec.label} · potencia`}
                              unit="km/h"
                              value={entry.powerKmh}
                              integer={false}
                              onChange={(powerKmh) => {
                                const specs = shotDistanceSpecs(test) ?? [];
                                const keys = specs.map((item) => item.key);
                                const next: GphTestCapture = {
                                  ...capture,
                                  shotDistances: {
                                    ...capture.shotDistances,
                                    [spec.key]: { ...entry, powerKmh },
                                  },
                                };
                                next.hits = shotPrecisionTotal(next, keys);
                                next.radarKmh = shotPowerBest(next, keys);
                                patchTest(test, next);
                              }}
                            />
                          </div>
                        );
                      })}
                      <MeasureField
                        label="Máx. precisión / distancia"
                        value={capture.opportunities}
                        integer
                        min={1}
                        onChange={(opportunities) =>
                          patchTest(test, { ...capture, opportunities })
                        }
                      />
                    </>
                  ) : testNeedsPassDistances(test) ? (
                    <>
                      <MeasureField
                        label="Aciertos 5 m"
                        value={capture.hits5m}
                        integer
                        max={test.maxPoints ?? undefined}
                        onChange={(hits5m) => {
                          const next = { ...capture, hits5m };
                          next.hits = passDistanceHitsTotal(next);
                          patchTest(test, next);
                        }}
                      />
                      <MeasureField
                        label="Aciertos 10 m"
                        value={capture.hits10m}
                        integer
                        max={test.maxPoints ?? undefined}
                        onChange={(hits10m) => {
                          const next = { ...capture, hits10m };
                          next.hits = passDistanceHitsTotal(next);
                          patchTest(test, next);
                        }}
                      />
                      <MeasureField
                        label="Aciertos 20 m"
                        value={capture.hits20m}
                        integer
                        max={test.maxPoints ?? undefined}
                        onChange={(hits20m) => {
                          const next = { ...capture, hits20m };
                          next.hits = passDistanceHitsTotal(next);
                          patchTest(test, next);
                        }}
                      />
                      <MeasureField
                        label="Sobre (por distancia)"
                        value={capture.opportunities}
                        integer
                        min={1}
                        onChange={(opportunities) =>
                          patchTest(test, { ...capture, opportunities })
                        }
                      />
                    </>
                  ) : (
                    <>
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
                        onChange={(opportunities) =>
                          patchTest(test, { ...capture, opportunities })
                        }
                      />
                    </>
                  )}
                  {test.kind === "ratio" ? (
                    <MeasureField
                      label="Errores"
                      value={capture.errors}
                      integer
                      onChange={(errors) => patchTest(test, { ...capture, errors })}
                    />
                  ) : null}
                  {testNeedsBilateral(test) && !testNeedsShotDistances(test) ? (
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
                  {testNeedsRadar(test) && !testNeedsShotDistances(test) ? (
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
                  {testNeedsRubric06(test) ? (
                    <div className="mt-2 space-y-2">
                      {capture.attempts.map((value, index) => (
                        <div
                          key={index}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <span className="w-20 text-[11px] font-medium text-mf-text-secondary">
                            {meta.attemptLabels?.[index] ?? `Intento ${index + 1}`}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {GPH_RUBRIC_06.map((level) => (
                              <button
                                key={level.value}
                                type="button"
                                title={level.label}
                                onClick={() => {
                                  const next = [...capture.attempts];
                                  next[index] = level.value;
                                  patchTest(test, { ...capture, attempts: next });
                                }}
                                className={cn(
                                  "h-9 min-w-9 rounded-lg px-2 text-sm font-semibold tabular-nums",
                                  value === level.value
                                    ? "bg-mf-brand text-white"
                                    : "bg-mf-canvas text-mf-text-secondary hover:bg-mf-brand-soft",
                                )}
                              >
                                {level.value}
                              </button>
                            ))}
                          </div>
                          {value != null ? (
                            <span className="text-[11px] text-mf-text-muted">
                              {GPH_RUBRIC_06.find((level) => level.value === value)?.label}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {capture.attempts.map((value, index) => (
                        <MeasureField
                          key={index}
                          label={meta.attemptLabels?.[index] ?? `${meta.label} ${index + 1}`}
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
                  )}
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
            </div>
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
