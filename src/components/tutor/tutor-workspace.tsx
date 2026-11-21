"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { TutorActivityInbox } from "@/components/tutor/tutor-activity-inbox";
import { TutorAgreementsInbox } from "@/components/tutor/tutor-agreements-inbox";
import { TutorBuilderPanel } from "@/components/tutor/tutor-builder-panel";
import { TutorLinkRequestsInbox } from "@/components/tutor/tutor-link-requests-inbox";
import { updatePassword } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { guardianWorkspaceCopy } from "@/lib/guardian-workspace-copy";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import { resolveTutorLocation } from "@/lib/mexico-locations";
import {
  TUTOR_PILOT_FREE,
  TUTOR_PILOT_LABEL,
  tutorSharePath,
  type GuardianKind,
  type TutorMaterialKind,
  type TutorSeasonInput,
  type TutorSeasonStat,
} from "@/lib/tutor-family";
import type { TutorLinkRequest } from "@/lib/tutor-link-requests";
import type { TutorLinkedPerformance } from "@/lib/tutor-linked-performance";
import type { TutorSeasonClaim } from "@/lib/tutor-season-claims";
import {
  assertTutorMediaSize,
  assertTutorVideoQuota,
  friendlyTutorUploadError,
  TUTOR_VIDEO_QUOTA_BYTES,
  type TutorUploadState,
} from "@/lib/tutor-media-limits";
import { maybeCompressTutorVideo } from "@/lib/tutor-video-compress";
import { normalizeMobilePhoto } from "@/lib/mobile-file-input";

function uploadFileWithProgress(
  signedUrl: string,
  file: File,
  onProgress: (percent: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) return;
      onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      let detail = "";
      try {
        const parsed = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        detail = parsed.message || parsed.error || "";
      } catch {
        detail = xhr.responseText?.trim() || "";
      }
      reject(
        new Error(detail || `No se pudo subir el archivo (error ${xhr.status}).`),
      );
    };
    xhr.onerror = () => reject(new Error("Falló la conexión al subir el archivo."));
    xhr.onabort = () => reject(new Error("Se canceló la carga."));
    xhr.send(body);
  });
}

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
  linked_performances?: TutorLinkedPerformance[] | null;
  memberships?: Array<{
    player_id: string;
    academy_id: string;
    academy_name: string;
    player_slug: string;
    linked_at: string;
  }>;
  seasons?: TutorSeasonStat[];
  season_claims?: Record<string, TutorSeasonClaim>;
  view_stats?: {
    total_views: number;
    unique_visitors: number;
    views_last_7_days: number;
  } | null;
  explore_opt_in?: boolean;
  explore_opt_in_at?: string | null;
  explore_consent_evidence?: {
    accepted_at: string;
    acceptor_user_id: string;
    acceptor_name: string;
    acceptor_email: string | null;
    ip: string | null;
    user_agent: string | null;
    consent_version: string;
    consent_text: string;
    revoked_at?: string | null;
  } | null;
  profile: {
    birth_date: string | null;
    position: string | null;
    club: string | null;
    school: string | null;
    city: string | null;
    state: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    nationality: string | null;
    nui: string | null;
    dominant_foot: "left" | "right" | "both" | null;
    bio: string | null;
    goals: string | null;
    youtube_url: string | null;
    transfermarkt_url: string | null;
    role_title: string | null;
    tagline: string | null;
    contact_email: string | null;
    contact_whatsapp: string | null;
    show_contact_email: boolean;
    show_contact_whatsapp: boolean;
    show_contact_academy: boolean;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
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
  state: "",
  height_cm: "",
  weight_kg: "",
  nationality: "",
  nui: "",
  dominant_foot: "" as "" | "left" | "right" | "both",
  bio: "",
  goals: "",
  youtube_url: "",
  transfermarkt_url: "",
  role_title: "",
  tagline: "",
  contact_email: "",
  contact_whatsapp: "",
  show_contact_email: false,
  show_contact_whatsapp: false,
  show_contact_academy: false,
  instagram: "",
  facebook: "",
  tiktok: "",
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
    signedUrl?: string;
    child?: TutorChildCard;
    suggestions?: LinkSuggestion[];
    mode?: "active" | "pending";
    proposed_to_academy?: boolean;
    pending?: TutorLinkRequest[];
    video_used_bytes?: number;
    video_quota_bytes?: number;
  };
  if (!response.ok) throw new Error(payload.error || "No se pudo completar.");
  return payload;
}

