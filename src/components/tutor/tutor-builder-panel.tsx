"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Circle, Copy, ExternalLink, ImagePlus, Video } from "lucide-react";
import { PlayerPublicCodeCard } from "@/components/public/player-public-code-card";
import { TutorPublicFicha } from "@/components/tutor/tutor-public-ficha";
import {
  defaultTutorSeasonLabel,
  TUTOR_CITY_OPTIONS,
  TUTOR_POSITION_OPTIONS,
  TUTOR_TOURNAMENT_PRESETS,
  tutorSharePath,
  type TutorChild,
  type TutorMaterialKind,
  type TutorSeasonInput,
  type TutorSeasonStat,
} from "@/lib/tutor-family";
import {
  buildTutorProgress,
  type TutorBuilderStepId,
} from "@/lib/tutor-ficha-progress";
import { MEMBERSHIP_CHECKOUT_DISABLED } from "@/lib/gph-commerce";
import type { TutorLinkedPerformance } from "@/lib/tutor-linked-performance";
import { cn } from "@/lib/utils";

function buildEmptySeasonForm(club?: string | null) {
  return {
    tournament_name: "",
    season_label: defaultTutorSeasonLabel(),
    team_name: (club ?? "").trim(),
    matches: "",
    goals: "",
    assists: "",
    minutes: "",
    notes: "",
  };
}

const emptySeasonForm = buildEmptySeasonForm();

const inputClass =
  "mf-input mt-1 focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]";

export interface TutorBuilderChild {
  id: string;
  player_name: string;
  membership_until: string | null;
  share_token: string;
  public_code: string;
  active: boolean;
  linked_player_id?: string | null;
  linked_academy_id?: string | null;
  linked_academy_name?: string | null;
  linked_player_slug?: string | null;
  linked_at?: string | null;
  linked_performance?: TutorLinkedPerformance | null;
  seasons?: TutorSeasonStat[];
  view_stats?: {
    total_views: number;
    unique_visitors: number;
    views_last_7_days: number;
  } | null;
  profile: TutorChild["profile"];
  materials: Array<{
    id: string;
    kind: TutorMaterialKind;
    title: string;
    body: string | null;
    url: string | null;
    created_at: string;
    is_cover?: boolean;
    is_featured?: boolean;
  }>;
}

export interface TutorLinkSuggestion {
  player_id: string;
  academy_id: string;
  academy_name: string;
  player_name: string;
  slug: string;
  reason: string;
}

