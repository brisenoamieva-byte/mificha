import { ImageResponse } from "next/og";
import { OgBrandWordmark } from "@/components/ui/brand-wordmark";
import { buildOgTutorSharePayload } from "@/lib/og-tutor-share";
import { getTutorChildByShareToken } from "@/lib/tutor-family";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const alt = "Ficha tutor MiFicha";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Fallback() {
  return (
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
      <p style={{ fontSize: 36, margin: 0 }}>
        <OgBrandWordmark />
      </p>
      <p style={{ fontSize: 28, marginTop: 16, opacity: 0.75 }}>
        Ficha de presentación
      </p>
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let child = null;
  try {
    const admin = createSupabaseAdminClient();
    child = await getTutorChildByShareToken(admin, token);
  } catch {
    child = null;
  }

  if (!child) {
    return new ImageResponse(<Fallback />, size);
  }

  const payload = buildOgTutorSharePayload(child);

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
              <span style={{ fontSize: 24 }}>
                <OgBrandWordmark />
              </span>
              <span style={{ fontSize: 18, opacity: 0.65 }}>Ficha de presentación</span>
            </div>
          </div>
          <div
            style={{
              borderRadius: 999,
              border: "1px solid rgba(147, 197, 253, 0.45)",
              background: "rgba(147, 197, 253, 0.12)",
              padding: "10px 20px",
              fontSize: 18,
              fontWeight: 600,
              color: "#bfdbfe",
            }}
          >
            {payload.badge}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
            {payload.title}
          </div>
          <div style={{ fontSize: 26, opacity: 0.78 }}>{payload.subtitle}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 20, opacity: 0.7 }}>
            Lista para compartir con visorías y academias
          </div>
          {payload.publicCode ? (
            <div
              style={{
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(0,0,0,0.22)",
                padding: "14px 22px",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {payload.publicCode}
            </div>
          ) : null}
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
