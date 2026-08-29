/**
 * Diagnóstico GPH / MiFicha — escala 1–5, módulos por posición y puntaje ponderado.
 * Fuente: Hoja de diagnóstico GPH Performance Hub (sep–dic 2026).
 */

import type { PlayerPosition } from "@/types/database";

export const DIAGNOSIS_KINDS = ["inicial", "seguimiento", "revaloracion"] as const;
export type DiagnosisKind = (typeof DIAGNOSIS_KINDS)[number];

export const DIAGNOSIS_STAGES = [
  "iniciacion",
  "desarrollo",
  "alto_rendimiento",
] as const;
export type DiagnosisStage = (typeof DIAGNOSIS_STAGES)[number];

export const DIAGNOSIS_MODULES = ["campo", "portero"] as const;
export type DiagnosisModule = (typeof DIAGNOSIS_MODULES)[number];

export const DIAGNOSIS_DOMAINS = [
  "tecnica",
  "tactica",
  "fisico",
  "mental",
  "compromiso",
] as const;
export type DiagnosisDomain = (typeof DIAGNOSIS_DOMAINS)[number];

export const DIAGNOSIS_SCALE = [
  {
    value: 1,
    label: "No adquirido",
    short: "1",
    hint: "No lo realiza o no comprende.",
  },
  {
    value: 2,
    label: "Inicial",
    short: "2",
    hint: "Lo realiza con ayuda y poca estabilidad.",
  },
  {
    value: 3,
    label: "Funcional",
    short: "3",
    hint: "Lo aplica en situaciones simples.",
  },
  {
    value: 4,
    label: "Consistente",
    short: "4",
    hint: "Lo aplica con calidad y presión moderada.",
  },
  {
    value: 5,
    label: "Competitivo",
    short: "5",
    hint: "Lo aplica con velocidad, presión y autonomía.",
  },
] as const;

export const DIAGNOSIS_KIND_LABELS: Record<DiagnosisKind, string> = {
  inicial: "Evaluación inicial",
  seguimiento: "Seguimiento",
  revaloracion: "Revaloración",
};

export const DIAGNOSIS_STAGE_LABELS: Record<DiagnosisStage, string> = {
  iniciacion: "Iniciación",
  desarrollo: "Desarrollo",
  alto_rendimiento: "Alto rendimiento",
};

export const DIAGNOSIS_STAGE_COPY: Record<DiagnosisStage, string> = {
  iniciacion:
    "Necesita bases, seguridad, comprensión inicial y acompañamiento constante.",
  desarrollo:
    "Tiene fundamentos, pero requiere corrección, consistencia y objetivos específicos.",
  alto_rendimiento:
    "Responde con autonomía y calidad; necesita exigencia, medición y preparación competitiva.",
};

export const DIAGNOSIS_DOMAIN_LABELS: Record<DiagnosisDomain, string> = {
  tecnica: "Técnica específica",
  tactica: "Táctica y decisiones",
  fisico: "Físico y motriz",
  mental: "Mental y comportamiento",
  compromiso: "Compromiso y hábitos",
};

export const DIAGNOSIS_DOMAIN_WEIGHTS: Record<DiagnosisDomain, number> = {
  tecnica: 0.35,
  tactica: 0.2,
  fisico: 0.15,
  mental: 0.2,
  compromiso: 0.1,
};

export const DIAGNOSIS_ASSIGNED_GROUPS = ["Iniciación", "Avanzado"] as const;
export type DiagnosisAssignedGroup = (typeof DIAGNOSIS_ASSIGNED_GROUPS)[number];

export const DIAGNOSIS_SESSION_DAYS = ["L-Mi", "Ma-J"] as const;

export const DIAGNOSIS_MONTHS = [
  "september",
  "october",
  "november",
  "december",
] as const;
export type DiagnosisMonth = (typeof DIAGNOSIS_MONTHS)[number];

export const DIAGNOSIS_MONTH_META: Record<
  DiagnosisMonth,
  { label: string; focus: string }
