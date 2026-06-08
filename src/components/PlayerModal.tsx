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
import { buildPrivacyPayload } from "@/lib/privacy";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { DominantFoot, Player, PlayerPosition } from "@/types/database";

const inputClassName = cn(
  "mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900",
  "focus:border-[#1B4F8C] focus:outline-none focus:ring-2 focus:ring-[#1B4F8C]/20",
);

const selectClassName = cn(inputClassName, "bg-white");

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

  useEffect(() => {
    if (!open) return;

    setError(null);
    setPhotoFile(null);
    setVideoFile(null);

    if (player) {
      setFirstName(player.first_name);
      setLastName(player.last_name);
      setBirthDate(player.birth_date);
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
    setPhotoPreview(null);
    setVideoPreview(null);
  }, [open, player]);

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
        birth_date: birthDate,
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
        ...privacy,
      };

      if (isEditing && player) {
        const { error: updateError } = await supabase
          .from("players")
          .update(payload)
          .eq("id", player.id);

        if (updateError) throw updateError;
        onSaved("Jugador actualizado.");
      } else {
        const slug = buildPlayerSlug(firstName, lastName);
        const qrCode = buildPublicPlayerUrl(slug);

        const { error: insertError } = await supabase.from("players").insert({
          ...payload,
          slug,
          qr_code: qrCode,
          academy_id: academyId,
        });

        if (insertError) throw insertError;
        onSaved("Ficha creada. Envía el link al tutor desde Avisos a tutores.");
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
                  Fecha de nacimiento *
                </label>
                <input
                  type="date"
                  required
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

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Foto
                </label>
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
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Video (max 50 MB)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setVideoFile(file);
                    setVideoPreview(file ? file.name : null);
                  }}
                  className="mt-1 block w-full text-sm text-slate-600"
                />
                {videoPreview ? (
                  <p className="mt-3 text-sm text-slate-500">{videoPreview}</p>
                ) : null}
              </div>
            </div>

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
