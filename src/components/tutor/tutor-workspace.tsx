"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { signIn, signUp } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  TUTOR_CITY_OPTIONS,
  TUTOR_PILOT_FREE,
  TUTOR_PILOT_LABEL,
  TUTOR_POSITION_OPTIONS,
  tutorSharePath,
  type TutorMaterialKind,
} from "@/lib/tutor-family";

const PHONE_STORAGE_KEY = "mificha.tutor.phone";

interface MaterialItem {
  id: string;
  kind: TutorMaterialKind;
  title: string;
  body: string | null;
  url: string | null;
  created_at: string;
}

interface TutorChildCard {
  id: string;
  player_name: string;
  membership_until: string | null;
  share_token: string;
  active: boolean;
  profile: {
    birth_date: string | null;
    position: string | null;
    club: string | null;
    school: string | null;
    city: string | null;
    height_cm: number | null;
    dominant_foot: "left" | "right" | "both" | null;
    bio: string | null;
    goals: string | null;
  };
  materials: MaterialItem[];
}

const inputClass =
  "mf-input mt-1 focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]";

const emptyForm = {
  player_name: "",
  birth_date: "",
  position: "",
  club: "",
  school: "",
  city: "",
  height_cm: "",
  dominant_foot: "" as "" | "left" | "right" | "both",
  bio: "",
  goals: "",
};

async function authed(path: string, init?: RequestInit) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Inicia sesión.");
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    children?: TutorChildCard[];
    token?: string;
    path?: string;
    child?: TutorChildCard;
  };
  if (!response.ok) throw new Error(payload.error || "No se pudo completar.");
  return payload;
}