> = {
  september: { label: "Septiembre", focus: "Diagnóstico y corrección base" },
  october: { label: "Octubre", focus: "Progresión y consolidación" },
  november: { label: "Noviembre", focus: "Aplicación bajo presión" },
  december: { label: "Diciembre", focus: "Revaloración y siguiente ciclo" },
};

export interface DiagnosisIndicator {
  id: string;
  label: string;
  criterion: string;
  group: "comun" | "campo" | "portero" | "fisico" | "mental";
  domain: DiagnosisDomain;
}

export const DIAGNOSIS_INDICATORS: readonly DiagnosisIndicator[] = [
  {
    id: "control_orientado",
    label: "Control orientado",
    criterion: "Primer contacto y preparación de la siguiente acción.",
    group: "comun",
    domain: "tecnica",
  },
  {
    id: "conduccion",
    label: "Conducción",
    criterion: "Dominio, cambios de dirección y protección del balón.",
    group: "comun",
    domain: "tecnica",
  },
  {
    id: "pase",
    label: "Pase",
    criterion: "Precisión, fuerza y elección de superficie.",
    group: "comun",
    domain: "tecnica",
  },
  {
    id: "recepcion",
    label: "Recepción",
    criterion: "Perfil, control y continuidad de la jugada.",
    group: "comun",
    domain: "tecnica",
  },
  {
    id: "golpeo",
    label: "Golpeo",
    criterion: "Técnica, dirección y uso de ambos perfiles.",
    group: "comun",
    domain: "tecnica",
  },
  {
    id: "uno_contra_uno",
    label: "Uno contra uno",
    criterion: "Recursos ofensivos o defensivos según su posición.",
    group: "comun",
    domain: "tecnica",
  },
  {
    id: "escaneo",
    label: "Escaneo",
    criterion: "Observa antes de recibir y reconoce opciones.",
    group: "comun",
    domain: "tactica",
  },
  {
    id: "toma_decisiones",
    label: "Toma de decisiones",
    criterion: "Elige con oportunidad y sentido de juego.",
    group: "comun",
    domain: "tactica",
  },
  {
    id: "ubicacion",
    label: "Ubicación",
    criterion: "Comprende espacios, líneas y función básica.",
    group: "comun",
    domain: "tactica",
  },
  {
    id: "transiciones",
    label: "Transiciones",
    criterion: "Reacciona al ganar o perder la posesión.",
    group: "comun",
    domain: "tactica",
  },
  {
    id: "perfil_corporal",
    label: "Perfil corporal",
    criterion: "Se orienta para recibir y jugar hacia adelante.",
    group: "campo",
    domain: "tecnica",
  },
  {
    id: "desmarque_apoyo",
    label: "Desmarque y apoyo",
    criterion: "Genera líneas de pase y ocupa espacios útiles.",
    group: "campo",
    domain: "tactica",
  },
  {
    id: "juego_bajo_presion",
    label: "Juego bajo presión",
    criterion: "Conserva calidad técnica con oposición.",
    group: "campo",
    domain: "tecnica",
  },
  {
    id: "duelo_ofensivo",
    label: "Duelo ofensivo",
    criterion: "Supera, protege o crea ventaja en uno contra uno.",
    group: "campo",
    domain: "tecnica",
  },
  {
    id: "duelo_defensivo",
    label: "Duelo defensivo",
    criterion: "Temporiza, orienta y recupera con control.",
    group: "campo",
    domain: "tactica",
  },
  {
    id: "finalizacion",
    label: "Finalización",
    criterion: "Selecciona superficie, dirección y potencia.",
    group: "campo",
    domain: "tecnica",
  },
  {
    id: "lectura_posicion",
    label: "Lectura por posición",
    criterion: "Interpreta responsabilidades de su rol.",
    group: "campo",
    domain: "tactica",
  },
  {
    id: "participacion_colectiva",
    label: "Participación colectiva",
    criterion: "Se conecta y comunica con compañeros.",
    group: "campo",
    domain: "tactica",
  },
  {
    id: "posicion_base",
    label: "Posición base",
    criterion: "Equilibrio, orientación y preparación previa.",
    group: "portero",
    domain: "tecnica",
  },
  {
    id: "desplazamientos",
    label: "Desplazamientos",
    criterion: "Ajusta distancia y ángulo sin perder estabilidad.",
    group: "portero",
    domain: "tecnica",
  },
  {
    id: "blocaje_recepcion",
    label: "Blocaje y recepción",
    criterion: "Seguridad de manos y control del balón.",
    group: "portero",
    domain: "tecnica",
  },
  {
    id: "caidas_desvios",
    label: "Caídas y desvíos",
    criterion: "Técnica, protección y dirección del rebote.",
    group: "portero",
    domain: "tecnica",
  },
  {
    id: "uno_contra_uno_gk",
    label: "Uno contra uno",
    criterion: "Temporiza, reduce ángulo y decide la intervención.",
    group: "portero",
    domain: "tecnica",
  },
  {
    id: "juego_aereo",
    label: "Juego aéreo",
    criterion: "Ataca balones altos y se comunica.",
    group: "portero",
    domain: "tecnica",
  },
  {
    id: "distribucion",
    label: "Distribución",
    criterion: "Precisión con mano y pie para iniciar juego.",
    group: "portero",
    domain: "tecnica",
  },
  {
    id: "lectura_mando",
    label: "Lectura y mando",
    criterion: "Anticipa, ordena y toma decisiones.",
    group: "portero",
    domain: "tactica",
  },
  {
    id: "coordinacion",
    label: "Coordinación",
    criterion: "Control segmentario y calidad de movimiento.",
    group: "fisico",
    domain: "fisico",
  },
  {
    id: "movilidad",
    label: "Movilidad",
    criterion: "Rangos funcionales para entrenar sin compensaciones.",
    group: "fisico",
    domain: "fisico",
  },
  {
    id: "velocidad",
    label: "Velocidad",
    criterion: "Aceleración, reacción y cambios de dirección.",
    group: "fisico",
    domain: "fisico",
  },
  {
    id: "fuerza_estabilidad",
    label: "Fuerza / estabilidad",
    criterion: "Control de tronco y soporte en acciones.",
    group: "fisico",
    domain: "fisico",
  },
  {
    id: "resistencia",
    label: "Resistencia",
    criterion: "Sostiene esfuerzo y calidad durante la sesión.",
    group: "fisico",
    domain: "fisico",
  },
  {
    id: "prevencion",
    label: "Prevención",
    criterion: "Hábitos, molestias y factores de riesgo.",
    group: "fisico",
    domain: "compromiso",
  },
  {
    id: "confianza",
    label: "Confianza",
    criterion: "Intenta, acepta corrección y vuelve a participar.",
    group: "mental",
    domain: "mental",
  },
  {
    id: "atencion",
    label: "Atención",
    criterion: "Escucha, comprende y mantiene foco.",
    group: "mental",
    domain: "mental",
  },
  {
    id: "disciplina",
    label: "Disciplina",
    criterion: "Puntualidad, esfuerzo y cumplimiento.",
    group: "mental",
    domain: "mental",
  },
  {
    id: "manejo_error",
    label: "Manejo del error",
    criterion: "Regula frustración y continúa compitiendo.",
    group: "mental",
    domain: "mental",
  },
  {
    id: "comunicacion",
    label: "Comunicación",
    criterion: "Se expresa, escucha y colabora.",
    group: "mental",
    domain: "mental",
  },
  {
    id: "compromiso",
    label: "Compromiso",
    criterion: "Asistencia esperada y práctica consciente.",
    group: "mental",
    domain: "compromiso",
  },
] as const;

