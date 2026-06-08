export interface GuardianNotifyPlayerFields {
  is_public: boolean;
  public_consent_at: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
  notify_guardian_on_match: boolean;
}

export function getGuardianNotificationReadiness(
  player: GuardianNotifyPlayerFields,
) {
  if (!player.notify_guardian_on_match) {
    return { ok: false as const, reason: "Avisos automáticos desactivados." };
  }

  if (!player.public_consent_at) {
    return { ok: false as const, reason: "Sin consentimiento del tutor." };
  }

  if (!player.is_public) {
    return { ok: false as const, reason: "Ficha pública no activa." };
  }

  const hasEmail = Boolean(player.guardian_email?.trim());
  const hasPhone = Boolean(player.guardian_phone?.trim());

  if (!hasEmail && !hasPhone) {
    return {
      ok: false as const,
      reason: "Agrega WhatsApp o email del tutor en Plantel.",
    };
  }

  return { ok: true as const };
}