export function TutorWorkspace() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [children, setChildren] = useState<TutorChildCard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const childPanelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async (whatsapp: string, preferId?: string | null) => {
    const query = whatsapp ? `?phone=${encodeURIComponent(whatsapp)}` : "";
    const payload = await authed(`/fut/api/tutor/home${query}`);
    const rows = payload.children ?? [];
    setChildren(rows);
    setSelectedId((current) => {
      if (preferId && rows.some((row) => row.id === preferId)) return preferId;
      if (current && rows.some((row) => row.id === current)) return current;
      return rows[0]?.id ?? null;
    });
    return rows;
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PHONE_STORAGE_KEY);
      if (saved) setPhone(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const current = data.session?.user.email ?? null;
      setSessionEmail(current);
      setLoading(false);
      if (current) {
        const savedPhone =
          typeof window !== "undefined"
            ? window.localStorage.getItem(PHONE_STORAGE_KEY) ?? ""
            : "";
        void load(savedPhone || phone).catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "No se cargó la ficha.");
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const child = children.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (!child || editing) return;
    setForm({
      player_name: child.player_name,
      birth_date: child.profile.birth_date ?? "",
      position: child.profile.position ?? "",
      club: child.profile.club ?? "",
      school: child.profile.school ?? "",
      city: child.profile.city ?? "",
      height_cm: child.profile.height_cm != null ? String(child.profile.height_cm) : "",
      dominant_foot: child.profile.dominant_foot ?? "",
      bio: child.profile.bio ?? "",
      goals: child.profile.goals ?? "",
    });
  }, [child, editing]);

  async function onAuth(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const created = await signUp(email, password, "academy_admin", fullName);
        if (!created.session) {
          setError("Cuenta creada. Confirma el correo si te llegó el aviso y luego entra.");
          return;
        }
      } else {
        await signIn(email.trim().toLowerCase(), password);
      }
      if (phone) {
        try {
          window.localStorage.setItem(PHONE_STORAGE_KEY, phone);
        } catch {
          /* ignore */
        }
      }
      setSessionEmail(email.trim().toLowerCase());
      await load(phone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo entrar.");
    } finally {
      setBusy(false);
    }
  }

  async function saveChild(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const wasEditing = editing;
    try {
      if (phone) {
        try {
          window.localStorage.setItem(PHONE_STORAGE_KEY, phone);
        } catch {
          /* ignore */
        }
      }
      const payload = await authed("/fut/api/tutor/children", {
        method: "POST",
        body: JSON.stringify({
          child_id: wasEditing && child ? child.id : undefined,
          player_name: form.player_name,
          guardian_phone: phone || undefined,
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
      });
      const createdId = payload.child?.id ?? null;
      await load(phone, createdId);
      if (createdId) setSelectedId(createdId);
      setEditing(false);
      setNotice(
        wasEditing
          ? "Cambios guardados. Abajo está la ficha de tu hijo."
          : "Ficha creada. Abajo puedes verla, copiar el link o subir fotos.",
      );
      window.setTimeout(() => {
        childPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se guardó el jugador.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  }

  async function saveStory(event: React.FormEvent) {
    event.preventDefault();
    if (!child) return;
    setBusy(true);
    setError(null);
    try {
      await authed("/fut/api/tutor/materials", {
        method: "POST",
        body: JSON.stringify({
          action: "story",
          child_id: child.id,
          title: storyTitle,
          body: storyBody,
        }),
      });
      setStoryTitle("");
      setStoryBody("");
      await load(phone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se guardó la nota.");
    } finally {
      setBusy(false);
    }
  }

  async function onFile(kind: "photo" | "video", file: File | undefined) {
    if (!child || !file) return;
    setBusy(true);
    setError(null);
    try {
      const prepared = await authed("/fut/api/tutor/materials", {
        method: "POST",
        body: JSON.stringify({
          action: "prepare",
          child_id: child.id,
          kind,
          file_name: file.name,
        }),
      });
      if (!prepared.token || !prepared.path) throw new Error("No se abrió la carga.");
      const uploaded = await supabase.storage
        .from("mificha-ops")
        .uploadToSignedUrl(prepared.path, prepared.token, file);
      if (uploaded.error) throw new Error(uploaded.error.message);
      await authed("/fut/api/tutor/materials", {
        method: "POST",
        body: JSON.stringify({
          action: "commit",
          child_id: child.id,
          kind,
          title: file.name,
          path: prepared.path,
        }),
      });
      await load(phone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se subió el archivo.");
    } finally {
      setBusy(false);
    }
  }

  async function copyShare() {
    if (!child?.share_token) return;
    const url = `${window.location.origin}${tutorSharePath(child.share_token)}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <p className="text-sm text-mf-text-muted">Cargando…</p>;
  }

  if (!sessionEmail) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            {TUTOR_PILOT_FREE ? "Piloto gratuito" : "Tutor"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
            Organiza la ficha de tu hijo
          </h1>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            Sube fotos, videos e historia. Arma una ficha para presentar en
            universidades, visorías o clubes.{" "}
            {TUTOR_PILOT_FREE ? TUTOR_PILOT_LABEL : "Incluido con la membresía anual."}
          </p>
        </div>
        <form onSubmit={(event) => void onAuth(event)} className="space-y-4 rounded-xl border border-mf-border bg-white p-5">
          <div className="flex gap-2 text-sm font-semibold">
            <button
              type="button"
              className={mode === "signup" ? "text-mf-gph" : "text-mf-text-muted"}
              onClick={() => setMode("signup")}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              className={mode === "login" ? "text-mf-gph" : "text-mf-text-muted"}
              onClick={() => setMode("login")}
            >
              Entrar
            </button>
          </div>
          {mode === "signup" ? (
            <label className="block text-sm font-medium text-mf-text">
              Tu nombre
              <input
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={inputClass}
              />
            </label>
          ) : null}
          <label className="block text-sm font-medium text-mf-text">
            Correo
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            WhatsApp
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClass}
              placeholder="10 dígitos"
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Contraseña
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </label>
          {error ? <p className="text-sm text-mf-danger">{error}</p> : null}
          <button type="submit" disabled={busy} className="mf-btn-gph w-full justify-center">
            {busy ? "Entrando…" : mode === "login" ? "Entrar" : "Empezar piloto"}
          </button>
        </form>
      </div>
    );
  }

  const shareHref = child?.share_token ? tutorSharePath(child.share_token) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            {TUTOR_PILOT_FREE ? "Piloto gratuito" : "Tutor"}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-mf-gph-ink">
            Ficha de tus hijos
          </h1>
          <p className="mt-1 text-sm text-mf-text-secondary">{sessionEmail}</p>
          {TUTOR_PILOT_FREE ? (
            <p className="mt-1 text-xs text-mf-text-muted">{TUTOR_PILOT_LABEL}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-mf-text-muted hover:text-mf-text"
          onClick={() => void supabase.auth.signOut().then(() => setSessionEmail(null))}
        >
          Salir
        </button>
      </div>

      {error ? (
        <p className="rounded-lg bg-mf-danger-soft px-4 py-3 text-sm text-mf-danger">{error}</p>
      ) : null}
      {notice ? (
        <p className="rounded-lg bg-mf-gph-soft px-4 py-3 text-sm font-medium text-mf-gph-ink">
          {notice}
        </p>
      ) : null}

      {children.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            Tus hijos · elige uno para ver su ficha
          </p>
          <div className="flex flex-wrap gap-2">
            {children.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setEditing(false);
                  setNotice(null);
                  setError(null);
                }}
                className={
                  item.id === child?.id
                    ? "rounded-full bg-mf-gph px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-mf-border bg-white px-4 py-2 text-sm font-semibold text-mf-gph-ink"
                }
              >
                {item.player_name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setEditing(false);
                setForm(emptyForm);
                setNotice(null);
                setError(null);
              }}
              className="rounded-full border border-dashed border-mf-gph/40 px-4 py-2 text-sm font-semibold text-mf-gph"
            >
              + Otro hijo
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-mf-border bg-white px-4 py-3 text-sm text-mf-text-secondary">
          Aún no hay jugadores. Completa el formulario y pulsa <strong>Crear ficha</strong>.
        </p>
      )}

      {!child || editing || children.length === 0 ? (
        <form
          onSubmit={(event) => void saveChild(event)}
          className="space-y-4 rounded-xl border border-mf-border bg-white p-5"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              {editing ? "Editar ficha" : "Nuevo jugador"}
            </p>
            <p className="mt-1 text-sm text-mf-text-secondary">
              Datos para presentar en visorías, universidades o clubes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-mf-text sm:col-span-2">
              Nombre completo
              <input
                required
                value={form.player_name}
                onChange={(event) => setForm((current) => ({ ...current, player_name: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-mf-text">
              Fecha de nacimiento
              <input
                type="date"
                value={form.birth_date}
                onChange={(event) => setForm((current) => ({ ...current, birth_date: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-mf-text">
              Posición
              <select
                value={form.position}
                onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))}
                className={inputClass}
              >
                <option value="">Selecciona…</option>
                {TUTOR_POSITION_OPTIONS.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
                {form.position &&
                !(TUTOR_POSITION_OPTIONS as readonly string[]).includes(form.position) ? (
                  <option value={form.position}>{form.position}</option>
                ) : null}
              </select>
            </label>
            <label className="block text-sm font-medium text-mf-text">
              Club o academia
              <input
                value={form.club}
                onChange={(event) => setForm((current) => ({ ...current, club: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-mf-text">
              Escuela
              <input
                value={form.school}
                onChange={(event) => setForm((current) => ({ ...current, school: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-mf-text">
              Ciudad
              <select
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                className={inputClass}
              >
                <option value="">Selecciona…</option>
                {TUTOR_CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                {form.city && !(TUTOR_CITY_OPTIONS as readonly string[]).includes(form.city) ? (
                  <option value={form.city}>{form.city}</option>
                ) : null}
              </select>
            </label>
            <label className="block text-sm font-medium text-mf-text">
              Estatura (cm)
              <input
                inputMode="numeric"
                value={form.height_cm}
                onChange={(event) => setForm((current) => ({ ...current, height_cm: event.target.value }))}
                className={inputClass}
              />
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
                <option value="">Opcional</option>
                <option value="right">Diestro</option>
                <option value="left">Zurdo</option>
                <option value="both">Ambidiestro</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-mf-text sm:col-span-2">
              Presentación
              <textarea
                value={form.bio}
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                className={`${inputClass} min-h-24`}
                placeholder="Quién es, cómo juega, trayectoria breve…"
              />
            </label>
            <label className="block text-sm font-medium text-mf-text sm:col-span-2">
              Objetivo
              <textarea
                value={form.goals}
                onChange={(event) => setForm((current) => ({ ...current, goals: event.target.value }))}
                className={`${inputClass} min-h-20`}
                placeholder="Universidad, visoría, club, siguiente paso…"
              />
            </label>
          </div>
          {error ? (
            <p className="rounded-lg bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">{error}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className="mf-btn-gph">
              {busy ? "Guardando…" : editing ? "Guardar cambios" : "Crear ficha"}
            </button>
            {editing ? (
              <button
                type="button"
                className="mf-btn-gph-ghost"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {child && !editing ? (
        <div ref={childPanelRef} className="grid scroll-mt-24 gap-4">
          <section className="rounded-xl border border-mf-gph/30 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                  Ficha presentable
                </p>
                <h2 className="mt-2 text-xl font-semibold text-mf-gph-ink">{child.player_name}</h2>
                <p className="mt-1 text-sm text-mf-text-secondary">
                  {[child.profile.position, child.profile.club, child.profile.city]
                    .filter(Boolean)
                    .join(" · ") || "Completa el perfil para presentarlo mejor."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="mf-btn-gph-ghost" onClick={() => setEditing(true)}>
                  Editar datos
                </button>
                {shareHref ? (
                  <>
                    <Link href={shareHref} target="_blank" className="mf-btn-gph-ghost">
                      Ver ficha
                    </Link>
                    <button type="button" className="mf-btn-gph" onClick={() => void copyShare()}>
                      {copied ? "Link copiado" : "Copiar link"}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
            {child.profile.bio ? (
              <p className="mt-4 text-sm leading-7 text-mf-text-secondary">{child.profile.bio}</p>
            ) : null}
          </section>

          <section className="rounded-xl border border-mf-border bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Material del tutor
            </p>
            <p className="mt-2 text-sm text-mf-text-secondary">
              Fotos, videos e historia. Esto alimenta la ficha que compartes.
            </p>
            {child.active ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <label className="mf-btn-gph cursor-pointer">
                    Subir foto
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => void onFile("photo", event.target.files?.[0])}
                    />
                  </label>
                  <label className="mf-btn-gph-ghost cursor-pointer">
                    Subir video
                    <input
                      type="file"
                      accept="video/*"
                      className="sr-only"
                      onChange={(event) => void onFile("video", event.target.files?.[0])}
                    />
                  </label>
                </div>
                <form onSubmit={(event) => void saveStory(event)} className="space-y-3">
                  <input
                    value={storyTitle}
                    onChange={(event) => setStoryTitle(event.target.value)}
                    placeholder="Título de la nota"
                    className={inputClass}
                  />
                  <textarea
                    required
                    value={storyBody}
                    onChange={(event) => setStoryBody(event.target.value)}
                    placeholder="Historia, gol, partido, cómo viene jugando…"
                    className={`${inputClass} min-h-28`}
                  />
                  <button type="submit" disabled={busy} className="mf-btn-gph">
                    Guardar historia
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/fut/pagar?sku=membership" className="mf-btn-gph mt-4">
                Renovar año
              </Link>
            )}
            <ul className="mt-6 space-y-4">
              {child.materials.length === 0 ? (
                <li className="text-sm text-mf-text-muted">Aún no hay material.</li>
              ) : (
                child.materials.map((item) => (
                  <li key={item.id} className="rounded-lg bg-mf-canvas px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-gph">
                      {item.kind === "story" ? "Historia" : item.kind === "photo" ? "Foto" : "Video"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-mf-gph-ink">{item.title}</p>
                    {item.body ? (
                      <p className="mt-1 text-sm leading-6 text-mf-text-secondary">{item.body}</p>
                    ) : null}
                    {item.kind === "photo" && item.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt="" className="mt-3 max-h-80 rounded-lg" />
                    ) : null}
                    {item.kind === "video" && item.url ? (
                      <video
                        src={item.url}
                        controls
                        playsInline
                        className="mt-3 max-h-80 w-full rounded-lg bg-black"
                      />
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-mf-border bg-mf-canvas p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-brand">
              MiFicha · torneo
            </p>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              Partidos y stats oficiales llegarán aquí cuando la ficha del torneo esté
              abierta. Mientras tanto, esta ficha del tutor ya sirve para presentar.
            </p>
          </section>

          <section className="rounded-xl border border-mf-border bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              GPH
            </p>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              El diagnóstico lo escribe el evaluador. Si quieres una sesión,{" "}
              <Link href="/fut/evaluaciones" className="font-semibold text-mf-gph hover:underline">
                agenda por WhatsApp
              </Link>
              .
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
