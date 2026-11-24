import { ImageResponse } from "next/og";
import { peekTutorChildByShareToken } from "@/lib/tutor-family";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/** Tarjeta vertical 9:16 para Stories / Reels (no es OG horizontal). */
export const runtime = "nodejs";
export const preferredRegion = ["iad1", "sfo1"];

const size = { width: 1080, height: 1920 };

function BrandMark() {
  return (
    <span style={{ display: "flex", fontSize: 36 }}>
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
        padding: 72,
        background: "linear-gradient(165deg, #081221 0%, #0F2D52 45%, #1B4F8C 100%)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <BrandMark />
      <p style={{ fontSize: 36, marginTop: 24, opacity: 0.75 }}>Mi ficha</p>
    </div>
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
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

    const { buildOgTutorSharePayloadWithPhoto } = await import(
      "@/lib/og-tutor-share-image"
    );
    const payload = await buildOgTutorSharePayloadWithPhoto(admin, child);
    const chips = [
      payload.position,
      payload.category,
      payload.club,
      ...payload.detailChips,
    ].filter(Boolean) as string[];
    const hasPhoto = Boolean(payload.photoUrl);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background:
              "linear-gradient(165deg, #06101c 0%, #0F2D52 48%, #1B4F8C 100%)",
            color: "white",
            fontFamily: "system-ui, sans-serif",
            padding: 64,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <BrandMark />
            <div
              style={{
                borderRadius: 999,
                border: "1px solid rgba(167, 243, 208, 0.45)",
                background: "rgba(52, 211, 153, 0.14)",
                padding: "12px 22px",
                fontSize: 24,
                fontWeight: 700,
                color: "#A7F3D0",
              }}
            >
              Mi ficha
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 36,
              marginTop: 40,
              marginBottom: 40,
            }}
          >
            {hasPhoto ? (
              <div
                style={{
                  width: 520,
                  height: 650,
                  borderRadius: 36,
                  overflow: "hidden",
                  border: "3px solid rgba(255,255,255,0.18)",
                  display: "flex",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payload.photoUrl!}
                  width={520}
                  height={650}
                  alt=""
                  style={{
                    width: 520,
                    height: 650,
                    objectFit: "cover",
                    objectPosition: "center top",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: 40,
                  background: "rgba(52, 211, 153, 0.14)",
                  border: "2px solid rgba(52, 211, 153, 0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 96,
                  fontWeight: 700,
                  color: "#6EE7B7",
                }}
              >
                {payload.initials}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  lineHeight: 1.05,
                  textAlign: "center",
                }}
              >
                {payload.title}
              </div>
              {chips.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    justifyContent: "center",
                  }}
                >
                  {chips.slice(0, 4).map((chip) => (
                    <div
                      key={chip}
                      style={{
                        display: "flex",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "rgba(255,255,255,0.08)",
                        padding: "10px 20px",
                        fontSize: 26,
                        fontWeight: 600,
                      }}
                    >
                      {chip}
                    </div>
                  ))}
                </div>
              ) : null}
              {payload.statsLine ? (
                <div
                  style={{
                    display: "flex",
                    borderRadius: 20,
                    border: "1px solid rgba(52, 211, 153, 0.4)",
                    background: "rgba(52, 211, 153, 0.14)",
                    padding: "16px 28px",
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#A7F3D0",
                  }}
                >
                  {payload.statsLine}
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 26, opacity: 0.7 }}>mificha.mx</div>
              <div style={{ fontSize: 22, opacity: 0.55 }}>Ármate la tuya</div>
            </div>
            {payload.publicCode ? (
              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(0,0,0,0.28)",
                  padding: "16px 26px",
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
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
          "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
          "Content-Type": "image/png",
        },
      },
    );
  } catch {
    return new ImageResponse(<FallbackCard />, { ...size });
  }
}
