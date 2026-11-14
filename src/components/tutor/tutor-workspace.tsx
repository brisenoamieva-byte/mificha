"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { TutorBuilderPanel } from "@/components/tutor/tutor-builder-panel";
import { signIn, signUp, updatePassword } from "@/lib/auth";
import { LEGAL_ROUTES, TERMS_ACCEPTANCE_LABEL } from "@/lib/legal";
import { supabase } from "@/lib/supabase";
import { guardianWorkspaceCopy } from "@/lib/guardian-workspace-copy";
import {
  TUTOR_CITY_OPTIONS,
  TUTOR_PILOT_FREE,
  TUTOR_PILOT_LABEL,
  tutorSharePath,
  type GuardianKind,
  type TutorMaterialKind,
  type TutorSeasonInput,
  type TutorSeasonStat,
} from "@/lib/tutor-family";
import type { TutorLinkedPerformance } from "@/lib/tutor-linked-performance";

const PHONE_STORAGE_KEY = "mificha.tutor.phone";

interface TutorWorkspaceProps {
  workspace?: GuardianKind;
}

interface MaterialItem {
  id: string;
  kind: TutorMaterialKind;
  title: string;
  body: string | null;
  url: string | null;
  created_at: string;
  is_cover?: boolean;
  is_featured?: boolean;
}

interface TutorChildCard {
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
  explore_opt_in?: boolean;
  explore_opt_in_at?: string | null;
  profile: {
    birth_date: string | null;
    position: string | null;
    club: string | null;
    school: string | null;
    city: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    nationality: string | null;
    dominant_foot: "left" | "right" | "both" | null;
    bio: string | null;
    goals: string | null;
    youtube_url: string | null;
    transfermarkt_url: string | null;
    role_title: string | null;
    tagline: string | null;
    contact_email: string | null;
    instagram: string | null;
    highlight_chips: string[];
    achievements: Array<{ title: string; detail: string }>;
    callups: Array<{ level: string; detail: string }>;
  };
  materials: MaterialItem[];
}

interface LinkSuggestion {
  player_id: string;
  academy_id: string;
  academy_name: string;
  player_name: string;
  slug: string;
  reason: string;
  match?: "code" | "birth" | "contact";
}

const inputClass =
  "mf-input mt-1 focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]";

const emptyForm = {
  player_name: "",
  public_code: "",
  birth_date: "",
  position: "",
  club: "",
  school: "",
  city: "",
  height_cm: "",
  weight_kg: "",
  nationality: "",
  dominant_foot: "" as "" | "left" | "right" | "both",
  bio: "",
  goals: "",
  youtube_url: "",
  transfermarkt_url: "",
  role_title: "",
  tagline: "",
  contact_email: "",
  instagram: "",
  highlight_chips_text: "",
  achievements_text: "",
  callups_text: "",
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
    suggestions?: LinkSuggestion[];
  };
  if (!response.ok) throw new Error(payload.error || "No se pudo completar.");
  return payload;
}

