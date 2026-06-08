import { ImageResponse } from "next/og";
import {
  buildOgAchievementSharePayload,
} from "@/lib/og-achievement-share";
import { getAchievementDefinition } from "@/lib/player-achievements";
import { fetchPublicPlayerBySlug } from "@/lib/public-player";

export const alt = "Insignia verificada MiFicha";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; key: string }>;
}) {
  const { slug, key } = await params;
  const achievement = getAchievementDefinition(key);

  if (!achievement) {
    return fallbackImage("Logro no disponible");
  }

  const data = await fetchPublicPlayerBySlug(slug, { skipMediaSigning: true });
  if (!data) {
    return fallbackImage("Ficha no disponible");
  }

  const payload = buildOgAchievementSharePayload(data, key);
  if (!payload) {
    return fallbackImage("Logro no disponible");
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(135deg, #0a1628 0%, #123d72 55%, #1B4F8C 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 120,
            right: -40,
            width: 280,
            height: 280,
            borderRadius: 999,
            background: payload.accent,
            opacity: 0.18,
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {payload.initials}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 24, fontWeight: 700 }}>MiFicha</span>
              <span style={{ fontSize: 18, opacity: 0.65 }}>{payload.badgeLabel}</span>
            </div>
          </div>
          <div
            style={{
              borderRadius: 999,
              border: `1px solid ${payload.accent}`,
              background: "rgba(255,255,255,0.08)",
              padding: "10px 20px",
              fontSize: 18,
              fontWeight: 600,
              color: payload.accent,
            }}
          >
            Stats oficiales
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 32,
              border: `3px solid ${payload.accent}`,
              background: "rgba(0,0,0,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              boxShadow: `0 0 60px ${payload.accent}55`,
            }}
          >
            {payload.emoji}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05 }}>
              {payload.achievementTitle}
            </div>
            <div style={{ fontSize: 26, opacity: 0.78, lineHeight: 1.35 }}>
              {payload.achievementDescription}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 18, opacity: 0.6, textTransform: "uppercase" }}>
              Jugador
            </span>
            <span style={{ fontSize: 34, fontWeight: 700 }}>{payload.playerTitle}</span>
            <span style={{ fontSize: 22, opacity: 0.72 }}>{payload.academyName}</span>
          </div>
          <div
            style={{
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.22)",
              padding: "16px 24px",
              fontSize: 20,
              fontWeight: 600,
              opacity: 0.85,
            }}
          >
            mificha.mx
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}

function fallbackImage(message: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #0a1628 0%, #1B4F8C 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>MiFicha</p>
        <p style={{ fontSize: 28, marginTop: 16, opacity: 0.75 }}>{message}</p>
      </div>
    ),
    size,
  );
}
