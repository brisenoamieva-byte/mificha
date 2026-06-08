import { hasPublicConsent } from "@/lib/privacy";
import { PARENT_ENGAGEMENT_GOAL } from "@/lib/profile-view-tracking";
import type { Academy } from "@/types/database";

export interface OnboardingProgress {
  profileReady: boolean;
  hasPlayers: boolean;
  hasScheduledMatch: boolean;
  hasCompletedMatch: boolean;
  hasGuardianEmails: boolean;
  hasShareableFicha: boolean;
  hasDiscoverablePlayer: boolean;
  parentUniqueViews: number;
  hasParentEngagement: boolean;
}

export interface OnboardingStep {
  id: string;
  done: boolean;
  title: string;
  description: string;
  href: string;
  cta: string;
  optional?: boolean;
  essential?: boolean;
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
      id: "plantel",
      done: progress.hasPlayers,
      essential: true,
      title: "Carga tu plantel",
      description: "Importa Excel una vez o agrega jugadores manualmente.",
      href: "/dashboard/plantel",
      cta: "Ir a plantel",
    },
    {
      id: "match",
      done: progress.hasCompletedMatch,
      essential: true,
      title: "Primera captura post-partido",
      description: "Modo convocados + captura rápida: ~2 min en celular.",
      href: "/dashboard/partidos/nuevo",
      cta: "Registrar partido",
    },
    {
      id: "share",
      done: progress.hasShareableFicha,
      essential: true,
      title: "Comparte con un padre",
      description: "Consentimiento + ficha pública + WhatsApp tras guardar.",
      href: "/dashboard/plantel",
      cta: "Activar ficha",
    },
    {
      id: "parents",
      done: progress.hasParentEngagement,
      optional: true,
      title: "Padres abrieron la ficha",
      description: `Meta del piloto: ${PARENT_ENGAGEMENT_GOAL}+ visitas únicas (${progress.parentUniqueViews} hasta ahora).`,
      href: "/dashboard/plantel",
      cta: "Compartir fichas",
    },
    {
      id: "profile",
      done: progress.profileReady,
      optional: true,
      title: "Perfil de academia",
      description: "Ciudad, estado y descripción para generar confianza.",
      href: "/dashboard/configuracion",
      cta: "Completar perfil",
    },
    {
      id: "calendar",
      done: progress.hasScheduledMatch,
      optional: true,
      title: "Calendario publicado",
      description: "MiFicha publica jornadas oficiales; confirma en Partidos.",
      href: "/dashboard/partidos",
      cta: "Ver partidos",
    },
    {
      id: "guardians",
      done: progress.hasGuardianEmails,
      optional: true,
      title: "Email del tutor",
      description: "Para reportes automáticos si no usas solo WhatsApp.",
      href: "/dashboard/plantel",
      cta: "Editar jugadores",
    },
    {
      id: "explore",
      done: progress.hasDiscoverablePlayer,
      optional: true,
      title: "Aparecer en Explorar",
      description: "Solo si quieres visorías — directorio por categoría.",
      href: "/explorar",
      cta: "Ver directorio",
    },
  ];
}

export function getOnboardingSummary(steps: OnboardingStep[]) {
  const essentialSteps = steps.filter((step) => step.essential);
  const optionalSteps = steps.filter((step) => step.optional);
  const essentialDone = essentialSteps.filter((step) => step.done).length;
  const completedCount = steps.filter((step) => step.done).length;
  const allEssentialDone = essentialDone === essentialSteps.length;

  return {
    essentialSteps,
    optionalSteps,
    essentialDone,
    essentialTotal: essentialSteps.length,
    completedCount,
    totalSteps: steps.length,
    allEssentialDone,
    /** @deprecated use allEssentialDone */
    allRequiredDone: allEssentialDone,
    requiredSteps: essentialSteps,
    requiredDone: essentialDone,
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
  parentUniqueViews = 0,
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
    parentUniqueViews,
    hasParentEngagement: parentUniqueViews >= PARENT_ENGAGEMENT_GOAL,
  };
}
