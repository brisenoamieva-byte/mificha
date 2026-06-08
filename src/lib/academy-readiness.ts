import { hasPublicConsent } from "@/lib/privacy";
import type { Academy } from "@/types/database";

export interface OnboardingProgress {
  profileReady: boolean;
  hasPlayers: boolean;
  hasScheduledMatch: boolean;
  hasCompletedMatch: boolean;
  hasGuardianEmails: boolean;
  hasShareableFicha: boolean;
  hasDiscoverablePlayer: boolean;
}

export interface OnboardingStep {
  id: string;
  done: boolean;
  title: string;
  description: string;
  href: string;
  cta: string;
  optional?: boolean;
}

export function isAcademyProfileReady(academy: Academy) {
  return Boolean(
    academy.city?.trim() &&
      academy.state?.trim() &&
      academy.description?.trim(),
  );
}

export function buildOnboardingSteps(progress: OnboardingProgress): OnboardingStep[] {
  return [
    {
      id: "profile",
      done: progress.profileReady,
      title: "Completa el perfil de tu academia",
      description: "Ciudad, estado y descripción para generar confianza.",
      href: "/dashboard/configuracion",
      cta: "Ir a configuración",
    },
    {
      id: "plantel",
      done: progress.hasPlayers,
      title: "Carga tu plantel",
      description: "Importa Excel (con email del tutor) o agrega jugadores manualmente.",
      href: "/dashboard/plantel",
      cta: "Ir a plantel",
    },
    {
      id: "calendar",
      done: progress.hasScheduledMatch,
      title: "Publica tu calendario",
      description: "Fecha, hora y sede visibles para padres y scouts.",
      href: "/dashboard/partidos/programar",
      cta: "Programar partido",
    },
    {
      id: "match",
      done: progress.hasCompletedMatch,
      title: "Captura stats post-partido",
      description: "Activa Passport Score y el marcador semanal.",
      href: "/dashboard/partidos/nuevo",
      cta: "Registrar resultado",
    },
    {
      id: "guardians",
      done: progress.hasGuardianEmails,
      title: "Agrega contacto del tutor",
      description: "Email del padre/madre para reportes (opcional si usas WhatsApp).",
      href: "/dashboard/plantel",
      cta: "Editar jugadores",
    },
    {
      id: "share",
      done: progress.hasShareableFicha,
      title: "Activa y comparte una ficha con padres",
      description: "Consentimiento parental + ficha pública + WhatsApp.",
      href: "/dashboard/plantel",
      cta: "Compartir desde plantel",
    },
    {
      id: "explore",
      done: progress.hasDiscoverablePlayer,
      title: "Opcional: aparece en Explorar",
      description: "Para visorías — activa directorio en jugadores seleccionados.",
      href: "/explorar",
      cta: "Ver directorio",
      optional: true,
    },
  ];
}

export function getOnboardingSummary(steps: OnboardingStep[]) {
  const requiredSteps = steps.filter((step) => !step.optional);
  const requiredDone = requiredSteps.filter((step) => step.done).length;
  const completedCount = steps.filter((step) => step.done).length;
  const allRequiredDone = requiredDone === requiredSteps.length;

  return {
    requiredSteps,
    requiredDone,
    completedCount,
    totalSteps: steps.length,
    allRequiredDone,
  };
}

interface PlayerOnboardingRow {
  is_public: boolean;
  public_consent_at: string | null;
  is_discoverable: boolean;
  guardian_email: string | null;
}

export function computeOnboardingProgress(
  academy: Academy,
  players: PlayerOnboardingRow[],
  scheduledMatchCount: number,
  completedMatchCount: number,
): OnboardingProgress {
  return {
    profileReady: isAcademyProfileReady(academy),
    hasPlayers: players.length > 0,
    hasScheduledMatch: scheduledMatchCount > 0,
    hasCompletedMatch: completedMatchCount > 0,
    hasGuardianEmails: players.some((player) => player.guardian_email?.trim()),
    hasShareableFicha: players.some((player) => hasPublicConsent(player)),
    hasDiscoverablePlayer: players.some(
      (player) => player.is_discoverable && hasPublicConsent(player),
    ),
  };
}
