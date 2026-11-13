"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  buildPlayerSlug,
  buildPublicPlayerUrl,
  dominantFootOptions,
  positionOptions,
} from "@/lib/player-utils";
import { uploadPlayerPhoto, uploadPlayerVideo } from "@/lib/storage";
import { PlayerPrivacyControls } from "@/components/ui/player-privacy-controls";
import { PlayerVideosPanel } from "@/components/dashboard/player-videos-panel";
import { PlayerVisualProfileFields } from "@/components/dashboard/player-visual-profile-fields";
import { COACH_NOTES_MAX_LENGTH, clampTrait } from "@/lib/player-visual-profile";
import { PLAYER_CODE_LABEL, PLAYER_CODE_SHORT } from "@/lib/player-public-code-copy";
import { buildPrivacyPayload } from "@/lib/privacy";
import { supabase } from "@/lib/supabase";
import type { TutorLinkMatchKind } from "@/lib/tutor-player-link";
import { cn } from "@/lib/utils";
import type { DominantFoot, Player, PlayerPosition } from "@/types/database";

const inputClassName = cn(
  "mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900",
  "focus:border-[#1B4F8C] focus:outline-none focus:ring-2 focus:ring-[#1B4F8C]/20",
);

const selectClassName = cn(inputClassName, "bg-white");

type TutorMatchRow = {
  child_id: string;
  player_name: string;
  public_code: string;
  birth_date: string | null;
  reason: string;
  match: TutorLinkMatchKind;
};

export interface PlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academyId: string;
  player?: Player | null;
  onSaved: (message: string) => void;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo guardar el jugador.";
}

async function authedFetch(path: string, init?: RequestInit) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
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
    matches?: TutorMatchRow[];
  };
  if (!response.ok) throw new Error(payload.error || "No se pudo completar.");
  return payload;
}

