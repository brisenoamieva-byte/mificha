import { getPlayerAge } from "@/lib/player-category";

export const MINOR_AGE_THRESHOLD = 18;

export const PRIVACY_COPY = {
  consentLabel:
    "Confirmo contar con autorización del padre, madre o tutor para tratar y compartir los datos deportivos de este menor conforme al aviso de privacidad.",
  publicProfileLabel:
    "Ficha accesible por link (no indexada en buscadores; solo quien tenga el enlace).",
  discoverableLabel:
    "Permitir aparición en directorio y destacados de MiFicha (visorías), siempre por categoría y con consentimiento.",
  publicProfileHint:
    "MiFicha envía el link al tutor automáticamente tras cada partido. No aparece en listados abiertos salvo que actives directorio.",
  discoverableHint:
    "Solo para jugadores que la academia decide promover públicamente. Requiere autorización parental.",
  minorNotice:
    "MiFicha trata datos de menores con fines deportivos. La academia es responsable de obtener y documentar el consentimiento parental.",
} as const;

export function isMinor(birthDate: string): boolean {
  return getPlayerAge(birthDate) < MINOR_AGE_THRESHOLD;
}

export function hasPublicConsent(player: {
  is_public: boolean;
  public_consent_at?: string | null;
}): boolean {
  return player.is_public && Boolean(player.public_consent_at);
}

export function isDiscoverablePlayer(player: {
  is_public: boolean;
  is_discoverable: boolean;
  public_consent_at?: string | null;
}): boolean {
  return (
    player.is_discoverable &&
    player.is_public &&
    Boolean(player.public_consent_at)
  );
}

export function getProtectedProfileTitle(
  firstName: string,
  lastName: string,
  birthDate: string,
): string {
  if (isMinor(birthDate)) {
    return `${firstName} ${lastName.charAt(0)}. · Ficha verificada`;
  }

  return `${firstName} ${lastName} · Ficha técnica`;
}

export function getProtectedProfileDescription(
  firstName: string,
  birthDate: string,
  positionLabel: string,
  academyName: string,
): string {
  const age = getPlayerAge(birthDate);

  if (isMinor(birthDate)) {
    return `Ficha deportiva verificada · ${positionLabel} · categoría ${age} años · ${academyName}.`;
  }

  return `Ficha técnica de ${firstName}, ${positionLabel} en ${academyName}.`;
}

export function buildPrivacyPayload(options: {
  isPublic: boolean;
  isDiscoverable: boolean;
  hasConsent: boolean;
  existingConsentAt?: string | null;
}) {
  if ((options.isPublic || options.isDiscoverable) && !options.hasConsent) {
    throw new Error(PRIVACY_COPY.consentLabel);
  }

  const sharingActive = options.isPublic || options.isDiscoverable;

  return {
    is_public: options.isPublic,
    is_discoverable: options.isPublic && options.isDiscoverable,
    public_consent_at: sharingActive
      ? options.existingConsentAt ?? new Date().toISOString()
      : null,
  };
}
