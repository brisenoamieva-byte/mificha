"use client";

import Link from "next/link";
import { MessageCircle, TrendingUp } from "lucide-react";
import { buildMatchUpdateWhatsAppMessage } from "@/lib/passport-score";
import { buildPlayerShareUrl } from "@/lib/share-ficha";
import { cn } from "@/lib/utils";

export interface SavedPlayerSummary {
  player_id: string;
  first_name: string;
  last_name: string;
  slug: string;
  goals: number;
  assists: number;
  minutes: number;
  passport_score: number;
  previous_passport_score: number;
  is_public: boolean;
  public_consent_at: string | null;
}

interface MatchSavedSummaryProps {
  opponent: string;
  players: SavedPlayerSummary[];
  onDone: () => void;
}

export function MatchSavedSummary({
  opponent,
  players,
  onDone,
}: MatchSavedSummaryProps) {
  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Partido guardado</h1>
        <p className="mt-2 text-slate-600">
          Stats registradas vs {opponent}. El Passport Score se recalculó
          automáticamente.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Avisar a padres por WhatsApp
        </h2>
        <p className="text-sm text-slate-600">
          Comparte la actualización del partido. El padre abre la ficha sin
          descargar nada.
        </p>

        {players.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No marcaste jugadores en este partido.
          </p>
        ) : (
          players.map((player) => {
            const delta = player.passport_score - player.previous_passport_score;
            const fichaUrl = buildPlayerShareUrl(player.slug);
            const message = buildMatchUpdateWhatsAppMessage({
              firstName: player.first_name,
              lastName: player.last_name,
              opponent,
              goals: player.goals,
              assists: player.assists,
              minutes: player.minutes,
              passportScore: player.passport_score,
              previousPassportScore: player.previous_passport_score,
              fichaUrl,
            });
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

            return (
              <div
                key={player.player_id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {player.goals}G · {player.assists}A · {player.minutes} min
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[#1B4F8C]">
                    <TrendingUp className="h-4 w-4" />
                    Passport {player.passport_score}
                    {delta > 0 ? (
                      <span className="text-green-600">(+{delta})</span>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <Link
                    href={`/j/${player.slug}`}
                    target="_blank"
                    className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Ver ficha
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={onDone}
        className={cn(
          "w-full rounded-2xl bg-[#1B4F8C] px-5 py-4 text-base font-semibold text-white hover:bg-[#164278]",
        )}
      >
        Listo · volver a partidos
      </button>
    </div>
  );
}
