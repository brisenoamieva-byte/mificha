import {
  isAcademyProfileReady,
  type OnboardingProgress,
} from "@/lib/academy-readiness";
import { hasPublicConsent } from "@/lib/privacy";
import { playerIsShareableWithPhoto } from "@/lib/player-visual-profile";
import type { Academy } from "@/types/database";

export const CERTIFIED_ACADEMY_LABEL = "Academia certificada MiFicha";

export interface AcademyCertificationMetrics {
  playerCount: number;
  completedMatchCount: number;
  shareablePlayerCount: number;
  photoShareableCount: number;
  guardianContactCount: number;
}

export interface CertificationRequirement {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

interface PlayerCertificationRow {
  is_public: boolean;
  public_consent_at: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
  photo_url: string | null;
}

export function hasGuardianContact(player: PlayerCertificationRow) {
  return Boolean(player.guardian_email?.trim() || player.guardian_phone?.trim());
}

export function computeCertificationMetrics(
  players: PlayerCertificationRow[],
  completedMatchCount: number,
): AcademyCertificationMetrics {
  return {
    playerCount: players.length,
    completedMatchCount,
    shareablePlayerCount: players.filter((player) => hasPublicConsent(player)).length,
    photoShareableCount: players.filter((player) => playerIsShareableWithPhoto(player)).length,
    guardianContactCount: players.filter((player) => hasGuardianContact(player)).length,
  };
}

export function computeAcademyCertified(
  academy: Pick<Academy, "city" | "state" | "description" | "is_public" | "logo_url">,
  metrics: AcademyCertificationMetrics,
): boolean {
  if (!academy.is_public) return false;
  if (!isAcademyProfileReady(academy as Academy)) return false;
  if (!academy.logo_url?.trim()) return false;
  if (metrics.playerCount < 1) return false;
  if (metrics.completedMatchCount < 1) return false;
  if (metrics.shareablePlayerCount < 1) return false;
  if (metrics.photoShareableCount < 1) return false;
  if (metrics.guardianContactCount < 1) return false;
  return true;
}

export function buildCertificationRequirements(
  academy: Pick<Academy, "city" | "state" | "description" | "is_public" | "logo_url">,
  metrics: AcademyCertificationMetrics,
): CertificationRequirement[] {
  return [
    {
      id: "public",
      label: "Landing pública activa",
      done: academy.is_public,
      href: "/fut/dashboard/configuracion",
    },
    {
      id: "profile",
      label: "Perfil completo (ciudad, estado, descripción)",
      done: isAcademyProfileReady(academy as Academy),
      href: "/fut/dashboard/configuracion",
    },
    {
      id: "logo",
      label: "Logo de la academia",
      done: Boolean(academy.logo_url?.trim()),
      href: "/fut/dashboard/configuracion",
    },
    {
      id: "plantel",
      label: "Plantel cargado",
      done: metrics.playerCount >= 1,
      href: "/fut/dashboard/plantel",
    },
    {
      id: "match",
      label: "Al menos 1 jornada con acta oficial sincronizada",
      done: metrics.completedMatchCount >= 1,
      href: "/fut/dashboard/partidos",
    },
    {
      id: "share",
      label: "Jugador con consentimiento y ficha pública",
      done: metrics.shareablePlayerCount >= 1,
      href: "/fut/dashboard/plantel/tutores",
    },
    {
      id: "photo",
      label: "Jugador público con foto",
      done: metrics.photoShareableCount >= 1,
      href: "/fut/dashboard/plantel",
    },
    {
      id: "guardian",
      label: "Contacto del tutor (email o WhatsApp)",
      done: metrics.guardianContactCount >= 1,
      href: "/fut/dashboard/plantel",
    },
  ];
}

/** True when essential onboarding is done — certification may still be pending. */
export function isEssentialOnboardingComplete(progress: OnboardingProgress) {
  return (
    progress.hasPlayers &&
    progress.hasCompletedMatch &&
    progress.hasShareableFicha
  );
}
