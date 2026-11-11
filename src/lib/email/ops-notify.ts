import { Resend } from "resend";
import { getResendFromEmail } from "@/lib/email/resend-config";

const DEFAULT_OPS_EMAIL = "brisenoamieva@gmail.com";

export type OpsNotifyKind =
  | "tutor_signup"
  | "academy_created"
  | "diagnosis_paid";

export function getOpsNotifyEmail() {
  const fromEnv = process.env.OPS_NOTIFY_EMAIL?.trim().toLowerCase();
  return fromEnv || DEFAULT_OPS_EMAIL;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Aviso interno a Ricardo. Nunca bloquea el flujo del usuario.
 */
export async function notifyOps(input: {
  kind: OpsNotifyKind;
  subject: string;
  lines: Array<[string, string | null | undefined]>;
}): Promise<{ ok: boolean; skipped?: string; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey || resendKey === "re_...") {
    return { ok: false, skipped: "RESEND_API_KEY" };
  }

  const from = getResendFromEmail() || "MiFicha <notificaciones@mificha.mx>";
  const to = getOpsNotifyEmail();
  const rows = input.lines.filter(([, value]) => Boolean(value?.trim()));
  const text = [
    input.subject,
    "",
    ...rows.map(([label, value]) => `${label}: ${value!.trim()}`),
    "",
    `Evento: ${input.kind}`,
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:4px 0;color:#0f172a;font-weight:600;">${escapeHtml(value!.trim())}</td></tr>`,
    )
    .join("");

  try {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: input.subject,
      text,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1B4F8C;">MiFicha · aviso</p>
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;">${escapeHtml(input.subject)}</h1>
          <table style="border-collapse:collapse;font-size:14px;line-height:1.45;">${htmlRows}</table>
        </div>
      `,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "send_failed",
    };
  }
}

export function fireAndForgetOpsNotify(
  input: Parameters<typeof notifyOps>[0],
) {
  void notifyOps(input).catch(() => {
    /* never throw into request */
  });
}
