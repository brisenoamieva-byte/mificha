import type { PlayerPosition } from "@/types/database";
import { isUnknownBirthDate } from "@/lib/player-category";

const positionLabels: Record<PlayerPosition, string> = {
  goalkeeper: "Portero",
  defender: "Defensa",
  midfielder: "Mediocampista",
  forward: "Delantero",
};

export function getPositionLabel(position: PlayerPosition) {
  return positionLabels[position];
}

export function calculateAge(birthDate: string | null | undefined) {
  if (isUnknownBirthDate(birthDate)) return null;
  const birth = new Date(birthDate!);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function isSubscriptionActive(planStatus: string) {
  return planStatus !== "inactive";
}
