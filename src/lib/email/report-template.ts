import { buildPublicPlayerUrl } from "@/lib/player-utils";
import {
  getPassportBarColor,
  getReportSubject,
} from "@/lib/email/report-utils";
import type { PlayerSeasonStat } from "@/types/database";

export interface ReportEmailData {
  playerFirstName: string;
  playerLastName: string;
  playerPhotoUrl: string | null;
  playerSlug: string;
  passportScore: number;
  seasonName: string;
  stats: Pick<
    PlayerSeasonStat,
    | "total_matches"
    | "total_goals"
    | "total_assists"
    | "total_minutes"
    | "total_yellow_cards"
    | "total_red_cards"
  >;
  academyName: string;
}

function statCard(label: string, value: number, accent: string) {
  return `
    <td width="33%" style="padding:6px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
        <tr>
          <td align="center" style="padding:18px 12px;">
            <div style="font-size:28px;font-weight:700;color:${accent};line-height:1;">${value}</div>
            <div style="margin-top:8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">${label}</div>
          </td>
        </tr>
      </table>
    </td>
  `;
}

export function buildReportEmailHtml(data: ReportEmailData) {
  const fullName = `${data.playerFirstName} ${data.playerLastName}`;
  const profileUrl = buildPublicPlayerUrl(data.playerSlug);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://mificha.mx";
  const score = Math.min(Math.max(data.passportScore, 0), 100);
  const barColor = getPassportBarColor(score);
  const photoBlock = data.playerPhotoUrl
    ? `<img src="${data.playerPhotoUrl}" alt="${fullName}" width="120" height="120" style="display:block;width:120px;height:120px;border-radius:999px;object-fit:cover;border:4px solid #ffffff;box-shadow:0 8px 24px rgba(15,45,82,0.18);" />`
    : `<div style="width:120px;height:120px;border-radius:999px;background:#e2e8f0;color:#475569;font-size:36px;font-weight:700;line-height:120px;text-align:center;border:4px solid #ffffff;">${data.playerFirstName[0] ?? ""}${data.playerLastName[0] ?? ""}</div>`;

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${getReportSubject(fullName, data.seasonName)}</title>
  </head>
  <body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(15,45,82,0.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#1B4F8C 0%,#0F2D52 100%);padding:28px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.16);color:#ffffff;font-size:16px;font-weight:800;text-align:center;line-height:42px;">MF</td>
                          <td style="padding-left:12px;">
                            <div style="font-size:22px;font-weight:800;color:#ffffff;line-height:1.1;">MiFicha</div>
                            <div style="margin-top:4px;font-size:12px;color:rgba(255,255,255,0.78);letter-spacing:0.04em;text-transform:uppercase;">Reporte mensual · ${data.academyName}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 32px 12px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1B4F8C;">Temporada ${data.seasonName}</p>
                <h1 style="margin:0;font-size:28px;line-height:1.25;color:#0f172a;">Hola, te enviamos el reporte mensual de ${data.playerFirstName}</h1>
                <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#475569;">
                  Este resumen recopila el rendimiento verificado de <strong>${fullName}</strong> durante la temporada actual.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:12px 32px 8px;">
                ${photoBlock}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 32px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    ${statCard("Partidos", data.stats.total_matches, "#1B4F8C")}
                    ${statCard("Goles", data.stats.total_goals, "#15803d")}
                    ${statCard("Asistencias", data.stats.total_assists, "#b45309")}
                  </tr>
                  <tr>
                    ${statCard("Minutos", data.stats.total_minutes, "#334155")}
                    ${statCard("Amarillas", data.stats.total_yellow_cards, "#ca8a04")}
                    ${statCard("Rojas", data.stats.total_red_cards, "#dc2626")}
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
                  <tr>
                    <td style="padding:20px 22px;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">Passport Score</div>
                      <div style="margin-top:10px;height:12px;background:#e2e8f0;border-radius:999px;overflow:hidden;">
                        <div style="width:${score}%;height:12px;background:${barColor};border-radius:999px;"></div>
                      </div>
                      <div style="margin-top:10px;font-size:24px;font-weight:800;color:${barColor};">${score}<span style="font-size:14px;color:#64748b;font-weight:600;"> / 100</span></div>
                      <div style="margin-top:6px;font-size:13px;color:#64748b;">Basado en stats verificados por la academia</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:0 32px 32px;">
                <a href="${profileUrl}" style="display:inline-block;background:#1B4F8C;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 28px;border-radius:14px;">
                  Ver ficha completa
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;">
                  MiFicha · La ficha técnica digital de tu hijo · <a href="${appUrl}" style="color:#1B4F8C;text-decoration:none;font-weight:700;">mificha.mx</a>
                </p>
                <p style="margin:12px 0 0;font-size:11px;line-height:1.5;color:#94a3b8;text-align:center;">
                  <a href="${appUrl}/unsubscribe" style="color:#94a3b8;text-decoration:underline;">Cancelar suscripción</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildReportEmailText(data: ReportEmailData) {
  const fullName = `${data.playerFirstName} ${data.playerLastName}`;
  const profileUrl = buildPublicPlayerUrl(data.playerSlug);

  return [
    `Hola, te enviamos el reporte mensual de ${data.playerFirstName}`,
    "",
    `${fullName} · ${data.seasonName}`,
    `Partidos: ${data.stats.total_matches}`,
    `Goles: ${data.stats.total_goals}`,
    `Asistencias: ${data.stats.total_assists}`,
    `Minutos: ${data.stats.total_minutes}`,
    `Tarjetas: ${data.stats.total_yellow_cards} amarillas, ${data.stats.total_red_cards} rojas`,
    `Passport Score: ${data.passportScore}`,
    "",
    `Ver ficha completa: ${profileUrl}`,
    "",
    "MiFicha · La ficha técnica digital de tu hijo · mificha.mx",
  ].join("\n");
}
