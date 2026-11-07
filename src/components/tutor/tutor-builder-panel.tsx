"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Circle, Copy, ExternalLink, ImagePlus, Video } from "lucide-react";
import { TutorPublicFicha } from "@/components/tutor/tutor-public-ficha";
import {
  TUTOR_CITY_OPTIONS,
  TUTOR_POSITION_OPTIONS,
  tutorSharePath,
  type TutorChild,
  type TutorMaterialKind,
} from "@/lib/tutor-family";
import {
  buildTutorProgress,
  type TutorBuilderStepId,
} from "@/lib/tutor-ficha-progress";
import { MEMBERSHIP_CHECKOUT_DISABLED } from "@/lib/gph-commerce";
import { cn } from "@/lib/utils";

const inputClass =
  "mf-input mt-1 focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]";

export interface TutorBuilderChild {
  id: string;
  player_name: string;
  membership_until: string | null;
  share_token: string;
  active: boolean;
  linked_player_id?: string | null;
  linked_academy_id?: string | null;
  linked_academy_name?: string | null;
  linked_player_slug?: string | null;
  linked_at?: string | null;
  profile: TutorChild["profile"];
  materials: Array<{
    id: string;
    kind: TutorMaterialKind;
    title: string;
    body: string | null;
    url: string | null;
    created_at: string;
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
  onCopyShare: () => void;
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
  onCopyShare,
  onLinkPlayer,
  onUnlinkPlayer,
}: TutorBuilderPanelProps) {
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

  const progress = useMemo(
    () =>
      buildTutorProgress({
        player_name: form.player_name || child.player_name,
        profile: draftProfile,
        materials: child.materials,
      }),
    [child.materials, child.player_name, draftProfile, form.player_name],
  );
  const [step, setStep] = useState<TutorBuilderStepId>(progress.next.id);
  const lastSavedKey = useRef(`${child.id}:${child.materials.length}:${child.player_name}`);
  const shareHref = child.share_token ? tutorSharePath(child.share_token) : null;
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
            {shareHref ? (
              <div className="flex flex-wrap gap-2">
                <Link href={shareHref} target="_blank" className="mf-btn-gph-ghost">
                  <ExternalLink className="h-4 w-4" />
                  Abrir
                </Link>
                <button type="button" className="mf-btn-gph" onClick={onCopyShare}>
                  <Copy className="h-4 w-4" />
                  {copied ? "Copiado" : "Copiar link"}
                </button>
              </div>
            ) : null}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-mf-canvas">
            <div
              className="h-full rounded-full bg-mf-gph transition-[width] duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <TutorPublicFicha
          child={previewChild}
          materials={child.materials.map((item) => ({
            ...item,
            child_id: child.id,
            guardian_user_id: "",
            storage_path: null,
          }))}
          compact
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
            Cada dato alimenta la vista previa. Cuando esté lista, compartes un solo link.
          </p>
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
                      : "border-mf-border bg-mf-canvas hover:border-mf-gph/35",
                  )}
                >
                  <span className="mt-0.5 text-mf-gph">
                    {item.done ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4 text-mf-text-muted" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-mf-gph-ink">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-mf-text-secondary">
                      {item.hint}
                    </span>
                  </span>
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

            <button type="submit" disabled={busy} className="mf-btn-gph">
              {busy ? "Guardando…" : "Guardar y actualizar ficha"}
            </button>
          </form>
        )}

        {step === "material" ? (
          <section className="space-y-4 rounded-2xl border border-mf-border bg-white p-5">
            <StepHeading
              title="Material visual"
              detail="Fotos y videos alimentan la portada y la galería de la ficha."
            />
            {child.active ? (
              <>
                {progress.photos === 0 ? (
                  <p className="rounded-xl border border-mf-gph/30 bg-mf-gph-soft px-4 py-3 text-sm leading-6 text-mf-gph-ink">
                    La portada necesita al menos una foto clara de frente. Es el paso que
                    más profesionaliza la ficha.
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <label className="mf-btn-gph cursor-pointer">
                    <ImagePlus className="h-4 w-4" />
                    Agregar foto
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => void onFile("photo", event.target.files?.[0])}
                    />
                  </label>
                  <label className="mf-btn-gph-ghost cursor-pointer">
                    <Video className="h-4 w-4" />
                    Agregar video
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mf-gph">
                      {item.kind === "story"
                        ? "Nota"
                        : item.kind === "photo"
                          ? "Foto"
                          : "Video"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-mf-gph-ink">{item.title}</p>
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

        {step === "compartir" ? (
          <section className="space-y-4 rounded-2xl border border-mf-border bg-white p-5">
            <StepHeading
              title="Compartir la ficha"
              detail="Cuando la portada tenga datos y foto, el link ya sirve para visorías."
            />
            <p className="text-sm leading-7 text-mf-text-secondary">
              Completitud actual:{" "}
              <span className="font-semibold text-mf-gph-ink">{progress.percent}%</span>.{" "}
              {progress.percent >= 70
                ? "Ya se ve presentable."
                : `Siguiente: ${progress.next.label.toLowerCase()}.`}
            </p>
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
            <div className="rounded-xl bg-mf-canvas px-4 py-3 text-sm leading-6 text-mf-text-secondary">
              El diagnóstico GPH y las stats de torneo se suman a esta misma ficha cuando
              existan.{" "}
              <Link href="/fut/evaluaciones" className="font-semibold text-mf-gph hover:underline">
                Ver evaluaciones
              </Link>
              .
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
