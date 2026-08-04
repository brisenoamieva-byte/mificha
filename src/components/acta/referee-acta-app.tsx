"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { ActaQrCard } from "@/components/acta/acta-qr-card";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import {
  ACTA_EVENT_LABELS,
  ACTA_MIN_STARTERS,
  ACTA_STATUS_LABELS,
  computeScoreFromEvents,
  type ActaEventType,
  type ActaLineupRole,
  type ActaSessionStatus,
  type ActaSide,
} from "@/lib/match-acta";
import { cn } from "@/lib/utils";

interface RosterPlayer {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  position: string;
}

interface LineupRow {
  id: string;
  side: ActaSide;
  player_id: string | null;
  jersey_number: number | null;
  display_name: string;
  role: ActaLineupRole;
  sort_order: number;
}

interface EventRow {
  id: string;
  seq: number;
  minute: number;
  stoppage: number;
  event_type: ActaEventType;
  side: ActaSide;
  lineup_id: string | null;
  voided_at: string | null;
  void_reason: string | null;
}

interface SessionRow {
  id: string;
  status: ActaSessionStatus;
  opponent_name: string;
  category: string | null;
  venue_name: string | null;
  score_home: number | null;
  score_away: number | null;
  referee_name: string | null;
  home_academy_id: string;
  away_academy_id: string | null;
}

type CaptureStep = "side" | "player" | "action" | "confirm";

const ACTION_BUTTONS: Array<{ type: ActaEventType; label: string }> = [
  { type: "goal", label: "Gol" },
  { type: "assist", label: "Asistencia" },
  { type: "yellow_card", label: "Amarilla" },
  { type: "red_card", label: "Roja" },
  { type: "own_goal", label: "Autogol" },
  { type: "sub_out", label: "Sale" },
  { type: "sub_in", label: "Entra" },
];

