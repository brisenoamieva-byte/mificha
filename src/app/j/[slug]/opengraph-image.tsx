import { ImageResponse } from "next/og";
import {
  buildOgPlayerSharePayload,
} from "@/lib/og-player-share";
import { fetchPublicPlayerBySlug } from "@/lib/public-player";

export const alt = "Ficha verificada MiFicha";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await fetchPublicPlayerBySlug(slug, { skipMediaSigning: true });

  if (!data) {
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
          <p style={{ fontSize: 28, marginTop: 16, opacity: 0.75 }}>
            Ficha técnica verificada
          </p>
        </div>
      ),
      size,
    );
  }

  const payload = buildOgPlayerSharePayload(data);

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
        }}
      >
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
              <span style={{ fontSize: 18, opacity: 0.65 }}>Ficha verificada</span>
            </div>
          </div>
          <div
            style={{
              borderRadius: 999,
              border: "1px solid rgba(52, 211, 153, 0.45)",
              background: "rgba(52, 211, 153, 0.12)",
              padding: "10px 20px",
              fontSize: 18,
              fontWeight: 600,
              color: "#6ee7b7",
            }}
          >
            Stats oficiales
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
            {payload.title}
          </div>
          <div style={{ fontSize: 26, opacity: 0.78 }}>
            {payload.academyName} · {payload.positionLabel}
            {payload.seasonName ? ` · ${payload.seasonName}` : ""}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 18, opacity: 0.6, textTransform: "uppercase" }}>
              Passport Score
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span
                style={{
                  fontSize: 88,
                  fontWeight: 800,
                  color: payload.passportAccent,
                  lineHeight: 1,
                }}
              >
                {payload.passportScore}
              </span>
              <span style={{ fontSize: 24, opacity: 0.75 }}>{payload.passportLabel}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 18, marginLeft: "auto" }}>
            {[
              { label: "PJ", value: payload.stats.matches },
              { label: "Goles", value: payload.stats.goals },
              { label: "Asist.", value: payload.stats.assists },
              { label: "Min", value: payload.stats.minutes },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  minWidth: 110,
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.22)",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 34, fontWeight: 700 }}>{stat.value}</span>
                <span style={{ fontSize: 16, opacity: 0.62 }}>{stat.label}</span>
              </div>
            ))}
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
