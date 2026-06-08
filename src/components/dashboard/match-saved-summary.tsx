"use client";

import Link from "next/link";
import { MessageCircle, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { AchievementBadge } from "@/components/ui/achievement-badge";
import { buildMatchRewardsWhatsAppMessage } from "@/lib/player-achievements";
import { buildPlayerShareUrl } from "@/lib/share-ficha";
import { cn } from "@/lib/utils";

export interface UnlockedAchievementSummary {
  key: string;
  title: string;
  description: string;
  rarity: string;
  emoji: string;
}

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
  unlocked_achievements: UnlockedAchievementSummary[];
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
  const totalUnlocked = players.reduce(
    (count, player) => count + player.unlocked_achievements.length,
    0,
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-emerald-500 p-2 text-white">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Recompensas desbloqueadas
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Partido guardado</h1>
            <p className="mt-2 text-slate-600">
              Stats vs {opponent}. Passport actualizado
              {totalUnlocked > 0
                ? ` · ${totalUnlocked} insignia${totalUnlocked === 1 ? "" : "s"} nueva${totalUnlocked === 1 ? "" : "s"}`
                : ""}
              .
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Comparte el logro con padres
        </h2>
        <p className="text-sm text-slate-600">
          Cada jugador puede presumir Passport e insignias verificadas por WhatsApp.
        </p>

        {players.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No marcaste jugadores en este partido.
          </p>
        ) : (
          players.map((player) => {
            const delta = player.passport_score - player.previous_passport_score;
            const fichaUrl = buildPlayerShareUrl(player.slug);
            const message = buildMatchRewardsWhatsAppMessage({
              firstName: player.first_name,
              lastName: player.last_name,
              opponent,
              goals: player.goals,
              assists: player.assists,
              minutes: player.minutes,
              passportScore: player.passport_score,
              previousPassportScore: player.previous_passport_score,
              fichaUrl,
              achievementKeys: player.unlocked_achievements.map((item) => item.key),
            });
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

            return (
              <div
                key={player.player_id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {player.goals}G · {player.assists}A · {player.minutes} min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="inline-flex items-center gap-1 text-sm font-medium text-[#1B4F8C]">
                        <TrendingUp className="h-4 w-4" />
                        Passport {player.passport_score}
                      </p>
                      {delta > 0 ? (
                        <p className="mt-1 text-lg font-bold text-mf-accent-dark">+{delta}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {player.unlocked_achievements.length > 0 ? (
                  <div className="space-y-3 px-4 py-4 sm:px-5">
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Nuevas insignias
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {player.unlocked_achievements.map((achievement) => (
                        <AchievementBadge
                          key={achievement.key}
                          achievementKey={achievement.key}
                          title={achievement.title}
                          description={achievement.description}
                          rarity={achievement.rarity as "common" | "rare" | "epic"}
                          emoji={achievement.emoji}
                          highlight
                          compact
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-4 text-sm text-slate-500 sm:px-5">
                    Sin insignias nuevas esta vez — el Passport igual subió con la captura.
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-4 sm:px-5">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mf-btn-accent-solid inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
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
                  {!player.is_public || !player.public_consent_at ? (
                    <p className="w-full text-xs text-amber-700">
                      Activa consentimiento y ficha pública en Plantel para que el link funcione.
                    </p>
                  ) : null}
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
