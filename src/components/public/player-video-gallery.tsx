"use client";

import { Film } from "lucide-react";
import type { PublicPlayerVideo } from "@/lib/public-player";

interface PlayerVideoGalleryProps {
  primaryVideoUrl: string | null;
  clips: PublicPlayerVideo[];
  playerName: string;
}

export function PlayerVideoGallery({
  primaryVideoUrl,
  clips,
  playerName,
}: PlayerVideoGalleryProps) {
  const items: Array<{ id: string; title: string; url: string }> = [];

  if (primaryVideoUrl) {
    items.push({
      id: "primary",
      title: "Highlight principal",
      url: primaryVideoUrl,
    });
  }

  for (const clip of clips) {
    if (clip.video_url === primaryVideoUrl) continue;
    items.push({
      id: clip.id,
      title: clip.title,
      url: clip.video_url,
    });
  }

  if (items.length === 0) {
    return (
      <section className="mt-6 rounded-xl border border-mf-border bg-white px-5 py-6 sm:px-6">
        <h2 className="text-lg font-semibold text-mf-text">Videos</h2>
        <div className="mt-4 rounded-xl border border-dashed border-mf-border bg-mf-canvas px-6 py-10 text-center">
          <Film className="mx-auto h-8 w-8 text-mf-text-muted/40" />
          <p className="mt-3 text-sm font-medium text-mf-text-secondary">
            La academia aún no ha publicado video de {playerName}.
          </p>
          <p className="mt-1 text-xs text-mf-text-muted">
            Los clips aparecen aquí cuando la escuela los sube con consentimiento parental.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-xl border border-mf-border bg-white px-5 py-6 sm:px-6">
      <h2 className="text-lg font-semibold text-mf-text">
        Videos {items.length > 1 ? `(${items.length})` : ""}
      </h2>
      <p className="mt-1 text-sm text-mf-text-secondary">
        Material promocional verificado por la academia — visible para padres y visores.
      </p>
      <div className="mt-4 space-y-5">
        {items.map((item) => (
          <div key={item.id}>
            <p className="text-sm font-semibold text-mf-text">{item.title}</p>
            <video
              controls
              playsInline
              preload="metadata"
              className="mt-2 max-h-[420px] w-full rounded-xl bg-black"
              src={item.url}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