export function TutorWorkspace({ workspace = "tutor" }: TutorWorkspaceProps) {
  const router = useRouter();
  const copy = guardianWorkspaceCopy();
  const [phone, setPhone] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [children, setChildren] = useState<TutorChildCard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadState, setUploadState] = useState<TutorUploadState | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoUsedBytes, setVideoUsedBytes] = useState(0);
  const [videoQuotaBytes, setVideoQuotaBytes] = useState(TUTOR_VIDEO_QUOTA_BYTES);
  const uploadLock = useRef(false);
  const [form, setForm] = useState(emptyForm);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [linkSuggestions, setLinkSuggestions] = useState<LinkSuggestion[]>([]);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkInboxKey, setLinkInboxKey] = useState(0);
  const [pendingLinks, setPendingLinks] = useState<TutorLinkRequest[]>([]);
  const [onboardNotice, setOnboardNotice] = useState<string | null>(null);
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [showDeleteAccountPanel, setShowDeleteAccountPanel] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteAccountBusy, setDeleteAccountBusy] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [consentPromptOpen, setConsentPromptOpen] = useState(false);
  const childPanelRef = useRef<HTMLDivElement | null>(null);
  const createFichaRef = useRef<HTMLFormElement | null>(null);

  const load = useCallback(async (whatsapp: string, preferId?: string | null) => {
    const params = new URLSearchParams({ kind: "all" });
    if (whatsapp) params.set("phone", whatsapp);
    const payload = await authed(`/fut/api/tutor/home?${params.toString()}`);
    const rows = payload.children ?? [];
    setVideoUsedBytes(Number(payload.video_used_bytes) || 0);
    setVideoQuotaBytes(
      Number(payload.video_quota_bytes) > 0
        ? Number(payload.video_quota_bytes)
        : TUTOR_VIDEO_QUOTA_BYTES,
    );
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
    try {
      const params = new URLSearchParams(window.location.search);
      const claim = (params.get("claim_code") || params.get("ref") || "")
        .trim()
        .toUpperCase();
      if (claim) {
        setForm((current) =>
          current.public_code ? current : { ...current, public_code: claim },
        );
      }
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
        if (!current) {
          router.replace(`/fut/entrar?next=${encodeURIComponent(copy.path)}`);
          return;
        }
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
  }, [load, copy.onboardEmpty, copy.path, router]);

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
      ...(() => {
        const loc = resolveTutorLocation(
          child.profile.state,
          child.profile.city,
        );
        return { state: loc.state, city: loc.city };
      })(),
      height_cm: child.profile.height_cm != null ? String(child.profile.height_cm) : "",
      weight_kg: child.profile.weight_kg != null ? String(child.profile.weight_kg) : "",
      nationality: child.profile.nationality ?? "",
      nui: child.profile.nui ?? "",
      dominant_foot: child.profile.dominant_foot ?? "",
      bio: child.profile.bio ?? "",
      goals: child.profile.goals ?? "",
      youtube_url: child.profile.youtube_url ?? "",
      transfermarkt_url: child.profile.transfermarkt_url ?? "",
      role_title: child.profile.role_title ?? "",
      tagline: child.profile.tagline ?? "",
      contact_email: child.profile.contact_email ?? "",
      contact_whatsapp: child.profile.contact_whatsapp ?? "",
      show_contact_email: Boolean(child.profile.show_contact_email),
      show_contact_whatsapp: Boolean(child.profile.show_contact_whatsapp),
      show_contact_academy: Boolean(child.profile.show_contact_academy),
      instagram: child.profile.instagram ?? "",
      facebook: child.profile.facebook ?? "",
      tiktok: child.profile.tiktok ?? "",
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

  const refreshChildLinks = useCallback(async (childId: string) => {
    try {
      const payload = await authed(
        `/fut/api/tutor/links?child_id=${encodeURIComponent(childId)}`,
      );
      setLinkSuggestions((payload.suggestions as LinkSuggestion[]) ?? []);
      setPendingLinks(
        Array.isArray(payload.pending) ? (payload.pending as TutorLinkRequest[]) : [],
      );
    } catch {
      setLinkSuggestions([]);
      setPendingLinks([]);
    }
  }, []);

  useEffect(() => {
    if (!child) {
      setLinkSuggestions([]);
      setPendingLinks([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const payload = await authed(
          `/fut/api/tutor/links?child_id=${encodeURIComponent(child.id)}`,
        );
        if (cancelled) return;
        setLinkSuggestions((payload.suggestions as LinkSuggestion[]) ?? []);
        setPendingLinks(
          Array.isArray(payload.pending) ? (payload.pending as TutorLinkRequest[]) : [],
        );
      } catch {
        if (cancelled) return;
        setLinkSuggestions([]);
        setPendingLinks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [child]);

  async function linkPlayer(playerId: string, match?: LinkSuggestion["match"]) {
    if (!child) return;
    setLinkBusy(true);
    setError(null);
    try {
      const payload = await authed("/fut/api/tutor/links", {
        method: "POST",
        body: JSON.stringify({
          child_id: child.id,
          player_id: playerId,
          match: match ?? "manual",
          confirm: true,
        }),
      });
      await load(phone, child.id);
      await refreshChildLinks(child.id);
      setLinkInboxKey((value) => value + 1);
      if (payload.mode === "pending") {
        setNotice(
          "Solicitud enviada a la academia. Cuando la confirmen, verás stats oficiales aquí.",
        );
      } else {
        setNotice("Jugador ligado con su academia. Es la misma persona en ambos lados.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo ligar.");
    } finally {
      setLinkBusy(false);
    }
  }

  async function cancelLinkRequest(requestId: string) {
    setLinkBusy(true);
    setError(null);
    try {
      await authed("/fut/api/tutor/links", {
        method: "POST",
        body: JSON.stringify({ action: "reject", request_id: requestId }),
      });
      if (child) await refreshChildLinks(child.id);
      setLinkInboxKey((value) => value + 1);
      setNotice("Solicitud de vínculo cancelada.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar.");
    } finally {
      setLinkBusy(false);
    }
  }

  async function unlinkPlayer(playerId?: string) {
    if (!child) return;
    setLinkBusy(true);
    setError(null);
    try {
      await authed("/fut/api/tutor/links", {
        method: "POST",
        body: JSON.stringify({
          action: "unlink",
          child_id: child.id,
          player_id: playerId || undefined,
        }),
      });
      await load(phone, child.id);
      setNotice(
        playerId
          ? "Se quitó el vínculo con esa academia."
          : "Se quitaron los vínculos con academias.",
      );
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

  function authErrorMessage(err: unknown) {
    if (!(err instanceof Error)) return "No se pudo actualizar.";
    if (err.message.includes("Password should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    if (
      err.message.includes("rate limit") ||
      err.message.includes("over_email_send_rate_limit")
    ) {
      return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    }
    return err.message;
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
          state: form.state || null,
          height_cm: form.height_cm ? Number(form.height_cm) : null,
          weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
          nationality: form.nationality || null,
          nui: form.nui || null,
          dominant_foot: form.dominant_foot || null,
          bio: form.bio || null,
          goals: form.goals || null,
          youtube_url: form.youtube_url || null,
          transfermarkt_url: form.transfermarkt_url || null,
          role_title: form.role_title || null,
          tagline: form.tagline || null,
          contact_email: form.contact_email || null,
          contact_whatsapp: form.contact_whatsapp || null,
          show_contact_email: Boolean(form.show_contact_email),
          show_contact_whatsapp: Boolean(form.show_contact_whatsapp),
          show_contact_academy: Boolean(form.show_contact_academy),
          instagram: form.instagram || null,
          facebook: form.facebook || null,
          tiktok: form.tiktok || null,
          highlight_chips_text: form.highlight_chips_text || null,
          achievements_text: form.achievements_text || null,
          callups_text: form.callups_text || null,
        }),
      });
      const createdId = payload.child?.id ?? null;
      await load(phone, createdId);
      if (createdId) setSelectedId(createdId);
      setOnboardNotice(null);
      if (!updating) {
        const { trackProductEvent } = await import("@/lib/product-analytics");
        trackProductEvent("create_ficha", { child_id: createdId });
        setConsentPromptOpen(true);
      }
      setNotice(
        updating
          ? "Ficha actualizada. La vista previa ya refleja los cambios."
          : form.public_code.trim()
            ? "Ficha creada con tu código MF. Si hay plantel con el mismo código, confirma el vínculo en Academia."
            : "Ficha creada. Completa foto, historia y firma el consentimiento para Explorar.",
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

  async function toggleExploreOptIn(enabled: boolean, acceptorName?: string) {
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
          acceptor_name: acceptorName ?? "",
        }),
      });
      await load(phone);
      if (enabled) {
        const { trackProductEvent } = await import("@/lib/product-analytics");
        trackProductEvent("sign_consent", { child_id: child.id });
      }
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

  async function signLinkedAcademyConsent(acceptorName?: string) {
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
          acceptor_name: acceptorName ?? "",
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

  async function onFile(
    kind: "photo" | "video",
    files: FileList | File[] | File | undefined,
  ) {
    if (!child || !files) return;
    const list =
      files instanceof File
        ? [files]
        : Array.from(files as FileList | File[]).filter(Boolean);
    if (list.length === 0) {
      setUploadError(
        "No se detectó ningún archivo. En el celular elige de Galería/Fotos (no Archivos) y vuelve a intentar.",
      );
      return;
    }
    if (uploadLock.current || busy) {
      setUploadError("Espera a que termine la carga actual.");
      return;
    }
    uploadLock.current = true;
    setBusy(true);
    setError(null);
    setUploadError(null);
    setNotice(null);
    // Feedback inmediato en móvil (antes de prepare/red).
    setUploadState({
      kind,
      fileName: list[0]?.name || (kind === "video" ? "video" : "foto"),
      phase: "prepare",
      percent: null,
      index: 1,
      total: list.length,
    });
    window.setTimeout(() => {
      document
        .getElementById("tutor-material-upload")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);

    let uploaded = 0;
    let lastError: string | null = null;
    let runningVideoUsed = videoUsedBytes;

    try {
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const index = i + 1;
        const total = list.length;
        try {
          if (file.size <= 0) {
            throw new Error(
              kind === "photo"
                ? "Esa foto llegó vacía. Prueba otra desde Galería/Fotos."
                : "Ese video llegó vacío. Prueba otro desde Galería.",
            );
          }
          let uploadFile = file;
          if (kind === "photo") {
            uploadFile = await normalizeMobilePhoto(file);
          }
          assertTutorMediaSize(kind, uploadFile);
          if (kind === "video") {
            setUploadState({
              kind,
              fileName: file.name,
              phase: "compress",
              percent: 0,
              index,
              total,
            });
            const result = await maybeCompressTutorVideo(file, (percent) => {
              setUploadState({
                kind,
                fileName: file.name,
                phase: "compress",
                percent,
                index,
                total,
              });
            });
            uploadFile = result.file;
            assertTutorMediaSize(kind, uploadFile);
            assertTutorVideoQuota(runningVideoUsed, uploadFile.size);
          }

          setUploadState({
            kind,
            fileName: uploadFile.name,
            phase: "prepare",
            percent: null,
            index,
            total,
          });
          const prepared = await authed("/fut/api/tutor/materials", {
            method: "POST",
            body: JSON.stringify({
              action: "prepare",
              child_id: child.id,
              kind,
              file_name: uploadFile.name,
              file_size: uploadFile.size,
            }),
          });
          if (!prepared.path) throw new Error("No se abrió la carga.");
          if (prepared.video_used_bytes != null) {
            runningVideoUsed = Number(prepared.video_used_bytes) || runningVideoUsed;
            setVideoUsedBytes(runningVideoUsed);
          }

          setUploadState({
            kind,
            fileName: uploadFile.name,
            phase: "upload",
            percent: 0,
            index,
            total,
          });

          if (prepared.signedUrl) {
            await uploadFileWithProgress(
              String(prepared.signedUrl),
              uploadFile,
              (percent) => {
                setUploadState({
                  kind,
                  fileName: uploadFile.name,
                  phase: "upload",
                  percent,
                  index,
                  total,
                });
              },
            );
          } else if (prepared.token) {
            const signedUpload = await supabase.storage
              .from("mificha-ops")
              .uploadToSignedUrl(prepared.path, prepared.token, uploadFile);
            if (signedUpload.error) throw new Error(signedUpload.error.message);
          } else {
            throw new Error("No se abrió la carga.");
          }

          setUploadState({
            kind,
            fileName: uploadFile.name,
            phase: "save",
            percent: 100,
            index,
            total,
          });
          const committed = await authed("/fut/api/tutor/materials", {
            method: "POST",
            body: JSON.stringify({
              action: "commit",
              child_id: child.id,
              kind,
              title: file.name,
              path: prepared.path,
              byte_size: uploadFile.size,
              file_size: uploadFile.size,
            }),
          });
          if (committed.video_used_bytes != null) {
            runningVideoUsed = Number(committed.video_used_bytes) || runningVideoUsed;
            setVideoUsedBytes(runningVideoUsed);
          } else if (kind === "video") {
            runningVideoUsed += uploadFile.size;
            setVideoUsedBytes(runningVideoUsed);
          }
          uploaded += 1;
        } catch (err: unknown) {
          const raw = err instanceof Error ? err.message : "No se subió el archivo.";
          lastError = friendlyTutorUploadError(raw, kind);
          // Sigue con el resto si hay varios archivos.
          if (list.length === 1) throw err;
        }
      }

      await load(phone);
      if (uploaded > 0) {
        const noun =
          kind === "video"
            ? uploaded === 1
              ? "Video subido"
              : `${uploaded} videos subidos`
            : uploaded === 1
              ? "Foto subida"
              : `${uploaded} fotos subidas`;
        setNotice(
          lastError
            ? `${noun}. Algunos fallaron: ${lastError}`
            : kind === "video"
              ? `${noun}. Puedes agregar más o marcar uno como destacado.`
              : `${noun}.`,
        );
      }
      if (lastError && uploaded === 0) {
        setUploadError(lastError);
        setError(lastError);
      } else if (lastError) {
        setUploadError(lastError);
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "No se subió el archivo.";
      const message = friendlyTutorUploadError(raw, kind);
      setUploadError(message);
      setError(message);
      window.setTimeout(() => {
        document
          .getElementById("tutor-material-upload")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    } finally {
      uploadLock.current = false;
      setBusy(false);
      setUploadState(null);
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
    setNotice(null);
    try {
      const payload = await authed("/fut/api/tutor/seasons", {
        method: "POST",
        body: JSON.stringify({
          action: "save",
          child_id: child.id,
          season_id: seasonId ?? undefined,
          ...input,
        }),
      });
      await load(phone);
      if (payload.proposed_to_academy) {
        setNotice(
          "Torneo guardado y enviado a la academia ligada para revisión. No sustituye el acta oficial de partidos.",
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se guardó el torneo.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteChild() {
    if (!child) return;
    const ok = window.confirm(
      `¿Eliminar la ficha de ${child.player_name}? Se borran fotos, videos, torneos y el link público. No se puede deshacer.`,
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await authed("/fut/api/tutor/children", {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          child_id: child.id,
        }),
      });
      const rows = await load(phone);
      setSelectedId(rows[0]?.id ?? null);
      setForm(emptyForm);
      setOnboardNotice(rows.length === 0 ? copy.onboardEmpty : null);
      setNotice(
        rows.length === 0
          ? "Ficha eliminada. Puedes crear otra cuando quieras."
          : `Se eliminó la ficha de ${child.player_name}.`,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el jugador.");
    } finally {
      setBusy(false);
    }
  }

  async function reorderSeasons(orderedIds: string[]) {
    if (!child) return;
    const childId = child.id;
    setBusy(true);
    setError(null);
    setChildren((prev) =>
      prev.map((row) => {
        if (row.id !== childId) return row;
        const byId = new Map((row.seasons ?? []).map((season) => [season.id, season]));
        const seasons = orderedIds
          .map((id, index) => {
            const season = byId.get(id);
            return season ? { ...season, sort_order: index } : null;
          })
          .filter((season): season is NonNullable<typeof season> => Boolean(season));
        return { ...row, seasons };
      }),
    );
    try {
      await authed("/fut/api/tutor/seasons", {
        method: "POST",
        body: JSON.stringify({
          action: "reorder",
          child_id: childId,
          ordered_ids: orderedIds,
        }),
      });
      await load(phone, childId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo reordenar.");
      await load(phone, childId);
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

  async function onDeleteAccount(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setDeleteAccountBusy(true);
    try {
      await authed("/fut/api/tutor/account", {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          confirm: deleteConfirmText.trim(),
        }),
      });
      await supabase.auth.signOut();
      window.location.assign("/fut/entrar");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la cuenta.");
      setDeleteAccountBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-mf-text-muted">Cargando…</p>;
  }

  if (!sessionEmail) {
    return (
      <p className="text-sm text-mf-text-muted">
        Te llevamos a Entrar…{" "}
        <Link
          href={`/fut/entrar?next=${encodeURIComponent(copy.path)}`}
          className="font-semibold text-mf-gph hover:underline"
        >
          Continuar
        </Link>
      </p>
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
              setShowDeleteAccountPanel(false);
              setError(null);
            }}
          >
            Cambiar contraseña
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-mf-text-muted hover:text-mf-text"
            onClick={() => {
              void (async () => {
                try {
                  await supabase.auth.signOut({ scope: "global" });
                } catch {
                  try {
                    await supabase.auth.signOut();
                  } catch {
                    /* igual redirigimos */
                  }
                }
                window.location.assign("/fut/entrar");
              })();
            }}
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

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
        <p className="text-sm font-semibold text-amber-950">
          ¿Te registraste en las visorías GPH/CRACKS?
        </p>
        <p className="mt-1 text-sm leading-6 text-amber-950/85">
          Pon el WhatsApp del registro para traer las fichas ya sembradas a esta cuenta
          (también se reclaman por el mismo correo con el que entraste).
        </p>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            const next = phone.trim();
            try {
              if (next) window.localStorage.setItem(PHONE_STORAGE_KEY, next);
            } catch {
              /* ignore */
            }
            setBusy(true);
            void load(next, selectedId)
              .then(async (rows) => {
                const { trackProductEvent } = await import("@/lib/product-analytics");
                trackProductEvent("claim_visorias", {
                  found: rows.length,
                  channel: "whatsapp",
                });
                setNotice(
                  rows.length > 0
                    ? `Listo: ${rows.length} ficha${rows.length === 1 ? "" : "s"} en tu cuenta.`
                    : "No encontramos fichas con ese WhatsApp. Revisa el número o crea la ficha abajo.",
                );
              })
              .catch((err: unknown) => {
                setError(
                  err instanceof Error ? err.message : "No se pudo reclamar la ficha.",
                );
              })
              .finally(() => setBusy(false));
          }}
        >
          <label className="block min-w-0 flex-1 text-sm">
            <span className="font-medium text-amber-950">WhatsApp del registro</span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="442… o 52…"
              className="mf-input mt-1"
              autoComplete="tel"
            />
          </label>
          <button type="submit" disabled={busy} className="mf-btn-gph shrink-0">
            {busy ? "Buscando…" : "Traer fichas"}
          </button>
        </form>
      </div>

      <TutorLinkRequestsInbox
        refreshKey={linkInboxKey}
        onChanged={() => void load(phone, selectedId)}
      />
      <TutorAgreementsInbox />
      <TutorActivityInbox />

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
                  window.setTimeout(() => {
                    childPanelRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 80);
                }}
                className={
                  item.id === child?.id
                    ? "inline-flex items-center gap-2 rounded-full bg-mf-gph px-4 py-2 text-sm font-semibold text-white"
                    : "inline-flex items-center gap-2 rounded-full border border-mf-border bg-white px-4 py-2 text-sm font-semibold text-mf-gph-ink"
                }
              >
                <span>{item.player_name}</span>
                <span
                  className={
                    item.id === child?.id
                      ? "rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                      : item.explore_opt_in
                        ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800"
                        : "rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900"
                  }
                >
                  {item.explore_opt_in ? "En Explorar" : "Oculta"}
                </span>
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
          {child ? (
            <p className="pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => void deleteChild()}
                className="text-xs font-semibold text-mf-text-muted hover:text-mf-danger disabled:opacity-60"
              >
                Eliminar ficha de {child.player_name}
              </button>
            </p>
          ) : null}
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
              placeholder="Ej. Santiago Hernández"
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Fecha de nacimiento
            <input
              type="date"
              value={form.birth_date}
              onChange={(event) =>
                setForm((current) => ({ ...current, birth_date: event.target.value }))
              }
              onFocus={() => {
                void import("@/lib/product-analytics").then(({ trackProductEvent }) => {
                  trackProductEvent("start_ficha");
                });
              }}
              className={inputClass}
            />
          </label>
          <MexicoLocationSelect
            state={form.state}
            city={form.city}
            onStateChange={(state) =>
              setForm((current) => ({ ...current, state }))
            }
            onCityChange={(city) =>
              setForm((current) => ({ ...current, city }))
            }
            selectClassName="focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]"
          />
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
            pendingLinks={pendingLinks}
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
            onReorderSeasons={(ids) => void reorderSeasons(ids)}
            uploadState={uploadState}
            uploadError={uploadError}
            videoUsedBytes={videoUsedBytes}
            videoQuotaBytes={videoQuotaBytes}
            onCopyShare={() => void copyShare()}
            onCopyPublicCode={() => void copyPublicCode()}
            onToggleExploreOptIn={(enabled, name) =>
              void toggleExploreOptIn(enabled, name)
            }
            onSignLinkedAcademyConsent={(name) =>
              void signLinkedAcademyConsent(name)
            }
            onLinkPlayer={(playerId, match) => void linkPlayer(playerId, match)}
            onUnlinkPlayer={(playerId) => void unlinkPlayer(playerId)}
            onCancelLinkRequest={(requestId) => void cancelLinkRequest(requestId)}
          />
        </div>
      ) : null}

      <div className="border-t border-mf-border/70 pt-6">
        {showDeleteAccountPanel ? (
          <form
            onSubmit={(event) => void onDeleteAccount(event)}
            className="mx-auto max-w-md space-y-3 rounded-xl border border-mf-danger/30 bg-white p-4 sm:p-5"
          >
            <p className="text-sm font-semibold text-mf-gph-ink">Eliminar mi cuenta</p>
            <p className="text-sm leading-6 text-mf-text-secondary">
              Se borran todas tus fichas (fotos, videos, torneos y links públicos) y el acceso
              con este correo. No se puede deshacer. El plantel de una academia no se toca.
            </p>
            <label className="block text-sm font-medium text-mf-text">
              Escribe ELIMINAR para confirmar
              <input
                required
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                className={inputClass}
                autoComplete="off"
                spellCheck={false}
                placeholder="ELIMINAR"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={
                  deleteAccountBusy ||
                  deleteConfirmText.trim().toUpperCase() !== "ELIMINAR"
                }
                className="rounded-lg bg-mf-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleteAccountBusy ? "Eliminando…" : "Eliminar cuenta"}
              </button>
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-mf-text-muted hover:text-mf-text"
                onClick={() => {
                  setShowDeleteAccountPanel(false);
                  setDeleteConfirmText("");
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <p className="text-center">
            <button
              type="button"
              className="text-[11px] font-medium text-mf-text-muted/80 underline-offset-2 hover:text-mf-text-muted hover:underline"
              onClick={() => {
                setShowDeleteAccountPanel(true);
                setShowPasswordPanel(false);
                setError(null);
                setNotice(null);
              }}
            >
              Eliminar mi cuenta
            </button>
          </p>
        )}
      </div>

      {consentPromptOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-prompt-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-mf-border bg-white p-5 shadow-xl">
            <p
              id="consent-prompt-title"
              className="text-lg font-semibold text-mf-gph-ink"
            >
              ¿Publicar en Explorar?
            </p>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              Sin tu consentimiento firmado, la ficha <strong>no aparece</strong> en el
              buscador. El link MF- sí funciona si lo compartes. Firma en el paso{" "}
              <strong>Publicar en Explorar</strong> (abajo en el constructor).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="mf-btn-gph"
                onClick={() => {
                  setConsentPromptOpen(false);
                  childPanelRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                Ir a firmar
              </button>
              <button
                type="button"
                className="mf-btn-gph-ghost"
                onClick={() => setConsentPromptOpen(false)}
              >
                Después
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
