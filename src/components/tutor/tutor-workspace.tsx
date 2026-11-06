"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { signIn, signUp } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { TutorMaterialKind } from "@/lib/tutor-family";

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
  active: boolean;
  materials: MaterialItem[];
}

const inputClass =
  "mf-input mt-1 focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]";

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
  };
  if (!response.ok) throw new Error(payload.error || "No se pudo completar.");
  return payload;
}

export function TutorWorkspace() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [children, setChildren] = useState<TutorChildCard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (whatsapp: string) => {
    const query = whatsapp ? `?phone=${encodeURIComponent(whatsapp)}` : "";
    const payload = await authed(`/fut/api/tutor/home${query}`);
    const rows = payload.children ?? [];
    setChildren(rows);
    setSelectedId((current) => current ?? rows[0]?.id ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const current = data.session?.user.email ?? null;
      setSessionEmail(current);
      setLoading(false);
      if (current) {
        void load("").catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "No se cargó la ficha.");
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const child = children.find((item) => item.id === selectedId) ?? null;

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
      setSessionEmail(email.trim().toLowerCase());
      await load(phone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo entrar.");
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

  if (loading) {
    return <p className="text-sm text-mf-text-muted">Cargando…</p>;
  }

  if (!sessionEmail) {
    return (
      <form onSubmit={(event) => void onAuth(event)} className="mx-auto max-w-md space-y-4">
        <div className="flex gap-2 text-sm font-semibold">
          <button type="button" className={mode === "login" ? "text-mf-gph" : "text-mf-text-muted"} onClick={() => setMode("login")}>
            Entrar
          </button>
          <button type="button" className={mode === "signup" ? "text-mf-gph" : "text-mf-text-muted"} onClick={() => setMode("signup")}>
            Crear cuenta
          </button>
        </div>
        {mode === "signup" ? (
          <label className="block text-sm font-medium text-mf-text">
            Tu nombre
            <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className={inputClass} />
          </label>
        ) : null}
        <label className="block text-sm font-medium text-mf-text">
          Correo con el que pagaste
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-mf-text">
          WhatsApp del pago
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} placeholder="10 dígitos" />
        </label>
        <label className="block text-sm font-medium text-mf-text">
          Contraseña
          <input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
        </label>
        {error ? <p className="text-sm text-mf-danger">{error}</p> : null}
        <button type="submit" disabled={busy} className="mf-btn-gph w-full justify-center">
          {busy ? "Entrando…" : mode === "login" ? "Entrar" : "Crear cuenta de tutor"}
        </button>
        <p className="text-xs leading-6 text-mf-text-muted">
          Ligamos la cuenta al correo o al WhatsApp del pago de $1,200 o de la evaluación de $2,900.
        </p>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">Tutor</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-mf-gph-ink">Tus jugadores</h1>
          <p className="mt-1 text-sm text-mf-text-secondary">{sessionEmail}</p>
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void load(phone).catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "No se vinculó el WhatsApp.");
              });
            }}
          >
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="WhatsApp del pago"
              className="mf-input w-48"
            />
            <button type="submit" className="mf-btn-gph-ghost">
              Vincular
            </button>
          </form>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-mf-text-muted hover:text-mf-text"
          onClick={() => void supabase.auth.signOut().then(() => setSessionEmail(null))}
        >
          Salir
        </button>
      </div>

      {error ? <p className="text-sm text-mf-danger">{error}</p> : null}

      {children.length === 0 ? (
        <div className="rounded-xl border border-mf-border bg-white px-5 py-6">
          <p className="text-sm leading-7 text-mf-text-secondary">
            No hay un pago vigente con este correo o WhatsApp. La membresía de $1,200 o la
            evaluación de $2,900 abre el año para subir material.
          </p>
          <Link href="/fut/pagar?sku=membership" className="mf-btn-gph mt-4">
            Pagar membresía
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {children.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={
                item.id === child?.id
                  ? "rounded-full bg-mf-gph px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full border border-mf-border bg-white px-4 py-2 text-sm font-semibold text-mf-gph-ink"
              }
            >
              {item.player_name}
            </button>
          ))}
        </div>
      )}

      {child ? (
        <div className="grid gap-4">
          <section className="rounded-xl border border-mf-gph/30 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Material del tutor
            </p>
            <p className="mt-2 text-sm text-mf-text-secondary">
              Videos, fotos e historia que subes tú.{" "}
              {child.active
                ? `Membresía vigente hasta ${child.membership_until}.`
                : "La membresía no está vigente."}
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
              {child.materials.map((item) => (
                <li key={item.id} className="rounded-lg bg-mf-canvas px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-gph">
                    {item.kind === "story" ? "Historia" : item.kind === "photo" ? "Foto" : "Video"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-mf-gph-ink">{item.title}</p>
                  {item.body ? <p className="mt-1 text-sm leading-6 text-mf-text-secondary">{item.body}</p> : null}
                  {item.kind === "photo" && item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" className="mt-3 max-h-80 rounded-lg" />
                  ) : null}
                  {item.kind === "video" && item.url ? (
                    <video src={item.url} controls playsInline className="mt-3 max-h-80 w-full rounded-lg bg-black" />
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-mf-border bg-mf-canvas p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-brand">
              MiFicha
            </p>
            <h2 className="mt-2 text-lg font-semibold text-mf-text">{child.player_name}</h2>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              Identidad, partidos y stats los arma la plataforma. Esta sección es de solo
              lectura. Cuando el jugador esté en un torneo, el historial aparece aquí.
            </p>
          </section>

          <section className="rounded-xl border border-mf-border bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              GPH
            </p>
            <h2 className="mt-2 text-lg font-semibold text-mf-gph-ink">Diagnóstico</h2>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              Lo escribe el evaluador de GPH. Tú lo consultas. No se edita desde la cuenta
              del tutor. Si aún no hay sesión, esta sección queda vacía.
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