interface TutorBuilderPanelProps {
  child: TutorBuilderChild;
  form: {
    player_name: string;
    birth_date: string;
    position: string;
    club: string;
    school: string;
    city: string;
    height_cm: string;
    dominant_foot: "" | "left" | "right" | "both";
    bio: string;
    goals: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<TutorBuilderPanelProps["form"]>
  >;
  busy: boolean;
  linkBusy: boolean;
  copied: boolean;
  linkSuggestions: TutorLinkSuggestion[];
  storyTitle: string;
  storyBody: string;
  setStoryTitle: (value: string) => void;
  setStoryBody: (value: string) => void;
  onSaveProfile: (event: React.FormEvent) => void;
  onSaveStory: (event: React.FormEvent) => void;
  onFile: (kind: "photo" | "video", file: File | undefined) => void;
  onDeleteMaterial: (materialId: string) => void;
  onSetCover: (materialId: string) => void;
  onSetFeaturedVideo: (materialId: string) => void;
  onSaveSeason: (input: TutorSeasonInput, seasonId?: string | null) => void;
  onDeleteSeason: (seasonId: string) => void;
  onCopyShare: () => void;
  onCopyPublicCode: () => void;
  onLinkPlayer: (playerId: string) => void;
  onUnlinkPlayer: () => void;
}

export function TutorBuilderPanel({
  child,
  form,
  setForm,
  busy,
  linkBusy,
  copied,
  linkSuggestions,
  storyTitle,
  storyBody,
  setStoryTitle,
  setStoryBody,
  onSaveProfile,
  onSaveStory,
  onFile,
  onDeleteMaterial,
  onSetCover,
  onSetFeaturedVideo,
  onSaveSeason,
  onDeleteSeason,
  onCopyShare,
  onCopyPublicCode,
  onLinkPlayer,
  onUnlinkPlayer,
}: TutorBuilderPanelProps) {
  const [seasonForm, setSeasonForm] = useState(() =>
    buildEmptySeasonForm(child.profile.club || form.club),
  );
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const isGoalkeeper = /portero/i.test(form.position || child.profile.position || "");

  const draftProfile = useMemo(
    () => ({
      birth_date: form.birth_date || null,
      position: form.position || null,
      club: form.club || null,
      school: form.school || null,
      city: form.city || null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      dominant_foot: form.dominant_foot || null,
      bio: form.bio || null,
      goals: form.goals || null,
    }),
    [form],
  );

  const seasons = child.seasons ?? [];

  const progress = useMemo(
    () =>
      buildTutorProgress({
        player_name: form.player_name || child.player_name,
        profile: draftProfile,
        materials: child.materials,
        seasons,
        hasLinkedAcademy: Boolean(child.linked_player_id),
      }),
    [
      child.linked_player_id,
      child.materials,
      child.player_name,
      draftProfile,
      form.player_name,
      seasons,
    ],
  );
  const [step, setStep] = useState<TutorBuilderStepId>(progress.next.id);
  const lastSavedKey = useRef(`${child.id}:${child.materials.length}:${child.player_name}`);
  const shareHref =
    child.public_code || child.share_token
      ? tutorSharePath(child.public_code || child.share_token)
      : null;
  const showAcademy = Boolean(child.linked_player_id) || linkSuggestions.length > 0;

  useEffect(() => {
    const key = `${child.id}:${child.materials.length}:${child.player_name}:${child.profile.bio ?? ""}:${child.profile.position ?? ""}`;
    if (lastSavedKey.current === key) return;
    lastSavedKey.current = key;
    setStep(progress.next.id);
  }, [child, progress.next.id]);

  const previewChild: TutorChild = {
    id: child.id,
    guardian_user_id: "",
    guardian_email: "",
    guardian_phone: null,
    player_name: form.player_name || child.player_name,
    membership_until: child.membership_until,
    source_folios: [],
    share_token: child.share_token,
    public_code: child.public_code || "",
    profile: draftProfile,
    created_at: "",
    linked_player_id: child.linked_player_id ?? null,
    linked_academy_id: child.linked_academy_id ?? null,
    linked_academy_name: child.linked_academy_name ?? null,
    linked_player_slug: child.linked_player_slug ?? null,
    linked_at: child.linked_at ?? null,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
      <div className="space-y-4 lg:sticky lg:top-20">
        <div className="rounded-2xl border border-mf-border bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                Vista previa
              </p>
              <h2 className="mt-1 text-lg font-semibold text-mf-gph-ink">
                Así se ve la ficha
              </h2>
              <p className="mt-1 text-sm text-mf-text-secondary">
                {progress.statusLabel} · {progress.percent}% completa
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {child.public_code ? (
                <button
                  type="button"
                  className="rounded-lg border border-mf-gph/30 bg-mf-gph-soft px-3 py-2 font-mono text-sm font-bold tracking-wide text-mf-gph"
                  onClick={onCopyPublicCode}
                  title="Código de jugador: tu número en toda MiFicha. Clic para copiar."
                >
                  {child.public_code}
                </button>
              ) : null}
              {shareHref ? (
                <>
                  <Link href={shareHref} target="_blank" className="mf-btn-gph-ghost">
                    <ExternalLink className="h-4 w-4" />
                    Abrir
                  </Link>
                  <button type="button" className="mf-btn-gph" onClick={onCopyShare}>
                    <Copy className="h-4 w-4" />
                    {copied ? "Copiado" : "Copiar link"}
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-mf-canvas">
            <div
              className="h-full rounded-full bg-mf-gph transition-[width] duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          {progress.photos === 0 ? (
            <button
              type="button"
              onClick={() => setStep("material")}
              className="mf-btn-gph mt-4 w-full sm:w-auto"
            >
              <ImagePlus className="h-4 w-4" />
              Subir foto de portada
            </button>
          ) : null}
        </div>

        <TutorPublicFicha
          child={previewChild}
          materials={child.materials.map((item) => ({
            ...item,
            child_id: child.id,
            guardian_user_id: "",
            storage_path: null,
          }))}
          performance={child.linked_performance ?? null}
          seasons={seasons}
        />
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border border-mf-border bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Armar ficha
          </p>
          <h2 className="mt-1 text-xl font-semibold text-mf-gph-ink">
            Completa paso a paso
          </h2>
          <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
            Toca cada paso para editarlo. Las fotos y videos se suben en{" "}
            <button
              type="button"
              className="font-semibold text-mf-gph underline-offset-2 hover:underline"
              onClick={() => setStep("material")}
            >
              Subir foto y video
            </button>
            .
          </p>

          {progress.photos === 0 ? (
            <button
              type="button"
              onClick={() => setStep("material")}
              className="mt-4 flex w-full items-center gap-3 rounded-xl border border-mf-gph/35 bg-mf-gph-soft px-4 py-4 text-left transition hover:border-mf-gph"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mf-gph text-white">
                <ImagePlus className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-mf-gph-ink">
                  Subir contenido de {child.player_name}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-mf-text-secondary">
                  Foto de portada, video o nota. Toca aquí para abrir la carga.
                </span>
              </span>
            </button>
          ) : null}

          <ol className="mt-5 space-y-2">
            {progress.steps.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
                    step === item.id
                      ? "border-mf-gph bg-mf-gph-soft"
                      : item.id === "material" && !item.done
                        ? "border-mf-gph/40 bg-white shadow-sm hover:border-mf-gph"
                        : "border-mf-border bg-mf-canvas hover:border-mf-gph/35",
                  )}
                >
                  <span className="mt-0.5 text-mf-gph">
                    {item.done ? (
                      <Check className="h-4 w-4" />
                    ) : item.id === "material" ? (
                      <ImagePlus className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4 text-mf-text-muted" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-mf-gph-ink">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-mf-text-secondary">
                      {item.hint}
                    </span>
                  </span>
                  {item.id === "material" && !item.done ? (
                    <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-gph">
                      Aquí
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ol>
        </section>

        {(step === "identidad" || step === "cancha" || step === "historia") && (
          <form
            onSubmit={onSaveProfile}
            className="space-y-4 rounded-2xl border border-mf-border bg-white p-5"
          >
            {step === "identidad" ? (
              <>
                <StepHeading
                  title="Identidad del jugador"
                  detail="Nombre completo y datos básicos para la portada."
                />
                <label className="block text-sm font-medium text-mf-text">
                  Nombre completo
                  <input
                    required
                    value={form.player_name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        player_name: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-mf-text">
                    Fecha de nacimiento
                    <input
                      type="date"
                      value={form.birth_date}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          birth_date: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-medium text-mf-text">
                    Ciudad
                    <select
                      value={form.city}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, city: event.target.value }))
                      }
                      className={inputClass}
                    >
                      <option value="">Selecciona…</option>
                      {TUTOR_CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                      {form.city &&
                      !(TUTOR_CITY_OPTIONS as readonly string[]).includes(form.city) ? (
                        <option value={form.city}>{form.city}</option>
                      ) : null}
                    </select>
                  </label>
                </div>
              </>
            ) : null}

            {step === "cancha" ? (
              <>
                <StepHeading
                  title="Perfil en cancha"
                  detail="Lo que un visor o club quiere ver de un vistazo."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-mf-text">
                    Posición
                    <select
                      value={form.position}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          position: event.target.value,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="">Selecciona…</option>
                      {TUTOR_POSITION_OPTIONS.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-mf-text">
                    Pie dominante
                    <select
                      value={form.dominant_foot}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          dominant_foot: event.target.value as typeof form.dominant_foot,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="">Selecciona…</option>
                      <option value="right">Diestro</option>
                      <option value="left">Zurdo</option>
                      <option value="both">Ambidiestro</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-mf-text">
                    Estatura (cm)
                    <input
                      inputMode="numeric"
                      value={form.height_cm}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          height_cm: event.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="165"
                    />
                  </label>
                  <label className="block text-sm font-medium text-mf-text">
                    Club o academia
                    <input
                      value={form.club}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, club: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-medium text-mf-text sm:col-span-2">
                    Escuela
                    <input
                      value={form.school}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, school: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </label>
                </div>
              </>
            ) : null}

            {step === "historia" ? (
              <>
                <StepHeading
                  title="Historia y objetivo"
                  detail="Texto corto para que la ficha se lea profesional."
                />
                <label className="block text-sm font-medium text-mf-text">
                  Presentación
                  <textarea
                    value={form.bio}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, bio: event.target.value }))
                    }
                    className={`${inputClass} min-h-28`}
                    placeholder="Quién es, cómo juega, trayectoria breve…"
                  />
                </label>
                <label className="block text-sm font-medium text-mf-text">
                  Objetivo
                  <textarea
                    value={form.goals}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, goals: event.target.value }))
                    }
                    className={`${inputClass} min-h-24`}
                    placeholder="Universidad, visoría, club, siguiente paso…"
                  />
                </label>
              </>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={busy} className="mf-btn-gph">
                {busy ? "Guardando…" : "Guardar y actualizar ficha"}
              </button>
              <button
                type="button"
                className="mf-btn-gph-ghost"
                onClick={() => setStep("material")}
              >
                <ImagePlus className="h-4 w-4" />
                Ir a subir foto y video
              </button>
            </div>
          </form>
        )}

        {step === "material" ? (
          <section className="space-y-4 rounded-2xl border border-mf-border bg-white p-5">
            <StepHeading
              title="Aquí subes el contenido"
              detail="Sube fotos y videos, elige portada y video destacado, o elimina lo que no quieras mostrar."
            />
            {child.active ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-mf-gph/40 bg-mf-gph-soft px-4 py-8 text-center transition hover:border-mf-gph hover:bg-mf-gph-soft/80">
                    <ImagePlus className="h-8 w-8 text-mf-gph" />
                    <span className="text-sm font-semibold text-mf-gph-ink">
                      Subir foto de portada
                    </span>
                    <span className="text-xs text-mf-text-secondary">
                      JPG o PNG · de frente, clara
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => void onFile("photo", event.target.files?.[0])}
                    />
                  </label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-mf-border bg-mf-canvas px-4 py-8 text-center transition hover:border-mf-gph/50">
                    <Video className="h-8 w-8 text-mf-gph" />
                    <span className="text-sm font-semibold text-mf-gph-ink">
                      Subir video
                    </span>
                    <span className="text-xs text-mf-text-secondary">
                      MP4 u otro formato corto
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      className="sr-only"
                      onChange={(event) => void onFile("video", event.target.files?.[0])}
                    />
                  </label>
                </div>
                <form onSubmit={onSaveStory} className="space-y-3 rounded-xl bg-mf-canvas p-4">
                  <p className="text-sm font-semibold text-mf-gph-ink">Nota para la ficha</p>
                  <input
                    value={storyTitle}
                    onChange={(event) => setStoryTitle(event.target.value)}
                    placeholder="Ej. Gol en la final / Cómo viene jugando"
                    className={inputClass}
                  />
                  <textarea
                    required
                    value={storyBody}
                    onChange={(event) => setStoryBody(event.target.value)}
                    placeholder="Cuenta un momento o el momento actual del jugador…"
                    className={`${inputClass} min-h-28`}
                  />
                  <button type="submit" disabled={busy} className="mf-btn-gph">
                    Guardar nota
                  </button>
                </form>
              </>
            ) : MEMBERSHIP_CHECKOUT_DISABLED ? (
              <p className="text-sm text-mf-text-secondary">
                Piloto activo.{" "}
                <Link
                  href="/fut/pagar?sku=diagnosis"
                  className="font-semibold text-mf-gph hover:underline"
                >
                  Diagnóstico GPH
                </Link>{" "}
                si lo necesitas.
              </p>
            ) : (
              <Link href="/fut/pagar?sku=membership" className="mf-btn-gph">
                Renovar año
              </Link>
            )}

            <ul className="space-y-3">
              {child.materials.length === 0 ? (
                <li className="text-sm text-mf-text-muted">
                  Aún no hay material. Empieza con una foto clara de frente.
                </li>
              ) : (
                child.materials.map((item) => (
                  <li key={item.id} className="rounded-xl border border-mf-border px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mf-gph">
                          {item.kind === "story"
                            ? "Nota"
                            : item.kind === "photo"
                              ? item.is_cover
                                ? "Foto · portada"
                                : "Foto"
                              : item.is_featured
                                ? "Video · destacado"
                                : "Video"}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-mf-gph-ink">
                          {item.title}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.kind === "photo" && !item.is_cover ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onSetCover(item.id)}
                            className="rounded-lg border border-mf-border px-2.5 py-1.5 text-xs font-semibold text-mf-gph hover:bg-mf-gph-soft"
                          >
                            Usar de portada
                          </button>
                        ) : null}
                        {item.kind === "video" && !item.is_featured ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onSetFeaturedVideo(item.id)}
                            className="rounded-lg border border-mf-border px-2.5 py-1.5 text-xs font-semibold text-mf-gph hover:bg-mf-gph-soft"
                          >
                            Destacar video
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onDeleteMaterial(item.id)}
                          className="rounded-lg border border-mf-border px-2.5 py-1.5 text-xs font-semibold text-mf-danger hover:bg-mf-danger-soft"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    {item.body ? (
                      <p className="mt-1 text-sm leading-6 text-mf-text-secondary">{item.body}</p>
                    ) : null}
                    {item.kind === "photo" && item.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt="" className="mt-3 max-h-56 rounded-lg" />
                    ) : null}
                    {item.kind === "video" && item.url ? (
                      <video
                        src={item.url}
                        controls
                        playsInline
                        className="mt-3 max-h-56 w-full rounded-lg bg-black"
                      />
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </section>
        ) : null}

        {step === "rendimiento" ? (
          <section className="space-y-4 rounded-2xl border border-mf-border bg-white p-5">
            <StepHeading
              title="Rendimiento"
              detail={
                child.linked_player_id
                  ? "Ya hay academia ligada: las stats oficiales salen en el link. Aquí puedes sumar torneos previos u otros equipos."
                  : "Sin academia aún: captura torneos, minutos, goles y asistencias para que un visor vea números en tu link."
              }
            />

            {child.linked_performance ? (
              <p className="rounded-xl bg-mf-gph-soft px-4 py-3 text-sm leading-6 text-mf-gph-ink">
                Academia ligada
                {child.linked_academy_name ? ` · ${child.linked_academy_name}` : ""}.
                El link público ya puede mostrar el bloque oficial de torneo.
              </p>
            ) : null}

            <form
              className="space-y-3 rounded-xl bg-mf-canvas p-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (
                  !Number(seasonForm.matches || 0) &&
                  !Number(seasonForm.minutes || 0)
                ) {
                  return;
                }
                onSaveSeason(
                  {
                    tournament_name: seasonForm.tournament_name,
                    season_label: seasonForm.season_label,
                    team_name: seasonForm.team_name || null,
                    matches: Number(seasonForm.matches || 0),
                    goals: Number(seasonForm.goals || 0),
                    assists: Number(seasonForm.assists || 0),
                    minutes: Number(seasonForm.minutes || 0),
                    notes: seasonForm.notes || null,
                  },
                  editingSeasonId,
                );
                setSeasonForm(buildEmptySeasonForm(form.club || child.profile.club));
                setEditingSeasonId(null);
              }}
            >
              <p className="text-sm font-semibold text-mf-gph-ink">
                {editingSeasonId ? "Editar torneo" : "Agregar torneo o temporada"}
              </p>
              {!editingSeasonId ? (
                <div className="flex flex-wrap gap-2">
                  {TUTOR_TOURNAMENT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                        seasonForm.tournament_name === preset
                          ? "border-mf-gph bg-mf-gph-soft text-mf-gph-ink"
                          : "border-mf-border bg-white text-mf-text-secondary hover:border-mf-gph/40 hover:text-mf-gph-ink",
                      )}
                      onClick={() =>
                        setSeasonForm((prev) => ({
                          ...prev,
                          tournament_name: preset,
                          season_label: prev.season_label || defaultTutorSeasonLabel(),
                          team_name:
                            prev.team_name || form.club || child.profile.club || "",
                        }))
                      }
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              ) : null}
              <input
                required
                value={seasonForm.tournament_name}
                onChange={(event) =>
                  setSeasonForm((prev) => ({
                    ...prev,
                    tournament_name: event.target.value,
                  }))
                }
                placeholder="Torneo / liga"
                className={inputClass}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={seasonForm.season_label}
                  onChange={(event) =>
                    setSeasonForm((prev) => ({
                      ...prev,
                      season_label: event.target.value,
                    }))
                  }
                  placeholder="Temporada (ej. Apertura 2026)"
                  className={inputClass}
                />
                <input
                  value={seasonForm.team_name}
                  onChange={(event) =>
                    setSeasonForm((prev) => ({
                      ...prev,
                      team_name: event.target.value,
                    }))
                  }
                  placeholder="Equipo / club"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(
                  [
                    ["matches", "Partidos"],
                    ["goals", isGoalkeeper ? "Goles (opc.)" : "Goles"],
                    ["assists", isGoalkeeper ? "Asist. (opc.)" : "Asistencias"],
                    ["minutes", "Minutos"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="text-xs font-medium text-mf-text-secondary">
                    {label}
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      required={key === "matches" || key === "minutes" ? false : undefined}
                      value={seasonForm[key]}
                      onChange={(event) =>
                        setSeasonForm((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>
              <p className="text-xs leading-5 text-mf-text-muted">
                {isGoalkeeper
                  ? "Para portero basta con partidos y minutos; en notas puedes poner atajadas o penales."
                  : "Indica al menos partidos o minutos para que cuente en la ficha."}
              </p>
              <textarea
                value={seasonForm.notes}
                onChange={(event) =>
                  setSeasonForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                placeholder={
                  isGoalkeeper
                    ? "Nota (ej. atajó 2 penales en semifinal Copa IDA)"
                    : "Nota opcional (ej. campeón de goleo, titular)"
                }
                className={`${inputClass} min-h-20`}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={
                    busy ||
                    (!Number(seasonForm.matches || 0) && !Number(seasonForm.minutes || 0))
                  }
                  className="mf-btn-gph"
                >
                  {editingSeasonId ? "Guardar cambios" : "Agregar a la ficha"}
                </button>
                {editingSeasonId ? (
                  <button
                    type="button"
                    className="mf-btn-gph-ghost"
                    onClick={() => {
                      setEditingSeasonId(null);
                      setSeasonForm(
                        buildEmptySeasonForm(form.club || child.profile.club),
                      );
                    }}
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>

            <ul className="space-y-3">
              {seasons.length === 0 ? (
                <li className="text-sm text-mf-text-muted">
                  Aún no hay torneos capturados. Agrega al menos uno con partidos o minutos.
                </li>
              ) : (
                seasons.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-xl border border-mf-border px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-mf-gph-ink">
                          {row.tournament_name}
                        </p>
                        <p className="mt-0.5 text-xs text-mf-text-muted">
                          {[row.season_label, row.team_name].filter(Boolean).join(" · ")}
                        </p>
                        <p className="mt-2 text-sm tabular-nums text-mf-text-secondary">
                          {row.matches} PJ · {row.goals} G · {row.assists} A · {row.minutes}{" "}
                          min
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          className="rounded-lg border border-mf-border px-2.5 py-1.5 text-xs font-semibold text-mf-gph hover:bg-mf-gph-soft"
                          onClick={() => {
                            setEditingSeasonId(row.id);
                            setSeasonForm({
                              tournament_name: row.tournament_name,
                              season_label: row.season_label,
                              team_name: row.team_name ?? "",
                              matches: String(row.matches || ""),
                              goals: String(row.goals || ""),
                              assists: String(row.assists || ""),
                              minutes: String(row.minutes || ""),
                              notes: row.notes ?? "",
                            });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          className="rounded-lg border border-mf-border px-2.5 py-1.5 text-xs font-semibold text-mf-danger hover:bg-mf-danger-soft"
                          onClick={() => onDeleteSeason(row.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        ) : null}

        {step === "compartir" ? (
          <section className="space-y-4 rounded-2xl border border-mf-border bg-white p-5">
            <StepHeading
              title="Compartir la ficha"
              detail="Ideal: foto, historia y al menos un torneo (o academia ligada)."
            />
            <p className="text-sm leading-7 text-mf-text-secondary">
              Completitud actual:{" "}
              <span className="font-semibold text-mf-gph-ink">{progress.percent}%</span>.{" "}
              {progress.percent >= 90
                ? "Lista para presentar."
                : `Siguiente: ${progress.next.label.toLowerCase()}.`}
            </p>
            {!child.linked_player_id && seasons.length === 0 ? (
              <div className="rounded-xl border border-mf-gph/25 bg-mf-gph-soft px-4 py-3">
                <p className="text-sm font-semibold text-mf-gph-ink">
                  Falta rendimiento en el link público
                </p>
                <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
                  Sin torneos, el visor solo ve historia y material. Agrega al menos un
                  torneo con partidos o minutos.
                </p>
                <button
                  type="button"
                  className="mf-btn-gph mt-3"
                  onClick={() => setStep("rendimiento")}
                >
                  Capturar torneo
                </button>
              </div>
            ) : null}
            {child.public_code ? (
              <PlayerPublicCodeCard
                code={child.public_code}
                onCopy={onCopyPublicCode}
                copied={copied}
                showOpenLink={Boolean(shareHref)}
              />
            ) : null}
            {shareHref ? (
              <div className="flex flex-wrap gap-2">
                <Link href={shareHref} target="_blank" className="mf-btn-gph">
                  Ver ficha pública
                </Link>
                <button type="button" className="mf-btn-gph-ghost" onClick={onCopyShare}>
                  {copied ? "Link copiado" : "Copiar link"}
                </button>
                <Link href="/fut/visorias" className="mf-btn-gph-ghost">
                  Ir a visorías
                </Link>
              </div>
            ) : null}
            {child.view_stats && child.view_stats.total_views > 0 ? (
              <p className="text-sm leading-6 text-mf-text-secondary">
                Vistas del link:{" "}
                <span className="font-semibold text-mf-gph-ink">
                  {child.view_stats.total_views}
                </span>
                {child.view_stats.views_last_7_days > 0
                  ? ` · ${child.view_stats.views_last_7_days} esta semana`
                  : ""}
                {child.view_stats.unique_visitors > 0
                  ? ` · ${child.view_stats.unique_visitors} visitantes`
                  : ""}
                .
              </p>
            ) : (
              <p className="text-sm leading-6 text-mf-text-secondary">
                Cuando alguien abra el link, aquí verás las visitas.
              </p>
            )}
            <div className="rounded-xl border border-mf-gph/25 bg-mf-gph-soft px-4 py-4">
              <p className="text-sm font-semibold text-mf-gph-ink">
                ¿Quieres el diagnóstico GPH de {child.player_name}?
              </p>
              <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
                Se agenda por WhatsApp y el informe queda ligado a esta ficha.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/fut/pagar?sku=diagnosis&player=${encodeURIComponent(child.player_name)}`}
                  className="mf-btn-gph"
                >
                  Pagar diagnóstico
                </Link>
                <Link href="/fut/evaluaciones" className="mf-btn-gph-ghost">
                  Ver detalle
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {showAcademy ? (
          <section className="rounded-2xl border border-mf-border bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Academia
            </p>
            {child.linked_player_id ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-6 text-mf-text-secondary">
                  Ligado a{" "}
                  <span className="font-semibold text-mf-gph-ink">
                    {child.linked_academy_name}
                  </span>
                  . En el link que compartes aparecen minutos, goles, asistencias y la
                  evaluación GPH cuando existan
                  {child.linked_player_slug ? (
                    <>
                      {" "}
                      ·{" "}
                      <Link
                        href={`/fut/j/${child.linked_player_slug}`}
                        className="font-semibold text-mf-gph hover:underline"
                        target="_blank"
                      >
                        ver ficha de torneo
                      </Link>
                    </>
                  ) : null}
                  .
                </p>
                <button
                  type="button"
                  disabled={linkBusy}
                  onClick={onUnlinkPlayer}
                  className="text-xs font-semibold text-mf-text-muted hover:text-mf-danger"
                >
                  Quitar vínculo
                </button>
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {linkSuggestions.map((item) => (
                  <li
                    key={item.player_id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-mf-canvas px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-mf-gph-ink">{item.player_name}</p>
                      <p className="text-xs text-mf-text-muted">
                        {item.academy_name} · {item.reason}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={linkBusy}
                      onClick={() => onLinkPlayer(item.player_id)}
                      className="mf-btn-gph"
                    >
                      {linkBusy ? "Ligando…" : "Es el mismo"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function StepHeading({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-mf-gph-ink">{title}</h3>
      <p className="mt-1 text-sm text-mf-text-secondary">{detail}</p>
    </div>
  );
}
