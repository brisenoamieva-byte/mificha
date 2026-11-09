import type {
  TutorChildProfile,
  TutorMaterialKind,
  TutorSeasonStat,
} from "@/lib/tutor-family";

export type TutorBuilderStepId =
  | "identidad"
  | "cancha"
  | "historia"
  | "material"
  | "rendimiento"
  | "compartir";

export interface TutorProgressInput {
  player_name: string;
  profile: TutorChildProfile;
  materials: Array<{ kind: TutorMaterialKind }>;
  seasons?: Array<Pick<TutorSeasonStat, "matches" | "minutes" | "tournament_name">>;
  hasLinkedAcademy?: boolean;
}

export interface TutorProgressStep {
  id: TutorBuilderStepId;
  label: string;
  hint: string;
  done: boolean;
  weight: number;
}

export function buildTutorProgress(input: TutorProgressInput) {
  const profile = input.profile;
  const photos = input.materials.filter((item) => item.kind === "photo").length;
  const videos = input.materials.filter((item) => item.kind === "video").length;
  const stories = input.materials.filter((item) => item.kind === "story").length;
  const seasons = input.seasons ?? [];
  const hasManualStats = seasons.some(
    (row) =>
      Boolean(row.tournament_name?.trim()) &&
      (Number(row.matches) > 0 || Number(row.minutes) > 0),
  );

  const steps: TutorProgressStep[] = [
    {
      id: "identidad",
      label: "Identidad",
      hint: "Nombre, fecha de nacimiento y ciudad",
      done: Boolean(
        input.player_name.trim() && profile.birth_date && profile.city,
      ),
      weight: 20,
    },
    {
      id: "cancha",
      label: "En cancha",
      hint: "Posición, pie, estatura y club",
      done: Boolean(
        profile.position &&
          profile.dominant_foot &&
          profile.height_cm &&
          (profile.club || profile.school),
      ),
      weight: 20,
    },
    {
      id: "historia",
      label: "Historia",
      hint: "Presentación y objetivo",
      done: Boolean(profile.bio?.trim() && profile.goals?.trim()),
      weight: 15,
    },
    {
      id: "material",
      label: "Subir foto y video",
      hint: "Aquí cargas la foto de portada, videos y notas",
      done: photos > 0 && (videos > 0 || stories > 0),
      weight: 20,
    },
    {
      id: "rendimiento",
      label: "Rendimiento",
      hint: input.hasLinkedAcademy
        ? "Academia ligada · puedes sumar torneos previos"
        : "Torneos, minutos, goles y asistencias",
      done: Boolean(input.hasLinkedAcademy) || hasManualStats,
      weight: 15,
    },
    {
      id: "compartir",
      label: "Lista para compartir",
      hint: "Con link presentable para visorías",
      done:
        Boolean(input.player_name.trim() && profile.position && profile.bio?.trim()) &&
        photos > 0,
      weight: 10,
    },
  ];

  const earned = steps.reduce((sum, step) => sum + (step.done ? step.weight : 0), 0);
  const percent = Math.min(100, Math.round(earned));
  const next = steps.find((step) => !step.done) ?? steps[steps.length - 1];

  const statusLabel =
    percent >= 90
      ? "Lista para presentar"
      : percent >= 55
        ? "Va tomando forma"
        : percent >= 25
          ? "Empezando"
          : "Por completar";

  return { steps, percent, next, statusLabel, photos, videos, stories };
}
