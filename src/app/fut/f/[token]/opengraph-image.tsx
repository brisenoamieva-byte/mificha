import { ImageResponse } from "next/og";
import { buildOgTutorSharePayloadWithPhoto } from "@/lib/og-tutor-share";
import { peekTutorChildByShareToken } from "@/lib/tutor-family";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/** sharp (reorientar EXIF) no corre en Edge. */
export const runtime = "nodejs";
export const alt = "Ficha del jugador MiFicha";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function BrandMark() {
  return (
    <span style={{ display: "flex", fontSize: 26 }}>
      <span style={{ fontWeight: 400 }}>Mi</span>
      <span style={{ fontWeight: 700 }}>Ficha</span>
    </span>
  );
}

function FallbackCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 64,
        background: "linear-gradient(145deg, #0a1628 0%, #0F2D52 48%, #1B4F8C 100%)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <BrandMark />
      <p style={{ fontSize: 28, marginTop: 16, opacity: 0.75 }}>
        Ficha de presentación
      </p>
    </div>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.08)",
        padding: "8px 16px",
        fontSize: 20,
        fontWeight: 600,
        color: "rgba(255,255,255,0.92)",
      }}
    >
      {children}
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  try {
    const { token } = await params;
    let child = null;
    let admin = null;
    try {
      admin = createSupabaseAdminClient();
      child = await peekTutorChildByShareToken(admin, token);
    } catch {
      child = null;
    }

    if (!child || !admin) {
      return new ImageResponse(<FallbackCard />, { ...size });
    }

    const payload = await buildOgTutorSharePayloadWithPhoto(admin, child);
    const chips = [payload.position, payload.category, payload.club].filter(
      Boolean,
    ) as string[];
    const hasPhoto = Boolean(payload.photoUrl);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(145deg, #081221 0%, #0F2D52 52%, #1B4F8C 100%)",
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              flex: hasPhoto ? 1.15 : 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 52,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <BrandMark />
                <span style={{ fontSize: 18, opacity: 0.62 }}>
                  Ficha de presentación
                </span>
              </div>
              <div
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(147, 197, 253, 0.4)",
                  background: "rgba(147, 197, 253, 0.12)",
                  padding: "10px 18px",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#bfdbfe",
                }}
              >
                {payload.badge}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: hasPhoto ? 52 : 58, fontWeight: 700, lineHeight: 1.05 }}>
                {payload.title}
              </div>
              {chips.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {chips.slice(0, 3).map((chip) => (
                    <Chip key={chip}>{chip}</Chip>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 24, opacity: 0.75 }}>{payload.subtitle}</div>
              )}
              {payload.city ? (
                <div style={{ fontSize: 22, opacity: 0.65 }}>{payload.city}</div>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div style={{ fontSize: 20, opacity: 0.68 }}>mificha.mx</div>
              {payload.publicCode ? (
                <div
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(0,0,0,0.22)",
                    padding: "12px 20px",
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {payload.publicCode}
                </div>
              ) : null}
            </div>
          </div>

          {hasPhoto ? (
            <div
              style={{
                width: 420,
                height: "100%",
                display: "flex",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payload.photoUrl!}
                width={420}
                height={630}
                alt=""
                style={{
                  width: 420,
                  height: 630,
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 48,
                  background:
                    "linear-gradient(90deg, rgba(15,45,82,0.95) 0%, rgba(15,45,82,0) 100%)",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 280,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.18)",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 28,
                  background: "rgba(52, 211, 153, 0.14)",
                  border: "1px solid rgba(52, 211, 153, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 56,
                  fontWeight: 700,
                  color: "#6EE7B7",
                }}
              >
                {payload.initials}
              </div>
            </div>
          )}
        </div>
      ),
      {
        ...size,
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return new ImageResponse(<FallbackCard />, { ...size });
  }
}
