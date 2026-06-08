export function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() ?? "";
}

export function isResendProductionReady() {
  const from = getResendFromEmail();

  if (!from) return false;
  if (from.includes("onboarding@resend.dev")) return false;
  if (from.includes("@resend.dev")) return false;

  return true;
}

export const RESEND_NOT_READY_HINT =
  "Los reportes por email requieren dominio verificado en Resend. Los avisos post-partido y el link de bienvenida funcionan desde Plantel → Avisos a tutores (email o WhatsApp automático).";
