import { Resend } from "resend";
import { getResendFromEmail } from "@/lib/email/resend-config";
import type { GphAgreement } from "@/lib/gph-agreements";

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

async function sendSimple(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey || resendKey === "re_...") {
    return { ok: false as const, skipped: "RESEND_API_KEY" };
  }
  const from = getResendFromEmail() || "MiFicha <hola@mificha.mx>";
  try {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      replyTo: "hola@mificha.mx",
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "send_failed",
    };
  }
}

export async function notifyTutorAgreementSent(agreement: GphAgreement) {
  const to = agreement.fields.guardian_email?.trim();
  if (!to) return { ok: false as const, skipped: "no_email" };
  const href = `${appBase()}/fut/tutor/acuerdo/${agreement.id}`;
  const subject = `Firma el reglamento GPH de ${agreement.fields.player_name}`;
  const text = `Hola ${agreement.fields.guardian_name || ""},

GPH Performance Hub te envió el Reglamento y Carta Compromiso de ${agreement.fields.player_name} para firmar en línea.

Ábrelo aquí: ${href}

MiFicha · GPH`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1B4F8C;">MiFicha · GPH</p>
      <h1 style="margin:0 0 12px;font-size:20px;">Firma el reglamento de ${escapeHtml(agreement.fields.player_name)}</h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#334155;">
        GPH Performance Hub te envió la Carta Compromiso para leerla y aceptarla en línea.
      </p>
      <a href="${href}" style="display:inline-block;background:#1B4F8C;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;">Abrir y firmar</a>
    </div>`;
  return sendSimple({ to, subject, text, html });
}

export async function notifyGphAgreementSigned(agreement: GphAgreement) {
  const to = "gkperformancehub@gmail.com";
  const href = `${appBase()}/fut/dashboard/cartas?id=${agreement.id}`;
  const subject = `Tutor firmó: ${agreement.fields.player_name}`;
  const text = `El tutor ${agreement.tutor_evidence?.acceptor_name || ""} firmó la carta de ${agreement.fields.player_name}.

Contrafirma aquí: ${href}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
      <h1 style="margin:0 0 12px;font-size:20px;">Tutor firmó la carta</h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.55;">${escapeHtml(agreement.fields.player_name)} · ${escapeHtml(agreement.tutor_evidence?.acceptor_name || "")}</p>
      <a href="${href}" style="display:inline-block;background:#1B4F8C;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;">Contrafirmar en MiFicha</a>
    </div>`;
  return sendSimple({ to, subject, text, html });
}

export async function notifyAgreementActive(agreement: GphAgreement) {
  const to = agreement.fields.guardian_email?.trim();
  if (!to) return { ok: false as const, skipped: "no_email" };
  const href = `${appBase()}/fut/tutor/acuerdo/${agreement.id}`;
  const subject = `Carta GPH activa · ${agreement.fields.player_name}`;
  const text = `La Carta Compromiso de ${agreement.fields.player_name} ya está activa (firmada por tutor y GPH).

Descárgala en: ${href}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
      <h1 style="margin:0 0 12px;font-size:20px;">Carta activa</h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.55;">El reglamento de ${escapeHtml(agreement.fields.player_name)} quedó firmado por ambas partes.</p>
      <a href="${href}" style="display:inline-block;background:#1B4F8C;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;">Ver / descargar PDF</a>
    </div>`;
  return sendSimple({ to, subject, text, html });
}
