"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

export function GphPartnerPanel() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("Gustavo Reyes");
  const [academyName, setAcademyName] = useState("Academia GPH");
  const [city, setCity] = useState("Querétaro");
  const [busy, setBusy] = useState(false);
  const [actionLink, setActionLink] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setActionLink(null);
    setSummary(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada.");
      const response = await fetch("/fut/api/interno/gph-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          academy_name: academyName,
          city,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        email?: string;
        academy?: { name: string; slug: string };
        action_link?: string | null;
        login_url?: string;
      };
      if (!response.ok) throw new Error(payload.error || "No se pudo crear.");
      setActionLink(payload.action_link ?? null);
      setSummary(
        `${payload.academy?.name ?? academyName} · ${payload.email}. Academia sin cobro. Evaluador GPH de todos los diagnósticos.`,
      );
      toast.success("Acceso de Gustavo listo. Copia el link y envíaselo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el acceso.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!actionLink) return;
    await navigator.clipboard.writeText(actionLink);
    toast.success("Link copiado. Mándaselo a Gustavo por WhatsApp.");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mf-gph">
          Socio GPH
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-mf-text">Gustavo Reyes</h1>
        <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
          Crea su academia (plantel propio, sin cobro) y le da administración de
          todos los diagnósticos GPH en la plataforma.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-mf-border bg-white p-5">
        <label className="block text-sm font-medium">
          Correo de Gustavo
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mf-input mt-1"
            placeholder="gustavo@…"
          />
        </label>
        <label className="block text-sm font-medium">
          Nombre
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mf-input mt-1"
          />
        </label>
        <label className="block text-sm font-medium">
          Nombre de su academia
          <input
            value={academyName}
            onChange={(event) => setAcademyName(event.target.value)}
            className="mf-input mt-1"
          />
        </label>
        <label className="block text-sm font-medium">
          Ciudad
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mf-input mt-1"
          />
        </label>
        <button
          type="button"
          disabled={busy || !email.trim()}
          onClick={() => void submit()}
          className="mf-btn-gph w-full justify-center disabled:opacity-50"
        >
          {busy ? "Creando acceso…" : "Crear academia + acceso GPH"}
        </button>
      </div>

      {summary ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
          <p className="font-semibold">Listo</p>
          <p className="mt-1">{summary}</p>
          {actionLink ? (
            <button
              type="button"
              onClick={() => void copyLink()}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-mf-gph hover:underline"
            >
              <Copy className="h-4 w-4" />
              Copiar link para que Gustavo elija contraseña
            </button>
          ) : (
            <p className="mt-2">
              Ya puede entrar en /fut/login con ese correo. Si no recuerda la
              contraseña, usa «olvidé mi contraseña».
            </p>
          )}
        </div>
      ) : null}

      <p className="text-xs text-mf-text-muted">
        Antes, en Supabase SQL Editor: <code>supabase/gph-evaluators.sql</code>
      </p>
    </div>
  );
}