export const DIAGNOSIS_GROUP_LABELS: Record<
  DiagnosisIndicator["group"],
  string
> = {
  comun: "Técnica, percepción y juego",
  campo: "Módulo jugador de campo",
  portero: "Módulo portero",
  fisico: "Área física y motriz",
  mental: "Mental, hábitos y comportamiento",
};

export interface DiagnosisPriorityItem {
  title: string;
  baseline: string;
  december_goal: string;
  progress_indicator: string;
  main_action: string;
  indicator_id?: string;
}

export interface DiagnosisMonthPlan {
  objective: string;
  actions: string;
}

export type DiagnosisMonthlyPlan = Record<DiagnosisMonth, DiagnosisMonthPlan>;

export type DiagnosisScores = Record<string, number>;
export type DiagnosisNotes = Record<string, string>;

export interface DiagnosisCoachBrief {
  source: "ai" | "gph";
  generatedAt: string;
  stageRationale: string;
  overall: string;
  family: string;
  domains: Partial<Record<DiagnosisDomain, string>>;
  sessionFocus: string[];
  warnings: string[];
}

export function emptyCoachBrief(): DiagnosisCoachBrief {
  return {
    source: "gph",
    generatedAt: "",
    stageRationale: "",
    overall: "",
    family: "",
    domains: {},
    sessionFocus: [],
    warnings: [],
  };
}