export function PlayerModal({
  open,
  onOpenChange,
  academyId,
  player,
  onSaved,
}: PlayerModalProps) {
  const isEditing = Boolean(player);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [publicCode, setPublicCode] = useState("");
  const [position, setPosition] = useState<PlayerPosition>("midfielder");
  const [dominantFoot, setDominantFoot] = useState<DominantFoot>("right");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [notifyGuardianOnMatch, setNotifyGuardianOnMatch] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [secondaryPosition, setSecondaryPosition] = useState<PlayerPosition | "">("");
  const [traitTechnical, setTraitTechnical] = useState<number | null>(null);
  const [traitTactical, setTraitTactical] = useState<number | null>(null);
  const [traitPhysical, setTraitPhysical] = useState<number | null>(null);
  const [traitAttitude, setTraitAttitude] = useState<number | null>(null);
  const [coachNotes, setCoachNotes] = useState("");
  const [tutorMatches, setTutorMatches] = useState<TutorMatchRow[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [matchBusy, setMatchBusy] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setPhotoFile(null);
    setVideoFile(null);
    setTutorMatches([]);
    setSelectedChildId(null);
    setPublicCode("");

    if (player) {
      setFirstName(player.first_name);
      setLastName(player.last_name);
      setBirthDate(player.birth_date ?? "");
      setPosition(player.position);
      setDominantFoot(player.dominant_foot);
      setJerseyNumber(player.jersey_number?.toString() ?? "");
      setHeightCm(player.height_cm?.toString() ?? "");
      setWeightKg(player.weight_kg?.toString() ?? "");
      setIsPublic(player.is_public);
      setIsDiscoverable(player.is_discoverable ?? false);
      setHasConsent(Boolean(player.public_consent_at));
      setGuardianName(player.guardian_name ?? "");
      setGuardianEmail(player.guardian_email ?? "");
      setGuardianPhone(player.guardian_phone ?? "");
      setNotifyGuardianOnMatch(player.notify_guardian_on_match ?? true);
      setPhotoPreview(player.photo_url);
      setVideoPreview(player.video_url);
      setSecondaryPosition(player.secondary_position ?? "");
      setTraitTechnical(player.trait_technical);
      setTraitTactical(player.trait_tactical);
      setTraitPhysical(player.trait_physical);
      setTraitAttitude(player.trait_attitude);
      setCoachNotes(player.coach_notes ?? "");
      return;
    }

    setFirstName("");
    setLastName("");
    setBirthDate("");
    setPosition("midfielder");
    setDominantFoot("right");
    setJerseyNumber("");
    setHeightCm("");
    setWeightKg("");
    setIsPublic(false);
    setIsDiscoverable(false);
    setHasConsent(false);
    setGuardianName("");
    setGuardianEmail("");
    setGuardianPhone("");
    setPhotoPreview(null);
    setVideoPreview(null);
    setSecondaryPosition("");
    setTraitTechnical(null);
    setTraitTactical(null);
    setTraitPhysical(null);
    setTraitAttitude(null);
    setCoachNotes("");
  }, [open, player]);

  useEffect(() => {
    if (!open) return;
    const name = `${firstName} ${lastName}`.trim();
    const code = publicCode.trim();
    const birth = birthDate.trim();
    const phone = guardianPhone.trim();
    const email = guardianEmail.trim();
    if (!code && !(name.length >= 3 && birth) && !(name.length >= 3 && (phone || email))) {
      setTutorMatches([]);
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        setMatchBusy(true);
        try {
          const params = new URLSearchParams({ academy_id: academyId, name });
          if (birth) params.set("birth_date", birth);
          if (phone) params.set("guardian_phone", phone);
          if (email) params.set("guardian_email", email);
          if (code) params.set("public_code", code);
          const payload = await authedFetch(`/fut/api/players/match?${params}`);
          const rows = payload.matches ?? [];
          setTutorMatches(rows);
          setSelectedChildId((current) =>
            current && rows.some((row) => row.child_id === current) ? current : null,
          );
        } catch {
          setTutorMatches([]);
        } finally {
          setMatchBusy(false);
        }
      })();
    }, 420);

    return () => window.clearTimeout(timer);
  }, [
    open,
    academyId,
    firstName,
    lastName,
    birthDate,
    publicCode,
    guardianPhone,
    guardianEmail,
  ]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let photoUrl = player?.photo_url ?? null;
      let videoUrl = player?.video_url ?? null;

      if (photoFile) {
        photoUrl = await uploadPlayerPhoto(academyId, photoFile);
      }

      if (videoFile) {
        videoUrl = await uploadPlayerVideo(academyId, videoFile);
      }

      const privacy = buildPrivacyPayload({
        isPublic,
        isDiscoverable,
        hasConsent,
        existingConsentAt: player?.public_consent_at,
      });

      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate.trim() || null,
        position,
        dominant_foot: dominantFoot,
        jersey_number: jerseyNumber ? Number(jerseyNumber) : null,
        height_cm: heightCm ? Number(heightCm) : null,
        weight_kg: weightKg ? Number(weightKg) : null,
        photo_url: photoUrl,
        video_url: videoUrl,
        guardian_name: guardianName.trim() || null,
        guardian_email: guardianEmail.trim().toLowerCase() || null,
        guardian_phone: guardianPhone.trim() || null,
        notify_guardian_on_match: notifyGuardianOnMatch,
        secondary_position: secondaryPosition || null,
        trait_technical: clampTrait(traitTechnical),
        trait_tactical: clampTrait(traitTactical),
        trait_physical: clampTrait(traitPhysical),
        trait_attitude: clampTrait(traitAttitude),
        coach_notes: coachNotes.trim().slice(0, COACH_NOTES_MAX_LENGTH) || null,
        ...privacy,
      };

      let playerId = player?.id ?? "";

      if (isEditing && player) {
        const { error: updateError } = await supabase
          .from("players")
          .update(payload)
          .eq("id", player.id);

        if (updateError) throw updateError;
      } else {
        const slug = buildPlayerSlug(firstName, lastName);
        const qrCode = buildPublicPlayerUrl(slug);

        const { data: inserted, error: insertError } = await supabase
          .from("players")
          .insert({
            ...payload,
            slug,
            qr_code: qrCode,
            academy_id: academyId,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;
        playerId = String(inserted.id);
      }

      if (selectedChildId) {
        await authedFetch("/fut/api/players/link-tutor", {
          method: "POST",
          body: JSON.stringify({
            academy_id: academyId,
            player_id: playerId,
            child_id: selectedChildId,
            public_code: publicCode.trim() || undefined,
            confirm: true,
          }),
        });
        onSaved(
          isEditing
            ? "Jugador actualizado y vinculado a la ficha tutor."
            : "Ficha creada y vinculada a la ficha tutor (mismo código MF).",
        );
      } else {
        onSaved(
          isEditing
            ? "Jugador actualizado."
            : "Ficha creada. Envía el link al tutor desde Avisos a tutores.",
        );
      }

      onOpenChange(false);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-slate-900">
                {isEditing ? "Editar jugador" : "Nuevo jugador"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Registra la ficha del jugador. Por defecto es privada; activa
                compartir solo con consentimiento parental.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nombre *
                </label>
                <input
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Apellidos *
                </label>
                <input
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Fecha de nacimiento
                  <span className="font-normal text-slate-400"> (opcional)</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Número de playera
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={jerseyNumber}
                  onChange={(event) => setJerseyNumber(event.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{PLAYER_CODE_LABEL}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {PLAYER_CODE_SHORT} Si el tutor ya tiene ficha, pega su{" "}
                <span className="font-mono font-semibold">MF-</span> o completa
                nombre + nacimiento para evitar duplicados. El vínculo solo se
                crea si confirmas abajo.
              </p>
              <label className="mt-3 block text-sm font-medium text-slate-700">
                Código MF- del tutor (opcional)
                <input
                  value={publicCode}
                  onChange={(event) => setPublicCode(event.target.value.toUpperCase())}
                  className={cn(inputClassName, "font-mono uppercase")}
                  placeholder="MF-A3K9"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              {matchBusy ? (
                <p className="mt-3 text-xs text-slate-500">Buscando fichas tutor…</p>
              ) : null}
              {tutorMatches.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {tutorMatches.map((item) => {
                    const selected = selectedChildId === item.child_id;
                    return (
                      <li key={item.child_id}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedChildId(selected ? null : item.child_id)
                          }
                          className={cn(
                            "flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-3 text-left",
                            selected
                              ? "border-[#1B4F8C] bg-white ring-2 ring-[#1B4F8C]/20"
                              : item.match === "code"
                                ? "border-[#1B4F8C]/30 bg-white"
                                : "border-slate-200 bg-white hover:border-slate-300",
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.player_name}
                              {item.public_code ? (
                                <span className="ml-2 font-mono text-xs font-semibold text-[#1B4F8C]">
                                  {item.public_code}
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">{item.reason}</p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold",
                              selected
                                ? "bg-[#1B4F8C] text-white"
                                : "bg-slate-100 text-slate-600",
                            )}
                          >
                            {selected ? "Conectar al guardar" : "Seleccionar"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {selectedChildId ? (
                <p className="mt-3 text-xs font-medium text-[#1B4F8C]">
                  Al guardar se vinculará con esa ficha tutor (mismo MF). No se
                  crea una segunda ficha suelta.
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Posición *
                </label>
                <select
                  required
                  value={position}
                  onChange={(event) =>
                    setPosition(event.target.value as PlayerPosition)
                  }
                  className={selectClassName}
                >
                  {positionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Pie dominante *
                </label>
                <select
                  required
                  value={dominantFoot}
                  onChange={(event) =>
                    setDominantFoot(event.target.value as DominantFoot)
                  }
                  className={selectClassName}
                >
                  {dominantFootOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Estatura (cm)
                </label>
                <input
                  type="number"
                  min={100}
                  max={220}
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  min={30}
                  max={120}
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Foto {isPublic ? "*" : ""}
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                Requerida para certificación y directorio público.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setPhotoFile(file);
                  setPhotoPreview(file ? URL.createObjectURL(file) : null);
                }}
                className="mt-1 block w-full text-sm text-slate-600"
              />
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="mt-3 h-24 w-24 rounded-full object-cover"
                />
              ) : null}
            </div>

            <PlayerVideosPanel
              academyId={academyId}
              playerId={player?.id ?? null}
              primaryVideoUrl={player?.video_url ?? null}
              primaryVideoPreview={videoPreview}
              onPrimaryVideoChange={(file) => {
                setVideoFile(file);
                if (file) {
                  setVideoPreview(URL.createObjectURL(file));
                  return;
                }
                setVideoPreview(player?.video_url ?? null);
              }}
            />

            <PlayerVisualProfileFields
              secondaryPosition={secondaryPosition}
              onSecondaryPositionChange={setSecondaryPosition}
              traitTechnical={traitTechnical}
              onTraitTechnicalChange={setTraitTechnical}
              traitTactical={traitTactical}
              onTraitTacticalChange={setTraitTactical}
              traitPhysical={traitPhysical}
              onTraitPhysicalChange={setTraitPhysical}
              traitAttitude={traitAttitude}
              onTraitAttitudeChange={setTraitAttitude}
              coachNotes={coachNotes}
              onCoachNotesChange={setCoachNotes}
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Contacto del padre o tutor
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                MiFicha avisa automáticamente tras cada partido (email o WhatsApp). El
                entrenador no tiene que compartir manualmente cada vez.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nombre del tutor
                  </label>
                  <input
                    value={guardianName}
                    onChange={(event) => setGuardianName(event.target.value)}
                    className={inputClassName}
                    placeholder="Ej. María Hernández"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    WhatsApp del tutor
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(event) => setGuardianPhone(event.target.value)}
                    className={inputClassName}
                    placeholder="4421234567"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Email del tutor (alternativa)
                  </label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={(event) => setGuardianEmail(event.target.value)}
                    className={inputClassName}
                    placeholder="tutor@email.com"
                  />
                </div>
                <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={notifyGuardianOnMatch}
                    onChange={(event) => setNotifyGuardianOnMatch(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Enviar actualización automática después de cada partido
                </label>
              </div>
            </div>

            <PlayerPrivacyControls
              birthDate={birthDate}
              hasConsent={hasConsent}
              isPublic={isPublic}
              isDiscoverable={isDiscoverable}
              onConsentChange={(value) => {
                setHasConsent(value);
                if (!value) {
                  setIsPublic(false);
                  setIsDiscoverable(false);
                }
              }}
              onPublicChange={(value) => {
                setIsPublic(value);
                if (!value) setIsDiscoverable(false);
              }}
              onDiscoverableChange={setIsDiscoverable}
            />

            {error ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-3">
              <Dialog.Close className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#1B4F8C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#164278] disabled:opacity-60"
              >
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear ficha"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
