import {
  GPH_PHYSICAL_TESTS,
  GPH_STATION_TESTS,
  GPH_VENUE_CODES,
  fieldSessionProgress,
  formatTestRaw,
  suggestedScore,
  testsForBattery,
  type GphEvidenceItem,
  type GphFieldSession,
} from "@/lib/gph-field-protocol";
import { indicatorById, type DiagnosisModule } from "@/lib/player-diagnosis";

interface FieldSessionReportProps {
  session: GphFieldSession | null | undefined;
  module: DiagnosisModule;
}

function hasRawTests(session: GphFieldSession) {
  return Object.values(session.tests).some(
    (capture) =>
      capture &&
      ((capture.attempts ?? []).some((value) => value != null) ||
        capture.hits != null ||
        capture.score != null),
  );
}

function evidenceLabel(item: GphEvidenceItem) {
  const station = GPH_STATION_TESTS.find((test) => test.id === item.stationId);
  const bits = [
    station ? `${station.number}. ${station.label}` : "",
    item.caption,
  ].filter(Boolean);
  return bits.join(" · ");
}

export function FieldSessionReport({ session, module }: FieldSessionReportProps) {
  if (!session) return null;
  const populated = hasRawTests(session);
  if (!populated && session.evidence.length === 0) return null;
  const tests = testsForBattery(module, session.protocolStage, session.sessionType);
  const progress = fieldSessionProgress(session, module);
  const venue = GPH_VENUE_CODES.find((item) => item.id === session.venueCode)?.label;
  const physical = GPH_PHYSICAL_TESTS.filter((item) => {
    const capture = session.physical[item.id];
    return capture && (capture.attempts.some((value) => value != null) || capture.note);
  });

  return (
    <section className="border-t border-mf-border-subtle px-5 py-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
        Estaciones GPH · dato crudo
      </p>
      {populated ? (
        <>
          <p className="mt-2 text-xs text-mf-text-muted">
            {session.protocolStage === "iniciacion" ? "Iniciación" : "Desarrollo"} ·{" "}
            {session.sessionType === "360" ? "360" : "Esencial"} · {progress.filled}/
            {progress.total} pruebas
            {venue ? ` · ${venue}` : session.venueCode ? ` · ${session.venueCode}` : ""}
            {session.surface ? ` · ${session.surface}` : ""}
            {session.weather ? ` · ${session.weather}` : ""}
            {session.ballSize ? ` · talla ${session.ballSize}` : ""}
            {session.ballPsi ? ` · ${session.ballPsi} PSI` : ""}
            {session.bibNumber ? ` · #${session.bibNumber}` : ""}
            {session.currentClub ? ` · ${session.currentClub}` : ""}
          </p>
          <p className="mt-1 text-[11px] text-mf-text-muted">
            Distancia reglamentaria: {tri(session.regulationDistance)} · Balón/superficie:{" "}
            {tri(session.ballSurfaceLogged)} · Video: {tri(session.keyTestsVideo)} · Ensayo:{" "}
            {tri(session.familiarizationDone)}
            {session.evidence.length ? ` · Evidencia: ${session.evidence.length}` : ""}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] text-mf-text-muted">
                  <th className="pb-2 font-medium">Prueba</th>
                  <th className="pb-2 font-medium">Dato capturado</th>
                  <th className="pb-2 font-medium">1–5</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => {
                  const capture = session.tests[test.id];
                  const score = capture ? capture.score ?? suggestedScore(test, capture) : null;
                  const indicator = test.indicatorId ? indicatorById(test.indicatorId) : null;
                  return (
                    <tr key={test.id} className="border-t border-mf-border-subtle align-top">
                      <td className="py-2 pr-3">
                        <p className="font-medium text-mf-text">
                          {test.number}. {test.label}
                        </p>
                        <p className="text-[11px] text-mf-text-muted">
                          {test.unit}
                          {indicator ? ` · ${indicator.label}` : ""}
                          {capture?.flagged ? " · prioridad" : ""}
                        </p>
                        {capture?.note ? (
                          <p className="mt-0.5 text-[11px] text-mf-text-secondary">{capture.note}</p>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 tabular-nums text-mf-text-secondary">
                        {formatTestRaw(test, capture)}
                      </td>
                      <td className="py-2 font-semibold tabular-nums text-mf-gph">
                        {score ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {physical.length > 0 ? (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                Físico 360
              </p>
              <ul className="mt-2 space-y-1 text-sm text-mf-text-secondary">
                {physical.map((test) => {
                  const capture = session.physical[test.id];
                  const values = (capture?.attempts ?? []).filter(
                    (value): value is number => value != null,
                  );
                  return (
                    <li key={test.id}>
                      {test.label}:{" "}
                      {values.length ? `${values.join(" / ")} ${test.unit}` : "—"}
                      {capture?.note ? ` · ${capture.note}` : ""}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {session.observation ? (
            <p className="mt-3 text-sm text-mf-text-secondary">
              <span className="font-medium text-mf-text">Observación. </span>
              {session.observation}
            </p>
          ) : null}
          {session.incident ? (
            <p className="mt-2 text-sm text-mf-text-secondary">
              <span className="font-medium text-mf-text">Incidencia. </span>
              {session.incident}
            </p>
          ) : null}
        </>
      ) : null}

      {session.evidence.length > 0 ? (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mf-gph">
            Evidencia
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {session.evidence.map((item) => {
              const label = evidenceLabel(item);
              return (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-mf-border-subtle bg-mf-canvas"
                >
                  {item.kind === "video" ? (
                    <video
                      src={item.url}
                      controls
                      playsInline
                      className="h-48 w-full bg-black object-cover print:hidden"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={label || "Evidencia"} className="h-48 w-full object-cover" />
                  )}
                  {label ? (
                    <figcaption className="px-3 py-2 text-[11px] text-mf-text-secondary">
                      {label}
                    </figcaption>
                  ) : null}
                </figure>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function tri(value: boolean | null) {
  if (value === true) return "sí";
  if (value === false) return "no";
  return "—";
}
