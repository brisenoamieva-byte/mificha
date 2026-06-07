import type { PlayerPosition } from "@/types/database";

const positionLabels: Record<PlayerPosition, string> = {
  goalkeeper: "Portero",
  defender: "Defensa",
  midfielder: "Mediocampista",
  forward: "Delantero",
};

export function getPositionLabel(position: PlayerPosition) {
  return positionLabels[position];
}

export function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
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