export function parseCoachBrief(value: unknown): DiagnosisCoachBrief | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const overall = typeof raw.overall === "string" ? raw.overall.trim() : "";
  const stageRationale =
    typeof raw.stageRationale === "string" ? raw.stageRationale.trim() : "";
  if (!overall && !stageRationale) return null;
  const domains: DiagnosisCoachBrief["domains"] = {};
  if (raw.domains && typeof raw.domains === "object" && !Array.isArray(raw.domains)) {
    for (const domain of DIAGNOSIS_DOMAINS) {
      const text = (raw.domains as Record<string, unknown>)[domain];
      if (typeof text === "string" && text.trim()) domains[domain] = text.trim();
    }
  }
  return {
    source: raw.source === "ai" ? "ai" : "gph",
    generatedAt: typeof raw.generatedAt === "string" ? raw.generatedAt : "",
    stageRationale,
    overall,
    family: typeof raw.family === "string" ? raw.family.trim() : "",
    domains,
    sessionFocus: Array.isArray(raw.sessionFocus)
      ? raw.sessionFocus.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [],
    warnings: Array.isArray(raw.warnings)
      ? raw.warnings.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [],
  };
}

export interface DiagnosisResult {
  domainAverages: Record<DiagnosisDomain, number | null>;
  weightedScores: Record<DiagnosisDomain, number | null>;
  globalScore: number | null;
  stage: DiagnosisStage | null;
  scoredCount: number;
  requiredCount: number;
  complete: boolean;
}

export interface PlayerDiagnosisRecord {
  id: string;
  academy_id: string;
  player_id: string;
  kind: DiagnosisKind;
  module: DiagnosisModule;
  evaluated_at: string;
  evaluator_name: string;
  years_experience: number | null;
  venue: string | null;
  session_days: string | null;
  sessions_per_week: number | null;
  injuries: string | null;
  why_join: string | null;
  player_goal: string | null;
  family_goal: string | null;
  medical_notes: string | null;
  scores: DiagnosisScores;
  notes: DiagnosisNotes;
  flagged: string[];
  domain_averages: Record<DiagnosisDomain, number | null>;
  global_score: number | null;
  computed_stage: DiagnosisStage | null;
  assigned_stage: DiagnosisStage | null;
  assigned_group: string | null;
  assignment_notes: string | null;
  program_priorities: DiagnosisPriorityItem[];
  monthly_plan: DiagnosisMonthlyPlan;
  field_session: import("@/lib/gph-field-protocol").GphFieldSession;
  share_token_hash: string;
  created_at: string;
  updated_at: string;
}

export function moduleFromPosition(position: PlayerPosition): DiagnosisModule {
  return position === "goalkeeper" ? "portero" : "campo";
}

export function indicatorsForModule(module: DiagnosisModule) {
  return DIAGNOSIS_INDICATORS.filter((item) => {
    if (item.group === "campo") return module === "campo";
    if (item.group === "portero") return module === "portero";
    return true;
  });
}

