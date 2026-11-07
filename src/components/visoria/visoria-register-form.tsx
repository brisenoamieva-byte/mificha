"use client";

import Link from "next/link";
import { useState } from "react";
import { LEGAL_ROUTES } from "@/lib/legal";
import {
  VISORIA_EVENT,
  VISORIA_POSITIONS,
  VISORIA_PRIVACY_SHORT,
  visoriaContactWhatsAppHref,
  type VisoriaCategory,
  type VisoriaPosition,
} from "@/lib/visoria-event";

const inputClass =
  "mf-input mt-1 focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]";
const checkClass = "mt-1 size-4 shrink-0 accent-[#f54200]";
const consentCheck = "mt-0.5 size-3 shrink-0 accent-[#f54200]";

export function VisoriaRegisterForm() {
  const [playerName, setPlayerName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [category, setCategory] = useState<VisoriaCategory | "">("");
  const [position, setPosition] = useState<VisoriaPosition | "">("");
  const [club, setClub] = useState("");
  const [city, setCity] = useState("Querétaro");
  const [guardianName, setGuardianName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gphSelected, setGphSelected] = useState(false);
  const [thursday, setThursday] = useState(true);
  const [privacy, setPrivacy] = useState(false);
  const [imageRights, setImageRights] = useState(false);
  const [clubsShare, setClubsShare] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/fut/api/visorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_full_name: playerName,
          birth_date: birthDate,
          category,
          position,
          current_club: club,
          city,
          guardian_name: guardianName,
          guardian_phone: phone,
          guardian_email: email,
          attend_thursday: thursday,
          attend_friday: gphSelected,
          gph_selected: gphSelected,
          privacy_accepted: privacy,
          image_rights_accepted: imageRights,
          clubs_share_accepted: clubsShare,
          marketing_accepted: marketing,
          honeypot,
        }),
      });
      const payload = (await response.json()) as { error?: string; folio?: string };
      if (!response.ok || !payload.folio) {
        setError(payload.error ?? "No se pudo guardar. Intenta de nuevo.");
        return;
      }
      setFolio(payload.folio);
    } catch {
      setError("Error de red. Revisa tu conexión e intenta otra vez.");
    } finally {
      setLoading(false);
    }
  }

  if (folio) {
    return (
      <div className="px-1 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Registro listo
        </p>
        <h3 className="mt-2 font-mono text-3xl font-semibold tracking-tight text-mf-gph-ink">
          {folio}
        </h3>
        <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
          Guardamos a {playerName.trim() || "el jugador"}. Te confirmamos por WhatsApp el
          día, la sede y el horario. Lleva una identificación del tutor el día del evento.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={visoriaContactWhatsAppHref()}
            className="mf-btn-gph"
            target="_blank"
            rel="noopener noreferrer"
          >
            Escribir a GPH
          </a>
          <Link href="/fut/tutor" className="mf-btn-gph-ghost">
            Armar ficha del tutor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-8">
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          01 · Jugador
        </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="playerName" className="text-sm font-medium text-mf-text">
            Nombre completo del jugador
          </label>
          <input
            id="playerName"
            required
            autoComplete="name"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            className={inputClass}
            placeholder="Nombre y apellidos"
          />
        </div>
        <div>
          <label htmlFor="birthDate" className="text-sm font-medium text-mf-text">
            Fecha de nacimiento
          </label>
          <input
            id="birthDate"
            type="date"
            required
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className="text-sm font-medium text-mf-text">
            Categoría
          </label>
          <select
            id="category"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value as VisoriaCategory | "")}
            className={inputClass}
          >
            <option value="">Elige</option>
            <option value="femenil">
              Femenil · {VISORIA_EVENT.categories.femenil.years}
            </option>
            <option value="varonil">
              Varonil · {VISORIA_EVENT.categories.varonil.years}
            </option>
          </select>
        </div>
        <div>
          <label htmlFor="position" className="text-sm font-medium text-mf-text">
            Posición
          </label>
          <select
            id="position"
            value={position}
            onChange={(event) => setPosition(event.target.value as VisoriaPosition | "")}
            className={inputClass}
          >
            <option value="">Opcional</option>
            {VISORIA_POSITIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="club" className="text-sm font-medium text-mf-text">
            Club o escuela actual
          </label>
          <input
            id="club"
            value={club}
            onChange={(event) => setClub(event.target.value)}
            className={inputClass}
            placeholder="Si no tiene, escribe libre"
          />
        </div>
        <div>
          <label htmlFor="city" className="text-sm font-medium text-mf-text">
            Ciudad
          </label>
          <input
            id="city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          02 · Tutor
        </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="guardianName" className="text-sm font-medium text-mf-text">
            Padre, madre o tutor
          </label>
          <input
            id="guardianName"
            required
            value={guardianName}
            onChange={(event) => setGuardianName(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-mf-text">
            WhatsApp del tutor
          </label>
          <input
            id="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClass}
            placeholder="10 dígitos"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="email" className="text-sm font-medium text-mf-text">
            Correo (opcional)
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          03 · Jornada
        </p>
        <div className="space-y-3 rounded-lg bg-mf-canvas px-4 py-4">
        <p className="text-[11px] leading-4 text-mf-text-muted">
          Femenil y varonil. El día no depende de la categoría.
        </p>
        <label className="flex gap-3 text-sm text-mf-text-secondary">
          <input
            type="checkbox"
            checked={thursday}
            onChange={(event) => setThursday(event.target.checked)}
            className={checkClass}
          />
          <span>
            Jueves 26 · San Javier · abierta a todo público (9:00 a.m. a 2:00 p.m.)
          </span>
        </label>
        <label className="flex gap-3 text-sm text-mf-text-secondary">
          <input
            type="checkbox"
            checked={gphSelected}
            onChange={(event) => setGphSelected(event.target.checked)}
            className={checkClass}
          />
          <span>
            Soy seleccionado/a de GPH. Quiero la jornada del viernes 27 en Casa de la
            Juventud.
          </span>
        </label>
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-mf-canvas px-3 py-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            Privacidad
          </p>
          <Link
            href={LEGAL_ROUTES.privacy}
            className="text-[11px] text-mf-text-muted underline-offset-2 hover:underline"
          >
            Aviso integral
          </Link>
        </div>
        <p className="text-[11px] leading-4 text-mf-text-muted">{VISORIA_PRIVACY_SHORT}</p>
        <label className="flex gap-2 text-[11px] leading-4 text-mf-text-muted">
          <input
            type="checkbox"
            required
            checked={privacy}
            onChange={(event) => setPrivacy(event.target.checked)}
            className={consentCheck}
          />
          <span>
            Soy padre, madre o tutor y acepto el aviso de privacidad. Autorizo el
            tratamiento de los datos del menor para esta visoría.
          </span>
        </label>
        <label className="flex gap-2 text-[11px] leading-4 text-mf-text-muted">
          <input
            type="checkbox"
            required
            checked={clubsShare}
            onChange={(event) => setClubsShare(event.target.checked)}
            className={consentCheck}
          />
          <span>
            Autorizo que GPH/CRACKS compartan los datos con los clubes visores (Chivas y
            Santos Laguna, u otros de Primera División que se confirmen) solo para evaluar
            al jugador. Sin esto no hay inscripción.
          </span>
        </label>
        <label className="flex gap-2 text-[11px] leading-4 text-mf-text-muted">
          <input
            type="checkbox"
            required
            checked={imageRights}
            onChange={(event) => setImageRights(event.target.checked)}
            className={consentCheck}
          />
          <span>
            Autorizo fotos y video del evento, y que GPH y CRACKS los usen en sus redes
            para difundir las visorías. Puedo revocar esto escribiendo a privacidad@mificha.mx.
          </span>
        </label>
        <label className="flex gap-2 text-[11px] leading-4 text-mf-text-muted">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(event) => setMarketing(event.target.checked)}
            className={consentCheck}
          />
          <span>
            Opcional: avisos de otras convocatorias GPH y de MiFicha por WhatsApp o correo.
          </span>
        </label>
      </div>

      <div className="hidden" aria-hidden>
        <label>
          Empresa
          <input
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-lg bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">{error}</p>
      ) : null}

      <button type="submit" disabled={loading} className="mf-btn-gph w-full justify-center sm:w-auto">
        {loading ? "Guardando…" : "Enviar registro"}
      </button>
    </form>
  );
}
