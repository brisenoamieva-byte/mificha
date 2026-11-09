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
  "Los reportes por email requieren dominio verificado en la misma cuenta Resend de RESEND_API_KEY. Si mificha.mx ya está en otra cuenta Resend, transfiere el dominio o cambia la API key. Mientras tanto, los avisos post-partido también pueden salir por WhatsApp desde Plantel → Avisos a tutores.";