export function clampDiagnosisScore(value: number) {
  if (!Number.isFinite(value)) return null;
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function stageFromScore(score: number): DiagnosisStage {
  if (score <= 2.2) return "iniciacion";
  if (score <= 3.7) return "desarrollo";
  return "alto_rendimiento";
}

function mean(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function computeDiagnosisResult(
  scores: DiagnosisScores,
  module: DiagnosisModule,
): DiagnosisResult {
  const required = indicatorsForModule(module);
  const scored = required.filter((item) => clampDiagnosisScore(scores[item.id]) != null);

  const domainAverages = {} as Record<DiagnosisDomain, number | null>;
  const weightedScores = {} as Record<DiagnosisDomain, number | null>;

  for (const domain of DIAGNOSIS_DOMAINS) {
    const values = required
      .filter((item) => item.domain === domain)
      .map((item) => clampDiagnosisScore(scores[item.id]))
      .filter((value): value is number => value != null);
    const average = mean(values);
    domainAverages[domain] = average == null ? null : round1(average);
    weightedScores[domain] =
      average == null ? null : round2(average * DIAGNOSIS_DOMAIN_WEIGHTS[domain]);
  }

  const complete = scored.length === required.length;
  const parts = DIAGNOSIS_DOMAINS.map((domain) => {
    const average = domainAverages[domain];
    return average == null ? null : average * DIAGNOSIS_DOMAIN_WEIGHTS[domain];
  });

  const globalScore =
    parts.every((part) => part != null) && complete
      ? round1(parts.reduce((sum, part) => sum + (part ?? 0), 0))
      : parts.some((part) => part != null)
        ? round1(
            DIAGNOSIS_DOMAINS.reduce((sum, domain) => {
              const average = domainAverages[domain];
              return average == null
                ? sum
                : sum + average * DIAGNOSIS_DOMAIN_WEIGHTS[domain];
            }, 0) /
              DIAGNOSIS_DOMAINS.filter((domain) => domainAverages[domain] != null).reduce(
                (sum, domain) => sum + DIAGNOSIS_DOMAIN_WEIGHTS[domain],
                0,
              ),
          )
        : null;

  return {
    domainAverages,
    weightedScores,
    globalScore,
    stage: globalScore == null ? null : stageFromScore(globalScore),
    scoredCount: scored.length,
    requiredCount: required.length,
    complete,
  };
}

export function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function indicatorById(id: string) {
  return DIAGNOSIS_INDICATORS.find((item) => item.id === id) ?? null;
}

export function rankedIndicators(
  scores: DiagnosisScores,
  module: DiagnosisModule,
  direction: "high" | "low",
  limit = 4,
) {
  const items = indicatorsForModule(module)
    .map((item) => ({
      ...item,
      score: clampDiagnosisScore(scores[item.id]),
    }))
    .filter((item) => item.score != null) as Array<
    DiagnosisIndicator & { score: number }
  >;

  items.sort((a, b) =>
    direction === "high" ? b.score - a.score : a.score - b.score,
  );
  return items.slice(0, limit);
}

export function emptyMonthlyPlan(): DiagnosisMonthlyPlan {
  return {
    september: { objective: "", actions: "" },
    october: { objective: "", actions: "" },
    november: { objective: "", actions: "" },
    december: { objective: "", actions: "" },
  };
}

export function suggestPriorities(
  scores: DiagnosisScores,
  module: DiagnosisModule,
): DiagnosisPriorityItem[] {
  return rankedIndicators(scores, module, "low", 4).map((item) => ({
    indicator_id: item.id,
    title: item.label,
    baseline: `${item.score} · ${DIAGNOSIS_SCALE[item.score - 1]?.label ?? ""}`,
    december_goal: "",
    progress_indicator: item.criterion,
    main_action: "",
  }));
}

export function scoreTone(
  score: number | null,
): "danger" | "warning" | "neutral" | "success" {
  if (score == null) return "neutral";
  if (score <= 2) return "danger";
  if (score < 4) return "warning";
  return "success";
}

const MONTHS_SHORT_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

export function formatDiagnosisDate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} ${MONTHS_SHORT_ES[month - 1]} ${year}`;
}

export interface DiagnosisPlayerSnapshot {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  position: PlayerPosition;
  dominant_foot: string;
  jersey_number: number | null;
  photo_url: string | null;
  slug: string;
}

export interface DiagnosisAcademySnapshot {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}
