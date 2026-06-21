"use client";

import Link from "next/link";
import { Copy, Printer, Timer } from "lucide-react";
import { useState } from "react";
import { FichaDocument } from "@/components/ficha/ficha-document";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import { PlayerAchievementsShelf } from "@/components/public/player-achievements-shelf";
import { ProfileViewTracker } from "@/components/public/profile-view-tracker";
import { buildPublicFichaDocument } from "@/lib/ficha-document-model";
import type { PublicPlayerData } from "@/lib/public-player";
import { buildPublicPlayerUrl } from "@/lib/player-utils";

interface PublicPlayerCardProps {
  data: PublicPlayerData;
}

export function PublicPlayerCard({ data }: PublicPlayerCardProps) {
  const { player, history, achievements } = data;
  const [copied, setCopied] = useState(false);

  const model = buildPublicFichaDocument(data);
  const fullName = model.fullName;
  const publicUrl = buildPublicPlayerUrl(player.slug);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Mira la ficha de ${fullName}: ${publicUrl}`,
  )}`;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-mf-canvas px-4 py-8 sm:px-6">
      <ProfileViewTracker slug={player.slug} />
      <div className="mx-auto w-full max-w-[780px]">
        <div className="mb-5 flex justify-center">
          <BrandLogoLink size="sm" />
        </div>

        <FichaDocument model={model} priorityPhoto />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end print:hidden">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-mf-accent-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#047857] sm:flex-none sm:px-5"
          >
            Compartir por WhatsApp
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-4 py-2.5 text-sm font-semibold text-mf-text hover:bg-mf-canvas sm:flex-none sm:px-5"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Link copiado" : "Copiar link"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="demo-ficha-print-btn inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-4 py-2.5 text-sm font-semibold text-mf-brand hover:bg-mf-canvas sm:flex-none sm:px-5"
          >
            <Printer className="h-4 w-4" />
            Imprimir ficha
          </button>
        </div>

        <div className="print:hidden">
          <PlayerAchievementsShelf slug={player.slug} achievements={achievements} />

          {history.length > 0 ? (
            <section className="mt-6 rounded-xl border border-mf-border bg-white px-5 py-6 sm:px-6">
              <h2 className="text-lg font-semibold text-mf-text">Historial</h2>
              <div className="mt-5 space-y-5 border-l-2 border-mf-border pl-5">
                {history.map((item) => (
                  <div key={item.stats.id} className="relative">
                    <span className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full bg-mf-brand" />
                    <p className="font-semibold text-mf-text">{item.season_name}</p>
                    <p className="text-sm text-mf-text-secondary">{item.academy_name}</p>
                    <p className="mt-1.5 text-sm text-mf-text-secondary">
                      {item.stats.total_matches} partidos · {item.stats.total_goals} goles ·{" "}
                      {item.stats.total_assists} asistencias · {item.stats.total_minutes} min
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6 rounded-xl border border-mf-border bg-white px-5 py-6 sm:px-6">
            <h2 className="text-lg font-semibold text-mf-text">Video</h2>
            {player.video_url ? (
              <video
                controls
                className="mt-4 max-h-[400px] w-full rounded-xl bg-black"
                src={player.video_url}
              />
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-mf-border bg-mf-canvas px-6 py-10 text-center">
                <Timer className="mx-auto h-8 w-8 text-mf-text-muted/40" />
                <p className="mt-3 text-sm font-medium text-mf-text-secondary">
                  Próximamente video highlight
                </p>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-8 border-t border-mf-border pt-6 text-center print:hidden">
          <BrandLogoLink className="justify-center" size="sm" />
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-medium">
            <Link href="/padres" className="text-mf-brand hover:underline">
              ¿Eres padre?
            </Link>
            <Link href="/explorar" className="text-mf-brand hover:underline">
              Explorar directorio
            </Link>
          </div>
          <p className="mt-2 text-xs text-mf-text-muted">mificha.mx</p>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-mf-text-muted">
            Ficha compartida con autorización parental. Si deseas rectificar o eliminar estos
            datos, contacta a la academia.{" "}
            <Link href="/aviso-privacidad" className="text-mf-brand hover:underline">
              Privacidad
            </Link>
            {" · "}
            <Link href="/terminos" className="text-mf-brand hover:underline">
              Términos
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
