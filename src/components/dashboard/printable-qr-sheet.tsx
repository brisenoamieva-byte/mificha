"use client";

import QRCode from "react-qr-code";
import { PlayerCategoryBadge } from "@/components/ui/player-category-badge";
import { getPositionLabel } from "@/lib/dashboard-utils";
import { buildPlayerShareUrl } from "@/lib/share-ficha";
import { getPlayerInitials } from "@/lib/player-utils";
import type { Academy, Player } from "@/types/database";

interface PrintableQrSheetProps {
  academy: Academy;
  players: Player[];
}

export function PrintableQrSheet({ academy, players }: PrintableQrSheetProps) {
  return (
    <div className="printable-qr-sheet bg-white text-slate-900">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-qr-sheet {
            padding: 0;
          }
          .qr-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B4F8C]">
          MiFicha · Fichas del plantel
        </p>
        <h1 className="mt-2 text-2xl font-bold">{academy.name}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Escanea en la cancha · stats verificados · sin app para padres
        </p>
      </header>

      {players.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay jugadores con ficha pública y consentimiento para imprimir.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => {
            const url = buildPlayerShareUrl(player.slug);

            return (
              <article
                key={player.id}
                className="qr-card rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-start gap-3">
                  {player.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={player.photo_url}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
                      {getPlayerInitials(player.first_name, player.last_name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getPositionLabel(player.position)}
                    </p>
                    <div className="mt-1">
                      <PlayerCategoryBadge birthDate={player.birth_date} compact />
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-4 flex w-[140px] justify-center rounded-xl bg-white p-2 ring-1 ring-slate-100">
                  <QRCode value={url} size={120} />
                </div>

                <p className="mt-3 break-all text-center text-[10px] text-slate-500">
                  {url.replace(/^https?:\/\//, "")}
                </p>
                <p className="mt-2 text-center text-xs font-medium text-[#1B4F8C]">
                  Passport {player.passport_score}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
