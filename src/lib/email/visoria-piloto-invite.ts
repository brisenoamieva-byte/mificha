import {
  BRAND_WHATSAPP_DISPLAY,
  BRAND_WHATSAPP_E164,
  getBrandIconUrl,
} from "@/lib/brand";

export const VISORIA_PILOTO_WHATSAPP_DISPLAY = BRAND_WHATSAPP_DISPLAY;
export const VISORIA_PILOTO_WHATSAPP_E164 = BRAND_WHATSAPP_E164;
export const VISORIA_PILOTO_CAMPAIGN = "piloto10";

export type VisoriaPilotoInviteInput = {
  tutorFirstName: string;
  playerName: string;
  ctaHref?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function visoriaPilotoInviteSubject(playerName: string) {
  const player = playerName.trim() || "tu hijo";
  return `Tu registro en la visoría · ficha de ${player} en MiFicha`;
}

export function visoriaPilotoInviteHref() {
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.mificha.mx";
  const params = new URLSearchParams({
    utm_source: "visoria",
    utm_medium: "email",
    utm_campaign: VISORIA_PILOTO_CAMPAIGN,
  });
  return `${origin}/fut/tutor?${params.toString()}`;
}

export function buildVisoriaPilotoInviteHtml(input: VisoriaPilotoInviteInput) {
  const name = escapeHtml(input.tutorFirstName.trim() || "hola");
  const player = escapeHtml(input.playerName.trim() || "tu hijo");
  const ctaHref = escapeHtml(input.ctaHref ?? visoriaPilotoInviteHref());
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.mificha.mx";
  const iconUrl = getBrandIconUrl(appUrl);
  const waHref = `https://wa.me/${VISORIA_PILOTO_WHATSAPP_E164}`;

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(visoriaPilotoInviteSubject(input.playerName))}</title>
  </head>
  <body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Piloto gratuito · arma la ficha de ${player} en ~5 minutos
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(15,45,82,0.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#1B4F8C 0%,#0F2D52 100%);padding:28px 28px 24px;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#ffffff;border-radius:12px;padding:10px 14px;vertical-align:middle;">
                      <img src="${iconUrl}" alt="MiFicha" width="32" height="32" style="display:block;width:32px;height:32px;" />
                    </td>
                    <td style="padding-left:14px;vertical-align:middle;">
                      <div style="font-size:20px;line-height:1.1;color:#ffffff;">
                        <span style="font-weight:400;">Mi</span><span style="font-weight:700;">Ficha</span>
                      </div>
                      <div style="margin-top:6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.72);">
                        Piloto · familias de visoría
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#0f172a;">Hola ${name},</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
                  Te escribo porque registraste a <strong style="color:#0f172a;">${player}</strong>
                  en la visoría GPH/CRACKS.
                </p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
                  En <strong style="color:#0f172a;">MiFicha</strong> puedes armar su ficha digital
                  (foto, historia y torneos) y compartir un link con clubes o agentes.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 8px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1B4F8C;margin-bottom:10px;">
                        En ~5 minutos
                      </div>
                      <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#334155;">• Crear la ficha de ${player}</p>
                      <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#334155;">• Subir foto o video y copiar el link</p>
                      <p style="margin:0;font-size:14px;line-height:1.5;color:#334155;">• Quedar listo para próximas visorías</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 8px;">
                <p style="margin:0;font-size:14px;line-height:1.55;color:#475569;">
                  Estamos en <strong style="color:#0f172a;">etapa piloto</strong> con familias de las visorías;
                  <strong style="color:#0f172a;">por ahora el acceso es gratuito</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 28px 8px;">
                <a href="${ctaHref}" style="display:inline-block;background:#1B4F8C;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:12px;">
                  Crear ficha de ${player}
                </a>
                <p style="margin:14px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">
                  Si te trabas al entrar, respóndeme o escríbeme por WhatsApp
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;">
                <p style="margin:0 0 4px;font-size:14px;line-height:1.5;color:#334155;">
                  Saludos,<br />
                  <strong style="color:#0f172a;">Ricardo</strong><br />
                  MiFicha · GPH
                </p>
                <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
                  WhatsApp:
                  <a href="${waHref}" style="color:#1B4F8C;text-decoration:none;font-weight:600;">${VISORIA_PILOTO_WHATSAPP_DISPLAY}</a>
                  ·
                  <a href="mailto:hola@mificha.mx" style="color:#1B4F8C;text-decoration:none;font-weight:600;">hola@mificha.mx</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;">
                <p style="margin:0;font-size:11px;line-height:1.55;color:#94a3b8;">
                  Recibes este correo porque te registraste en una visoría GPH/CRACKS organizada con MiFicha.
                  Si no deseas más mensajes sobre el piloto, responde “no gracias”.
                  ·
                  <a href="${escapeHtml(appUrl)}" style="color:#64748b;">mificha.mx</a>
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

export function buildVisoriaPilotoInviteText(input: VisoriaPilotoInviteInput) {
  const name = input.tutorFirstName.trim() || "hola";
  const player = input.playerName.trim() || "tu hijo";
  const ctaHref = input.ctaHref ?? visoriaPilotoInviteHref();
  return `Hola ${name},

Te escribo porque registraste a ${player} en la visoría GPH/CRACKS.

En MiFicha puedes armar su ficha digital (foto, historia y torneos) y compartir un link con clubes o agentes.

Estamos en etapa piloto con familias de las visorías; por ahora el acceso es gratuito.

Crear ficha: ${ctaHref}

Saludos,
Ricardo
MiFicha · GPH
WhatsApp ${VISORIA_PILOTO_WHATSAPP_DISPLAY} · hola@mificha.mx`;
}
