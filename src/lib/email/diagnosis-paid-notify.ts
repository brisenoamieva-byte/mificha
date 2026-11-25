import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getResendFromEmail } from "@/lib/email/resend-config";
import {
  formatMxn,
  GPH_ANNUAL_PASS,
  type FamilyOrderRow,
} from "@/lib/gph-commerce";
import { patchFamilyOrder } from "@/lib/family-orders";
import {
  buildGphAnnualPassPdfBytes,
  gphAnnualPassFilename,
} from "@/lib/gph-annual-pass-pdf";

const PASS_EMAIL_SENT = "pass_email_sent";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appBase() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.mificha.mx").replace(
    /\/$/,
    "",
  );
}

function alreadySent(order: FamilyOrderRow) {
  return String(order.notes ?? "").includes(PASS_EMAIL_SENT);
}

/**
 * Confirmación al tutor/pagador: PDF del Pase Anual GPH + CRACKS 2027.
 * Solo invocar desde rutas de servidor (webhook / retorno de pago).
 */
export async function notifyDiagnosisPaidWithPass(
  admin: SupabaseClient,
  order: FamilyOrderRow,
) {
  if (order.sku !== "diagnosis") {
    return { ok: false as const, skipped: "not_diagnosis" as const };
  }
  if (alreadySent(order)) {
    return { ok: false as const, skipped: "already_sent" as const };
  }

  const to = order.payer_email?.trim();
  if (!to) return { ok: false as const, skipped: "no_email" as const };

  const playerName = (order.player_name || order.payer_name || "Jugador").trim();
  const paidAt = order.paid_at || order.created_at;
  const pdfBytes = await buildGphAnnualPassPdfBytes({
    playerName,
    folio: order.folio,
    paidAtIso: paidAt,
    amountMxn: order.amount_mxn,
    issuedAtIso: new Date().toISOString(),
  });

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey || resendKey === "re_...") {
    return { ok: false as const, skipped: "RESEND_API_KEY" as const };
  }

  const from = getResendFromEmail() || "MiFicha <hola@mificha.mx>";
  const filename = gphAnnualPassFilename(order.folio);
  const evaluationsHref = `${appBase()}/fut/evaluaciones`;
  const subject = `Pago confirmado · ${GPH_ANNUAL_PASS.title} · ${order.folio}`;
  const benefitsText = GPH_ANNUAL_PASS.benefits.map((b) => `· ${b}`).join("\n");
  const text = `Hola ${order.payer_name},

Confirmamos tu pago del ${GPH_ANNUAL_PASS.title}.

Jugador: ${playerName}
Folio: ${order.folio}
Importe: ${formatMxn(order.amount_mxn)}

Beneficios incluidos:
${benefitsText}

Adjuntamos tu certificado formal 2027 (PDF).
Agenda el diagnóstico: ${GPH_ANNUAL_PASS.schedulePhoneDisplay} (cita previa obligatoria).

Más info: ${evaluationsHref}

MiFicha · GPH`;

  const benefitsHtml = GPH_ANNUAL_PASS.benefits
    .map((b) => `<li style="margin:0 0 6px;">${escapeHtml(b)}</li>`)
    .join("");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1B4F8C;">MiFicha · GPH</p>
      <h1 style="margin:0 0 12px;font-size:20px;">Pago confirmado</h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#334155;">
        Tu <strong>${escapeHtml(GPH_ANNUAL_PASS.title)}</strong> para
        <strong>${escapeHtml(playerName)}</strong> ya está activo.
      </p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#334155;">
        Folio <strong>${escapeHtml(order.folio)}</strong> ·
        ${escapeHtml(formatMxn(order.amount_mxn))}
      </p>
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0f172a;">Incluye:</p>
      <ul style="margin:0 0 16px;padding-left:18px;font-size:14px;line-height:1.5;color:#334155;">
        ${benefitsHtml}
      </ul>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#334155;">
        Adjuntamos el <strong>certificado formal PDF</strong> del Pase Anual 2027.
      </p>
      <p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#64748b;">
        Agenda tu diagnóstico: <strong>${escapeHtml(GPH_ANNUAL_PASS.schedulePhoneDisplay)}</strong> · cita previa obligatoria.
      </p>
      <a href="${evaluationsHref}" style="display:inline-block;background:#1B4F8C;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;">Ver Pase Anual</a>
    </div>`;

  try {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: "hola@mificha.mx",
      subject,
      text,
      html,
      attachments: [
        {
          filename,
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ],
    });
    if (error) return { ok: false as const, error: error.message };

    const nextNotes = [order.notes, PASS_EMAIL_SENT].filter(Boolean).join(" | ");
    await patchFamilyOrder(admin, order.folio, { notes: nextNotes });
    return { ok: true as const, filename };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "send_failed",
    };
  }
}

export function fireAndForgetDiagnosisPassEmail(
  admin: SupabaseClient,
  order: FamilyOrderRow | null | undefined,
) {
  if (!order || order.sku !== "diagnosis") return;
  void notifyDiagnosisPaidWithPass(admin, order).catch((error) => {
    console.error(
      "[diagnosis-pass-email]",
      error instanceof Error ? error.message : error,
    );
  });
}