export function RefereeActaApp({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionRow | null>(null);
  const [lineups, setLineups] = useState<LineupRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [roster, setRoster] = useState<{ home: RosterPlayer[]; away: RosterPlayer[] }>({
    home: [],
    away: [],
  });

  const [lineupSide, setLineupSide] = useState<ActaSide>("home");
  const [draftLineup, setDraftLineup] = useState<
    Array<{
      player_id: string | null;
      jersey_number: number | null;
      display_name: string;
      role: ActaLineupRole;
    }>
  >([]);
  const [manualName, setManualName] = useState("");
  const [manualJersey, setManualJersey] = useState("");

  const [captureStep, setCaptureStep] = useState<CaptureStep>("side");
  const [capSide, setCapSide] = useState<ActaSide>("home");
  const [capLineupId, setCapLineupId] = useState<string | null>(null);
  const [capAction, setCapAction] = useState<ActaEventType | null>(null);
  const [capMinute, setCapMinute] = useState(45);
  const [relatedLineupId, setRelatedLineupId] = useState<string | null>(null);

  const [refereeName, setRefereeName] = useState("");
  const [signLinks, setSignLinks] = useState<{
    home: string;
    away: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/fut/api/acta/${encodeURIComponent(token)}`);
      const payload = (await response.json()) as {
        error?: string;
        session?: SessionRow;
        lineups?: LineupRow[];
        events?: EventRow[];
        roster?: { home: RosterPlayer[]; away: RosterPlayer[] };
      };
      if (!response.ok) throw new Error(payload.error ?? "No se cargó el acta.");
      setSession(payload.session ?? null);
      setLineups(payload.lineups ?? []);
      setEvents(payload.events ?? []);
      setRoster(payload.roster ?? { home: [], away: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const existing = lineups
      .filter((row) => row.side === lineupSide)
      .map((row) => ({
        player_id: row.player_id,
        jersey_number: row.jersey_number,
        display_name: row.display_name,
        role: row.role,
      }));
    setDraftLineup(existing);
  }, [lineupSide, lineups]);

  const score = useMemo(() => computeScoreFromEvents(events), [events]);
  const activeEvents = useMemo(
    () => [...events].filter((e) => !e.voided_at).reverse(),
    [events],
  );

  const sideLineups = useMemo(
    () =>
      lineups
        .filter((row) => row.side === capSide)
        .sort((a, b) => (a.jersey_number ?? 99) - (b.jersey_number ?? 99)),
    [lineups, capSide],
  );

  async function saveLineup(startCapturing = false) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/fut/api/acta/${encodeURIComponent(token)}/lineup`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side: lineupSide,
          players: draftLineup,
          start_capturing: startCapturing,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "No se guardó la alineación.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: "capturing" | "review") {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/fut/api/acta/${encodeURIComponent(token)}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "No se pudo cambiar el estado.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setSaving(false);
    }
  }

  async function addEvent() {
    if (!capLineupId || !capAction) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/fut/api/acta/${encodeURIComponent(token)}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: capAction,
          side: capSide,
          lineup_id: capLineupId,
          related_lineup_id:
            capAction === "goal" || capAction === "sub_out" || capAction === "sub_in"
              ? relatedLineupId
              : null,
          minute: capMinute,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "No se registró el evento.");
      setCaptureStep("side");
      setCapLineupId(null);
      setCapAction(null);
      setRelatedLineupId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setSaving(false);
    }
  }

  async function voidEvent(id: string) {
    const reason = window.prompt("Motivo de anulación");
    if (!reason?.trim()) return;
    setSaving(true);
    try {
      const response = await fetch(
        `/fut/api/acta/${encodeURIComponent(token)}/events/${id}/void`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "No se anuló.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setSaving(false);
    }
  }

  async function closeActa() {
    if (!refereeName.trim()) {
      setError("Escribe el nombre del árbitro.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/fut/api/acta/${encodeURIComponent(token)}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referee_name: refereeName.trim() }),
      });
      const payload = (await response.json()) as {
        error?: string;
        home_sign_url?: string;
        away_sign_url?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? "No se cerró el acta.");
      setSignLinks({
        home: payload.home_sign_url ?? "",
        away: payload.away_sign_url ?? "",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setSaving(false);
    }
  }

  async function regenerateSignLinks() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/fut/api/acta/${encodeURIComponent(token)}/regenerate-signs`,
        { method: "POST" },
      );
      const payload = (await response.json()) as {
        error?: string;
        home_sign_url?: string;
        away_sign_url?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? "No se regeneraron firmas.");
      setSignLinks({
        home: payload.home_sign_url ?? "",
        away: payload.away_sign_url ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setSaving(false);
    }
  }

  function toggleRosterPlayer(player: RosterPlayer) {
    const name = `${player.first_name} ${player.last_name}`.trim();
    const exists = draftLineup.find((row) => row.player_id === player.id);
    if (exists) {
      setDraftLineup((prev) => prev.filter((row) => row.player_id !== player.id));
      return;
    }
    const starters = draftLineup.filter((row) => row.role === "starter").length;
    setDraftLineup((prev) => [
      ...prev,
      {
        player_id: player.id,
        jersey_number: player.jersey_number,
        display_name: name,
        role: starters < 11 ? "starter" : "bench",
      },
    ]);
  }

  function addManualPlayer() {
    const name = manualName.trim();
    if (!name) return;
    const jersey = manualJersey.trim() ? Number(manualJersey) : null;
    const starters = draftLineup.filter((row) => row.role === "starter").length;
    setDraftLineup((prev) => [
      ...prev,
      {
        player_id: null,
        jersey_number: Number.isFinite(jersey) ? jersey : null,
        display_name: name,
        role: starters < 11 ? "starter" : "bench",
      },
    ]);
    setManualName("");
    setManualJersey("");
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-mf-canvas">
        <Loader2 className="h-8 w-8 animate-spin text-mf-brand" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-mf-canvas px-4">
        <div className="max-w-md rounded-2xl border border-mf-border bg-white p-6 text-center">
          <p className="text-lg font-semibold text-mf-text">Acta no disponible</p>
          <p className="mt-2 text-sm text-mf-text-secondary">{error}</p>
          <BrandLogoLink className="mt-6 justify-center" size="sm" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  const status = session.status;
  const showLineup = status === "lineup";
  const showCapture = status === "capturing" || status === "review";
  const showClosed =
    status === "pending_signatures" ||
    status === "published" ||
    status === "disputed";

  return (
    <div className="min-h-dvh bg-mf-canvas px-4 py-5 mf-page-bottom">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-4 flex items-center justify-between gap-3">
          <BrandLogoLink size="sm" />
          <span className="rounded-full bg-mf-brand-soft px-3 py-1 text-xs font-semibold text-mf-brand">
            {ACTA_STATUS_LABELS[status]}
          </span>
        </div>

        <header className="rounded-2xl border border-mf-border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-mf-text-muted">
            Acta oficial · {session.category ?? "Categoría"}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-mf-text">
            Local vs {session.opponent_name}
          </h1>
          {session.venue_name ? (
            <p className="mt-1 text-sm text-mf-text-secondary">{session.venue_name}</p>
          ) : null}
          <p className="mt-3 text-3xl font-bold tabular-nums text-mf-brand">
            {score.home} — {score.away}
          </p>
        </header>

        {error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {showLineup ? (
          <section className="mt-4 rounded-2xl border border-mf-border bg-white p-4">
            <div className="flex gap-2">
              {(["home", "away"] as ActaSide[]).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => setLineupSide(side)}
                  className={cn(
                    "flex-1 rounded-xl px-3 py-3 text-sm font-semibold",
                    lineupSide === side
                      ? "bg-mf-brand text-white"
                      : "bg-mf-canvas text-mf-text-secondary",
                  )}
                >
                  {side === "home" ? "Local" : "Visitante"}
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm text-mf-text-secondary">
              Mínimo {ACTA_MIN_STARTERS} titulares. Tocá para agregar/quitar.
            </p>

            <div className="mt-3 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
              {(lineupSide === "home" ? roster.home : roster.away).map((player) => {
                const selected = draftLineup.some((row) => row.player_id === player.id);
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => toggleRosterPlayer(player)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left text-sm",
                      selected
                        ? "border-mf-brand bg-mf-brand-soft"
                        : "border-mf-border bg-mf-canvas",
                    )}
                  >
                    <span className="font-bold text-mf-brand">
                      {player.jersey_number ?? "—"}
                    </span>{" "}
                    {player.first_name} {player.last_name}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-[1fr_72px_auto] gap-2">
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Nombre manual"
                className="mf-input"
              />
              <input
                value={manualJersey}
                onChange={(e) => setManualJersey(e.target.value)}
                placeholder="#"
                className="mf-input"
              />
              <button
                type="button"
                onClick={addManualPlayer}
                className="rounded-xl bg-mf-canvas px-3 text-sm font-semibold text-mf-brand"
              >
                +
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {draftLineup.map((row, index) => (
                <li
                  key={`${row.player_id ?? row.display_name}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-xl bg-mf-canvas px-3 py-2 text-sm"
                >
                  <span>
                    <strong className="text-mf-brand">{row.jersey_number ?? "—"}</strong>{" "}
                    {row.display_name}
                  </span>
                  <select
                    value={row.role}
                    onChange={(e) => {
                      const role = e.target.value as ActaLineupRole;
                      setDraftLineup((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, role } : item)),
                      );
                    }}
                    className="rounded-lg border border-mf-border bg-white px-2 py-1 text-xs"
                  >
                    <option value="starter">Titular</option>
                    <option value="bench">Banca</option>
                  </select>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveLineup(false)}
                className="mf-btn-accent w-full justify-center"
              >
                Guardar {lineupSide === "home" ? "local" : "visitante"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveLineup(true)}
                className="mf-btn-primary w-full justify-center"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar e iniciar captura
              </button>
            </div>
          </section>
        ) : null}

        {showCapture ? (
          <section className="mt-4 space-y-4">
            <div className="rounded-2xl border border-mf-border bg-white p-4">
              {captureStep === "side" ? (
                <>
                  <p className="text-sm font-semibold text-mf-text">1. Equipo</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {(["home", "away"] as ActaSide[]).map((side) => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => {
                          setCapSide(side);
                          setCaptureStep("player");
                        }}
                        className="rounded-2xl bg-mf-brand px-4 py-8 text-lg font-bold text-white"
                      >
                        {side === "home" ? "Local" : "Visitante"}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              {captureStep === "player" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCaptureStep("side")}
                    className="mb-3 inline-flex items-center gap-1 text-sm text-mf-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" /> Equipo
                  </button>
                  <p className="text-sm font-semibold text-mf-text">2. Jugador</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {sideLineups.map((row) => (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => {
                          setCapLineupId(row.id);
                          setCaptureStep("action");
                        }}
                        className="rounded-xl border border-mf-border bg-mf-canvas px-3 py-4 text-left"
                      >
                        <span className="text-lg font-bold text-mf-brand">
                          {row.jersey_number ?? "—"}
                        </span>
                        <p className="text-sm font-medium text-mf-text">{row.display_name}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              {captureStep === "action" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCaptureStep("player")}
                    className="mb-3 inline-flex items-center gap-1 text-sm text-mf-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" /> Jugador
                  </button>
                  <p className="text-sm font-semibold text-mf-text">3. Acción</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {ACTION_BUTTONS.map((action) => (
                      <button
                        key={action.type}
                        type="button"
                        onClick={() => {
                          setCapAction(action.type);
                          setCaptureStep("confirm");
                        }}
                        className="rounded-xl bg-mf-brand px-3 py-5 text-sm font-bold text-white"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              {captureStep === "confirm" && capAction && capLineupId ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCaptureStep("action")}
                    className="mb-3 inline-flex items-center gap-1 text-sm text-mf-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" /> Acción
                  </button>
                  <p className="text-sm font-semibold text-mf-text">
                    Confirmar · {ACTA_EVENT_LABELS[capAction]}
                  </p>
                  <label className="mt-3 block text-xs font-medium text-mf-text-muted">
                    Minuto
                    <input
                      type="number"
                      min={0}
                      max={130}
                      value={capMinute}
                      onChange={(e) => setCapMinute(Number(e.target.value))}
                      className="mf-input mt-1"
                    />
                  </label>
                  {capAction === "goal" ? (
                    <label className="mt-3 block text-xs font-medium text-mf-text-muted">
                      Asistencia (opcional)
                      <select
                        value={relatedLineupId ?? ""}
                        onChange={(e) => setRelatedLineupId(e.target.value || null)}
                        className="mf-input mt-1"
                      >
                        <option value="">Sin asistencia</option>
                        {sideLineups
                          .filter((row) => row.id !== capLineupId)
                          .map((row) => (
                            <option key={row.id} value={row.id}>
                              {row.jersey_number ?? "—"} {row.display_name}
                            </option>
                          ))}
                      </select>
                    </label>
                  ) : null}
                  {(capAction === "sub_out" || capAction === "sub_in") ? (
                    <label className="mt-3 block text-xs font-medium text-mf-text-muted">
                      Pareja del cambio (opcional)
                      <select
                        value={relatedLineupId ?? ""}
                        onChange={(e) => setRelatedLineupId(e.target.value || null)}
                        className="mf-input mt-1"
                      >
                        <option value="">—</option>
                        {sideLineups
                          .filter((row) => row.id !== capLineupId)
                          .map((row) => (
                            <option key={row.id} value={row.id}>
                              {row.jersey_number ?? "—"} {row.display_name}
                            </option>
                          ))}
                      </select>
                    </label>
                  ) : null}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void addEvent()}
                    className="mf-btn-primary mt-4 w-full justify-center"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Confirmar
                  </button>
                </>
              ) : null}
            </div>

            <div className="rounded-2xl border border-mf-border bg-white p-4">
              <p className="text-sm font-semibold text-mf-text">Timeline</p>
              <ul className="mt-3 space-y-2">
                {activeEvents.length === 0 ? (
                  <li className="text-sm text-mf-text-muted">Sin eventos aún.</li>
                ) : (
                  activeEvents.map((event) => {
                    const player = lineups.find((row) => row.id === event.lineup_id);
                    return (
                      <li
                        key={event.id}
                        className="flex items-start justify-between gap-2 rounded-xl bg-mf-canvas px-3 py-2 text-sm"
                      >
                        <span>
                          <strong>{event.minute}&apos;</strong>{" "}
                          {ACTA_EVENT_LABELS[event.event_type]} ·{" "}
                          {player?.display_name ?? "—"} (
                          {event.side === "home" ? "L" : "V"})
                        </span>
                        <button
                          type="button"
                          onClick={() => void voidEvent(event.id)}
                          className="text-red-600"
                          aria-label="Anular"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>

              <div className="mt-4 space-y-2">
                {status === "capturing" ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void setStatus("review")}
                    className="mf-btn-accent w-full justify-center"
                  >
                    Ir a revisión
                  </button>
                ) : null}
                <label className="block text-xs font-medium text-mf-text-muted">
                  Nombre del árbitro
                  <input
                    value={refereeName}
                    onChange={(e) => setRefereeName(e.target.value)}
                    className="mf-input mt-1"
                    placeholder="Ej. Juan Pérez"
                  />
                </label>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void closeActa()}
                  className="mf-btn-primary w-full justify-center"
                >
                  Cerrar acta y pedir firmas
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {showClosed ? (
          <section className="mt-4 rounded-2xl border border-mf-border bg-white p-4">
            <p className="text-sm font-semibold text-mf-text">
              {status === "published"
                ? "Acta publicada"
                : status === "disputed"
                  ? "Acta en disputa"
                  : "Esperando firmas de delegados"}
            </p>
            {signLinks ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ActaQrCard label="Firma local" url={signLinks.home} size={150} />
                <ActaQrCard label="Firma visitante" url={signLinks.away} size={150} />
              </div>
            ) : status === "pending_signatures" ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-mf-text-secondary">
                  Si cerraste el acta en otro dispositivo, regenera los QR de firma aquí.
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void regenerateSignLinks()}
                  className="mf-btn-accent inline-flex w-full justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Regenerar QR de firmas
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-mf-text-secondary">
                No hay links de firma activos para este estado.
              </p>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
