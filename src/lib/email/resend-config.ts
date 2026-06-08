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
  "Los reportes por email solo llegan a tutores con dominio verificado. Mientras tanto, comparte fichas por WhatsApp desde Plantel.";
