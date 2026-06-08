"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Clock3,
  Copy,
  Goal,
  Handshake,
  MapPin,
  Shield,
  Timer,
  Trophy,
} from "lucide-react";
import QRCode from "react-qr-code";
import { useState } from "react";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import { calculateAge, getPositionLabel } from "@/lib/dashboard-utils";
import { PlayerCategoryBadge } from "@/components/ui/player-category-badge";
import type { PublicPlayerData } from "@/lib/public-player";
import { PublicPlayerProgressSection } from "@/components/public/public-player-progress-section";
import { PassportScoreDisplay } from "@/components/ui/passport-score-display";
import {
  buildPublicPlayerUrl,
  getDominantFootLabel,
  getPlayerInitials,
  getPositionBadgeClass,
} from "@/lib/player-utils";
import { cn } from "@/lib/utils";

interface PublicPlayerCardProps {
  data: PublicPlayerData;
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <Icon className="mx-auto h-5 w-5 text-[#1B4F8C]" />
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}

export function PublicPlayerCard({ data }: PublicPlayerCardProps) {
  const { player, currentSeasonStats, currentSeasonName, history, seasonProgress, seasonHighlights } = data;
  const [copied, setCopied] = useState(false);

  const fullName = `${player.first_name} ${player.last_name}`;
  const age = calculateAge(player.birth_date);
  const positionLabel = getPositionLabel(player.position);
  const publicUrl = buildPublicPlayerUrl(player.slug);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Mira la ficha de ${fullName}: ${publicUrl}`,
  )}`;

  const stats = currentSeasonStats ?? {
    total_matches: 0,
    total_goals: 0,
    total_assists: 0,
    total_minutes: 0,
    total_yellow_cards: 0,
    total_red_cards: 0,
  };

  async function handleCopyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B4F8C] to-[#0F2D52] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-[800px] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex justify-center border-b border-slate-100 px-6 py-4 sm:px-10">
          <BrandLogoLink size="sm" />
        </div>
        <section className="px-6 pb-8 pt-8 text-center sm:px-10">
          <div className="mx-auto flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg ring-4 ring-[#1B4F8C]/10">
            {player.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.photo_url}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-slate-500">
                {getPlayerInitials(player.first_name, player.last_name)}
              </span>
            )}
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {fullName}
          </h1>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <PlayerCategoryBadge birthDate={player.birth_date} />
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
              {age} años
            </span>
            {player.academies?.city ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                <MapPin className="h-3.5 w-3.5" />
                {player.academies.city}
              </span>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium",
                getPositionBadgeClass(player.position),
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              {positionLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
              Pie {getDominantFootLabel(player.dominant_foot).toLowerCase()}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1B4F8C]/10 px-4 py-2 text-sm font-medium text-[#1B4F8C]">
              {player.academies?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={player.academies.logo_url}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : null}
              Academia: {player.academies?.name ?? "MiFicha"}
            </span>
            {player.is_public ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                <BadgeCheck className="h-4 w-4" />
                Ficha verificada
              </span>
            ) : null}
          </div>
        </section>

        <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
          <h2 className="text-center text-lg font-semibold text-slate-900">
            Tu progreso
          </h2>
          <div className="mt-6 flex justify-center">
            <PassportScoreDisplay
              score={player.passport_score}
              variant="hero"
              scoreLabel="Progreso verificado"
            />
          </div>
          <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-6 text-slate-500">
            Participación y rendimiento registrados por tu academia. Crece partido
            a partido — no es una calificación escolar.
          </p>
        </section>

        <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Temporada actual
            </h2>
            {currentSeasonName ? (
              <span className="text-sm text-slate-500">{currentSeasonName}</span>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile icon={Trophy} label="Partidos" value={stats.total_matches} />
            <StatTile icon={Goal} label="Goles" value={stats.total_goals} />
            <StatTile icon={Handshake} label="Asistencias" value={stats.total_assists} />
            <StatTile icon={Clock3} label="Minutos" value={stats.total_minutes} />
          </div>

          {stats.total_yellow_cards > 0 || stats.total_red_cards > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {stats.total_yellow_cards > 0 ? (
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800">
                  🟨 {stats.total_yellow_cards} amarilla
                  {stats.total_yellow_cards === 1 ? "" : "s"}
                </span>
              ) : null}
              {stats.total_red_cards > 0 ? (
                <span className="rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700">
                  🟥 {stats.total_red_cards} roja
                  {stats.total_red_cards === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          ) : null}
        </section>

        <PublicPlayerProgressSection
          seasonName={currentSeasonName}
          progress={seasonProgress}
          highlights={seasonHighlights}
        />

        {history.length > 0 ? (
          <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
            <h2 className="text-lg font-semibold text-slate-900">Historial</h2>
            <div className="mt-6 space-y-6 border-l-2 border-slate-200 pl-6">
              {history.map((item) => (
                <div key={item.stats.id} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[#1B4F8C]" />
                  <p className="font-semibold text-slate-900">{item.season_name}</p>
                  <p className="text-sm text-slate-500">{item.academy_name}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {item.stats.total_matches} partidos · {item.stats.total_goals} goles ·{" "}
                    {item.stats.total_assists} asistencias · {item.stats.total_minutes} min
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
          <h2 className="text-lg font-semibold text-slate-900">Video</h2>
          {player.video_url ? (
            <video
              controls
              className="mt-4 max-h-[400px] w-full rounded-2xl bg-black"
              src={player.video_url}
            />
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <Timer className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                Próximamente video highlight
              </p>
            </div>
          )}
        </section>

        <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
          <h2 className="text-center text-lg font-semibold text-slate-900">
            Compartir ficha
          </h2>
          <div className="mx-auto mt-6 flex max-w-[220px] justify-center rounded-2xl bg-white p-4 shadow-inner ring-1 ring-slate-100">
            <QRCode value={publicUrl} size={180} />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-mf-accent-dark px-4 py-3 text-sm font-semibold text-white hover:bg-[#047857]"
            >
              Compartir en WhatsApp
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Link copiado" : "Copiar link"}
            </button>
          </div>
        </section>

        <footer className="border-t border-slate-100 bg-slate-50 px-6 py-5 text-center sm:px-10">
          <BrandLogoLink className="justify-center" size="sm" />
          <p className="mt-2 text-xs text-slate-400">mificha.mx</p>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-slate-400">
            Ficha compartida con autorización parental. Si deseas rectificar o
            eliminar estos datos, contacta a la academia.{" "}
            <Link href="/aviso-privacidad" className="text-[#1B4F8C] hover:underline">
              Privacidad
            </Link>
            {" · "}
            <Link href="/terminos" className="text-[#1B4F8C] hover:underline">
              Términos
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