export function TutorWorkspace({ workspace = "tutor" }: TutorWorkspaceProps) {
  const copy = guardianWorkspaceCopy();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
  const [form, setForm] = useState(emptyForm);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [linkSuggestions, setLinkSuggestions] = useState<LinkSuggestion[]>([]);
  const [linkBusy, setLinkBusy] = useState(false);
  const [onboardNotice, setOnboardNotice] = useState<string | null>(null);
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState<string | null>(
    null,
  );
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const childPanelRef = useRef<HTMLDivElement | null>(null);
  const createFichaRef = useRef<HTMLFormElement | null>(null);

  const load = useCallback(async (whatsapp: string, preferId?: string | null) => {
    const params = new URLSearchParams({ kind: "all" });
    if (whatsapp) params.set("phone", whatsapp);
    const payload = await authed(`/fut/api/tutor/home?${params.toString()}`);
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
    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        const current = data.session?.user.email ?? null;
        setSessionEmail(current);
        if (!current) return;
        const savedPhone =
          typeof window !== "undefined"
            ? window.localStorage.getItem(PHONE_STORAGE_KEY) ?? ""
            : "";
        const rows = await load(savedPhone || phone);
        if (cancelled) return;
        if (rows.length === 0) {
          setOnboardNotice(copy.onboardEmpty);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "No se cargó la ficha.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Solo al montar: no re-correr al hidratar el teléfono (eso reabre el estado vacío).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot único
  }, [load, copy.onboardEmpty]);

  useEffect(() => {
    if (loading || !sessionEmail || children.length > 0 || !onboardNotice) return;
    const timer = window.setTimeout(() => {
      createFichaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [loading, sessionEmail, children.length, onboardNotice]);

  const child = children.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (!child) return;
    setForm({
      player_name: child.player_name,
      public_code: "",
      birth_date: child.profile.birth_date ?? "",
      position: child.profile.position ?? "",
      club: child.profile.club ?? "",
      school: child.profile.school ?? "",
      city: child.profile.city ?? "",
      height_cm: child.profile.height_cm != null ? String(child.profile.height_cm) : "",
      weight_kg: child.profile.weight_kg != null ? String(child.profile.weight_kg) : "",
      nationality: child.profile.nationality ?? "",
      dominant_foot: child.profile.dominant_foot ?? "",
      bio: child.profile.bio ?? "",
      goals: child.profile.goals ?? "",
      youtube_url: child.profile.youtube_url ?? "",
      transfermarkt_url: child.profile.transfermarkt_url ?? "",
      role_title: child.profile.role_title ?? "",
      tagline: child.profile.tagline ?? "",
      contact_email: child.profile.contact_email ?? "",
      instagram: child.profile.instagram ?? "",
      highlight_chips_text: (child.profile.highlight_chips ?? []).join("\n"),
      achievements_text: (child.profile.achievements ?? [])
        .map((row) =>
          row.detail ? `${row.title} | ${row.detail}` : row.title,
        )
        .join("\n"),
      callups_text: (child.profile.callups ?? [])
        .map((row) =>
          row.detail ? `${row.level} | ${row.detail}` : row.level,
        )
        .join("\n"),
    });
  }, [child]);

  useEffect(() => {
    if (!child || child.linked_player_id) {
      setLinkSuggestions([]);
      return;
    }
    let cancelled = false;
    void authed(`/fut/api/tutor/links?child_id=${encodeURIComponent(child.id)}`)
      .then((payload) => {
        if (cancelled) return;
        setLinkSuggestions((payload.suggestions as LinkSuggestion[]) ?? []);
      })
      .catch(() => {
        if (!cancelled) setLinkSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [child]);

  async function linkPlayer(playerId: string) {
    if (!child) return;
    setLinkBusy(true);
    setError(null);
    try {
      await authed("/fut/api/tutor/links", {
        method: "POST",
        body: JSON.stringify({
          child_id: child.id,
          player_id: playerId,
          confirm: true,
        }),
      });
      await load(phone, child.id);
      setNotice("Jugador ligado con su academia. Es la misma persona en ambos lados.");
      setLinkSuggestions([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo ligar.");
    } finally {
      setLinkBusy(false);
    }
  }

  async function unlinkPlayer() {
    if (!child) return;
    setLinkBusy(true);
    setError(null);
    try {
      await authed("/fut/api/tutor/links", {
        method: "POST",
        body: JSON.stringify({ action: "unlink", child_id: child.id }),
      });
      await load(phone, child.id);
      setNotice("Se quitó el vínculo con la academia.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo desligar.");
    } finally {
      setLinkBusy(false);
    }
  }

  function scrollToCreateFicha() {
    window.setTimeout(() => {
      createFichaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  async function enterWorkspace(opts?: { welcome?: boolean }) {
    const normalizedEmail = email.trim().toLowerCase();
    if (phone) {
      try {
        window.localStorage.setItem(PHONE_STORAGE_KEY, phone);
      } catch {
        /* ignore */
      }
    }
    setPendingConfirmEmail(null);
    setLoading(true);
    try {
      const rows = await load(phone);
      setSessionEmail(normalizedEmail);
      if (opts?.welcome || rows.length === 0) {
        setOnboardNotice(
          rows.length === 0 ? copy.onboardEmpty : copy.onboardWelcome,
        );
        if (rows.length === 0) scrollToCreateFicha();
      }
    } finally {
      setLoading(false);
    }
  }

  function authErrorMessage(err: unknown) {
    if (!(err instanceof Error)) return "No se pudo entrar.";
    if (err.message.includes("Invalid login credentials")) {
      return "Correo o contraseña incorrectos.";
    }
    if (err.message.includes("Email not confirmed")) {
      return "Confirma tu correo con el link que te enviamos y vuelve a entrar.";
    }
    if (err.message.includes("User already registered")) {
      return "Este correo ya tiene cuenta. Entra con tu contraseña o recupérala.";
    }
    if (err.message.includes("Password should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    if (
      err.message.includes("rate limit") ||
      err.message.includes("over_email_send_rate_limit")
    ) {
      return "Demasiados intentos de correo. Espera unos minutos e inténtalo de nuevo.";
    }
    return err.message;
  }

  async function onAuth(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setOnboardNotice(null);
    setPendingConfirmEmail(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      if (!acceptedTerms) {
        setError("Debes aceptar los Términos y el Aviso de Privacidad.");
        return;
      }
      if (password !== passwordConfirm) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const created = await signUp(
          normalizedEmail,
          password,
          "academy_admin",
          fullName,
          { emailRedirectTo: `${window.location.origin}${copy.path}` },
        );
        if (!created.session) {
          // Algunos proyectos piden confirmar correo: intentamos entrar igual;
          // si falla, guiamos al login sin dejar al tutor “colgado”.
          try {
            await signIn(normalizedEmail, password);
            await enterWorkspace({ welcome: true });
            return;
          } catch {
            setPendingConfirmEmail(normalizedEmail);
            setMode("login");
            setPassword("");
            setPasswordConfirm("");
            return;
          }
        }
        await enterWorkspace({ welcome: true });
        return;
      }

      await signIn(normalizedEmail, password);
      await enterWorkspace({ welcome: true });
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onChangePassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (newPassword.length < 6) {
      setError("La contraseña nueva debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setPasswordBusy(true);
    try {
      await updatePassword(newPassword);
      setNewPassword("");
      setNewPasswordConfirm("");
      setShowPasswordPanel(false);
      setNotice("Contraseña actualizada.");
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setPasswordBusy(false);
    }
  }

  async function saveChild(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const updating = Boolean(child);
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
          child_id: child?.id,
          guardian_kind: workspace,
          player_name: form.player_name,
          public_code: child ? undefined : form.public_code || undefined,
          guardian_phone: phone || undefined,
          birth_date: form.birth_date || null,
          position: form.position || null,
          club: form.club || null,
          school: form.school || null,
          city: form.city || null,
          height_cm: form.height_cm ? Number(form.height_cm) : null,
          weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
          nationality: form.nationality || null,
          dominant_foot: form.dominant_foot || null,
          bio: form.bio || null,
          goals: form.goals || null,
          youtube_url: form.youtube_url || null,
          transfermarkt_url: form.transfermarkt_url || null,
          role_title: form.role_title || null,
          tagline: form.tagline || null,
          contact_email: form.contact_email || null,
          instagram: form.instagram || null,
          highlight_chips_text: form.highlight_chips_text || null,
          achievements_text: form.achievements_text || null,
          callups_text: form.callups_text || null,
        }),
      });
      const createdId = payload.child?.id ?? null;
      await load(phone, createdId);
      if (createdId) setSelectedId(createdId);
      setOnboardNotice(null);
      setNotice(
        updating
          ? "Ficha actualizada. La vista previa ya refleja los cambios."
          : form.public_code.trim()
            ? "Ficha creada con tu código MF. Si hay plantel con el mismo código, confirma el vínculo en Academia."
            : "Ficha creada. Completa foto, historia y datos en el constructor.",
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

  async function toggleExploreOptIn(enabled: boolean) {
    if (!child) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await authed("/fut/api/tutor/children", {
        method: "POST",
        body: JSON.stringify({
          action: "explore_opt_in",
          child_id: child.id,
          explore_opt_in: enabled,
          consent_ack: enabled,
        }),
      });
      await load(phone);
      setNotice(
        enabled
          ? "Consentimiento firmado: la ficha puede aparecer en Explorar."
          : "Consentimiento retirado: ya no aparece en Explorar. El link directo sigue activo.",
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el consentimiento.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function signLinkedAcademyConsent() {
    if (!child) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await authed("/fut/api/tutor/children", {
        method: "POST",
        body: JSON.stringify({
          action: "linked_academy_consent",
          child_id: child.id,
          consent_ack: true,
        }),
      });
      await load(phone);
      setNotice(
        "Listo: aprobaste la ficha de academia y el consentimiento para Explorar.",
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo aprobar la ficha de academia.",
      );
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

  async function manageMaterial(
    action: "delete" | "set_cover" | "set_featured",
    materialId: string,
  ) {
    if (!child) return;
    if (action === "delete") {
      const ok = window.confirm("¿Eliminar este material de la ficha?");
      if (!ok) return;
    }
    setBusy(true);
    setError(null);
    try {
      await authed("/fut/api/tutor/materials", {
        method: "POST",
        body: JSON.stringify({
          action,
          child_id: child.id,
          material_id: materialId,
        }),
      });
      await load(phone);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el material.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveSeason(input: TutorSeasonInput, seasonId?: string | null) {
    if (!child) return;
    setBusy(true);
    setError(null);
    try {
      await authed("/fut/api/tutor/seasons", {
        method: "POST",
        body: JSON.stringify({
          action: "save",
          child_id: child.id,
          season_id: seasonId ?? undefined,
          ...input,
        }),
      });
      await load(phone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se guardó el torneo.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSeason(seasonId: string) {
    if (!child) return;
    const ok = window.confirm("¿Eliminar este torneo de la ficha?");
    if (!ok) return;
    const childId = child.id;
    setBusy(true);
    setError(null);
    setChildren((prev) =>
      prev.map((row) =>
        row.id !== childId
          ? row
          : {
              ...row,
              seasons: (row.seasons ?? []).filter((season) => season.id !== seasonId),
            },
      ),
    );
    try {
      await authed("/fut/api/tutor/seasons", {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          child_id: childId,
          season_id: seasonId,
        }),
      });
      await load(phone, childId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se eliminó el torneo.");
      await load(phone, childId);
    } finally {
      setBusy(false);
    }
  }

  async function copyShare() {
    if (!child?.share_token && !child?.public_code) return;
    const access = child.public_code || child.share_token;
    const url = `${window.location.origin}${tutorSharePath(access)}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function copyPublicCode() {
    if (!child?.public_code) return;
    await navigator.clipboard.writeText(child.public_code);
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
            {TUTOR_PILOT_FREE ? "Piloto · cuenta persona" : copy.eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink">
            {copy.authTitle}
          </h2>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            {copy.authDetail}{" "}
            {TUTOR_PILOT_FREE ? TUTOR_PILOT_LABEL : "Incluido con la membresía anual."}
          </p>
        </div>

        {pendingConfirmEmail ? (
          <div className="space-y-3 rounded-xl border border-mf-gph/30 bg-mf-gph-soft p-5">
            <p className="text-sm font-semibold text-mf-gph-ink">Cuenta creada</p>
            <p className="text-sm leading-6 text-mf-text-secondary">
              Si tu proyecto pide confirmación, revisa el correo de{" "}
              <span className="font-medium text-mf-gph-ink">{pendingConfirmEmail}</span>{" "}
              (bandeja y spam). Después entra aquí para crear la ficha.
            </p>
            <button
              type="button"
              className="mf-btn-gph w-full justify-center"
              onClick={() => {
                setMode("login");
                setEmail(pendingConfirmEmail);
                setPendingConfirmEmail(null);
              }}
            >
              Continuar a entrar
            </button>
            <p className="text-center text-xs text-mf-text-muted">
              ¿No llegó el correo?{" "}
              <Link
                href={`/fut/recuperar?next=${encodeURIComponent(copy.path)}`}
                className="font-semibold text-mf-gph hover:underline"
              >
                Recuperar acceso
              </Link>
            </p>
          </div>
        ) : null}

        <form onSubmit={(event) => void onAuth(event)} className="space-y-4 rounded-xl border border-mf-border bg-white p-5">
          <div className="flex gap-2 text-sm font-semibold">
            <button
              type="button"
              className={mode === "login" ? "text-mf-gph" : "text-mf-text-muted"}
              onClick={() => setMode("login")}
            >
              Entrar
            </button>
            <button
              type="button"
              className={mode === "signup" ? "text-mf-gph" : "text-mf-text-muted"}
              onClick={() => {
                setMode("signup");
                setPendingConfirmEmail(null);
              }}
            >
              Crear cuenta
            </button>
          </div>
          {mode === "login" ? (
            <p className="text-sm leading-6 text-mf-text-secondary">
              Si ya tienes cuenta, solo correo y contraseña. En el celular la sesión es de
              este navegador (no se comparte con la computadora).
            </p>
          ) : null}
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
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </label>
          {mode === "signup" ? (
            <label className="block text-sm font-medium text-mf-text">
              WhatsApp
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
                placeholder="10 dígitos"
                inputMode="tel"
                autoComplete="tel"
              />
            </label>
          ) : null}
          <label className="block text-sm font-medium text-mf-text">
            Contraseña
            <input
              required
              type="password"
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
          </label>
          {mode === "signup" ? (
            <label className="block text-sm font-medium text-mf-text">
              Confirmar contraseña
              <input
                required
                type="password"
                minLength={6}
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                className={inputClass}
                placeholder="Repite la contraseña"
              />
            </label>
          ) : (
            <p className="-mt-1 text-right text-sm">
              <Link
                href={`/fut/recuperar?next=${encodeURIComponent(copy.path)}`}
                className="font-semibold text-mf-gph hover:underline"
              >
                Olvidé mi contraseña
              </Link>
            </p>
          )}
          {mode === "signup" ? (
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                required
                className="mt-1 h-4 w-4 rounded border-mf-border text-mf-gph"
              />
              <span className="text-sm leading-6 text-mf-text-secondary">
                {TERMS_ACCEPTANCE_LABEL}{" "}
                <Link
                  href={LEGAL_ROUTES.terms}
                  className="font-semibold text-mf-gph hover:underline"
                >
                  Términos
                </Link>{" "}
                ·{" "}
                <Link
                  href={LEGAL_ROUTES.privacy}
                  className="font-semibold text-mf-gph hover:underline"
                >
                  Privacidad
                </Link>
              </span>
            </label>
          ) : null}
          {error ? <p className="text-sm text-mf-danger">{error}</p> : null}
          <button type="submit" disabled={busy} className="mf-btn-gph w-full justify-center">
            {busy
              ? mode === "login"
                ? "Entrando…"
                : "Creando cuenta…"
              : mode === "login"
                ? "Entrar y continuar"
                : "Crear cuenta y continuar"}
          </button>
          <p className="text-center text-xs leading-5 text-mf-text-muted">
            {copy.afterAuthHint.replace(
              "{action}",
              mode === "login" ? "entrar" : "registrarte",
            )}
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-mf-text-secondary">{sessionEmail}</p>
          {TUTOR_PILOT_FREE ? (
            <p className="mt-0.5 text-xs text-mf-text-muted">{TUTOR_PILOT_LABEL}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-mf-text-muted hover:text-mf-text"
            onClick={() => {
              setShowPasswordPanel((open) => !open);
              setError(null);
            }}
          >
            Cambiar contraseña
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-mf-text-muted hover:text-mf-text"
            onClick={() =>
              void supabase.auth.signOut().then(() => {
                setSessionEmail(null);
                setShowPasswordPanel(false);
                setNewPassword("");
                setNewPasswordConfirm("");
              })
            }
          >
            Salir
          </button>
        </div>
      </div>

      {showPasswordPanel ? (
        <form
          onSubmit={(event) => void onChangePassword(event)}
          className="mx-auto max-w-md space-y-3 rounded-xl border border-mf-border bg-white p-4 sm:p-5"
        >
          <p className="text-sm font-semibold text-mf-gph-ink">Nueva contraseña</p>
          <label className="block text-sm font-medium text-mf-text">
            Contraseña
            <input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Confirmar
            <input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={newPasswordConfirm}
              onChange={(event) => setNewPasswordConfirm(event.target.value)}
              className={inputClass}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={passwordBusy}
              className="mf-btn-gph justify-center"
            >
              {passwordBusy ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-mf-text-muted hover:text-mf-text"
              onClick={() => {
                setShowPasswordPanel(false);
                setNewPassword("");
                setNewPasswordConfirm("");
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-mf-danger-soft px-4 py-3 text-sm text-mf-danger">{error}</p>
      ) : null}
      {onboardNotice ? (
        <div className="rounded-xl border border-mf-gph/25 bg-mf-gph-soft px-4 py-4 sm:px-5">
          <p className="text-sm font-semibold text-mf-gph-ink">{onboardNotice}</p>
          {children.length === 0 ? (
            <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
              Paso 1 de 2: pon el nombre del jugador y pulsa{" "}
              <strong>Crear ficha y continuar</strong>.
            </p>
          ) : null}
        </div>
      ) : null}
      {notice ? (
        <p className="rounded-lg bg-mf-gph-soft px-4 py-3 text-sm font-medium text-mf-gph-ink">
          {notice}
        </p>
      ) : null}

      {children.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            {copy.rosterLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {children.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setNotice(null);
                  setOnboardNotice(null);
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
                setForm(emptyForm);
                setNotice(null);
                setOnboardNotice(copy.addAnotherNotice);
                setError(null);
                scrollToCreateFicha();
              }}
              className="rounded-full border border-dashed border-mf-gph/40 px-4 py-2 text-sm font-semibold text-mf-gph"
            >
              {copy.addAnother}
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-mf-border bg-white px-4 py-3 text-sm text-mf-text-secondary">
          {copy.emptyRoster}
        </p>
      )}

      {!child || children.length === 0 ? (
        <form
          id="crear-ficha"
          ref={createFichaRef}
          onSubmit={(event) => void saveChild(event)}
          className="mx-auto max-w-lg scroll-mt-24 space-y-4 rounded-2xl border border-mf-border bg-white p-5 sm:p-6"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              {copy.createEyebrow}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-mf-gph-ink">{copy.createTitle}</h2>
            <p className="mt-1 text-sm text-mf-text-secondary">{copy.createDetail}</p>
          </div>
          <label className="block text-sm font-medium text-mf-text">
            Nombre completo
            <input
              required
              value={form.player_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, player_name: event.target.value }))
              }
              className={inputClass}
              placeholder="Ej. Diego Briseño"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-mf-text">
              Fecha de nacimiento
              <input
                type="date"
                value={form.birth_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, birth_date: event.target.value }))
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
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium text-mf-text">
            Código MF- de academia (opcional)
            <input
              value={form.public_code}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  public_code: event.target.value.toUpperCase(),
                }))
              }
              className={`${inputClass} font-mono uppercase`}
              placeholder="MF-A3K9"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="mt-1 block text-xs font-normal text-mf-text-muted">
              Si la academia ya te dio un código, pégalo aquí para usar el mismo y no
              duplicar fichas. El vínculo con plantel se confirma después.
            </span>
          </label>
          {error ? (
            <p className="rounded-lg bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">{error}</p>
          ) : null}
          <button type="submit" disabled={busy} className="mf-btn-gph w-full justify-center">
            {busy ? "Creando…" : "Crear ficha y continuar"}
          </button>
        </form>
      ) : null}

      {child ? (
        <div ref={childPanelRef} className="scroll-mt-24">
          <TutorBuilderPanel
            workspace={workspace}
            child={child}
            form={form}
            setForm={setForm}
            busy={busy}
            linkBusy={linkBusy}
            copied={copied}
            linkSuggestions={linkSuggestions}
            storyTitle={storyTitle}
            storyBody={storyBody}
            setStoryTitle={setStoryTitle}
            setStoryBody={setStoryBody}
            onSaveProfile={(event) => void saveChild(event)}
            onSaveStory={(event) => void saveStory(event)}
            onFile={(kind, file) => void onFile(kind, file)}
            onDeleteMaterial={(id) => void manageMaterial("delete", id)}
            onSetCover={(id) => void manageMaterial("set_cover", id)}
            onSetFeaturedVideo={(id) => void manageMaterial("set_featured", id)}
            onSaveSeason={(input, seasonId) => void saveSeason(input, seasonId)}
            onDeleteSeason={(id) => void deleteSeason(id)}
            onCopyShare={() => void copyShare()}
            onCopyPublicCode={() => void copyPublicCode()}
            onToggleExploreOptIn={(enabled) => void toggleExploreOptIn(enabled)}
            onSignLinkedAcademyConsent={() => void signLinkedAcademyConsent()}
            onLinkPlayer={(playerId) => void linkPlayer(playerId)}
            onUnlinkPlayer={() => void unlinkPlayer()}
          />
        </div>
      ) : null}
    </div>
  );
}
