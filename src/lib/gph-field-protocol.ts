/**
 * Manual práctico GPH en cancha (v1.0, agosto 2026).
 * Dato crudo primero; calificación 1–5 al cierre de la sesión.
 */

import type { DiagnosisCoachBrief, DiagnosisModule, DiagnosisStage } from "@/lib/player-diagnosis";
import { parseCoachBrief } from "@/lib/player-diagnosis";

export const GPH_PRINCIPLE =
  "Medir no es etiquetar. El diagnóstico establece el punto de partida, identifica fortalezas y convierte de tres a cinco áreas de oportunidad en objetivos claros.";

export const GPH_MANUAL_VERSION = "1.0 · agosto 2026";

export const GPH_SESSION_TYPES = ["esencial", "360"] as const;
export type GphSessionType = (typeof GPH_SESSION_TYPES)[number];

export const GPH_PROTOCOL_STAGES = ["iniciacion", "desarrollo"] as const;
export type GphProtocolStage = (typeof GPH_PROTOCOL_STAGES)[number];

export const GPH_VENUE_CODES = [
  { id: "CJ", label: "Casa de la Juventud" },
  { id: "SJ", label: "San Javier" },
  { id: "otro", label: "Otra sede" },
] as const;

export type GphTestKind =
  | "contacts"
  | "time"
  | "accuracy"
  | "points"
  | "distance"
  | "ratio";

export type GphConversion = "accuracy" | "contacts_ini" | "contacts_des" | "rubric_06" | "manual";

export const GPH_BATTERY_SECTIONS = [
  { id: "fisicas", number: 1, label: "Físicas" },
  { id: "tecnicas", number: 2, label: "Técnicas" },
  { id: "coordinativas", number: 3, label: "Coordinativas" },
  { id: "cognitivas", number: 4, label: "Cognitivas" },
  { id: "reglamentarias", number: 5, label: "Reglamentarias" },
] as const;

export type GphBatterySectionId = (typeof GPH_BATTERY_SECTIONS)[number]["id"];

export const GPH_GK_TECH_GROUPS = [
  {
    id: "bloqueo",
    label: "1. Técnica de bloqueo",
    protocol: "1 bloque de 10 repeticiones. Calificación 1–10.",
  },
  {
    id: "recueste",
    label: "2. Técnica de recueste",
    protocol: "5 izquierdo y 5 derechos.",
  },
  {
    id: "aereo",
    label: "3. Juego aéreo",
    protocol: "10 repeticiones de cada uno.",
  },
  {
    id: "pies",
    label: "4. Juego de pies",
    protocol: "10 acciones, 5 con cada pie.",
  },
] as const;

export const GPH_REGULATION_RULE_COUNT = 17;

/** Orden IFAB. Clave para el evaluador; el jugador las dicta en los 17 espacios. */
export const GPH_REGULATION_RULES = [
  { title: "El terreno de juego", aliases: ["campo", "cancha", "terreno"] },
  { title: "El balón", aliases: ["balon", "pelota"] },
  { title: "Los jugadores", aliases: ["jugadores", "numero de jugadores"] },
  {
    title: "El equipamiento de los jugadores",
    aliases: ["equipamiento", "equipo de los jugadores", "indumentaria"],
  },
  { title: "El árbitro", aliases: ["arbitro", "referee"] },
  {
    title: "Los otros miembros del equipo arbitral",
    aliases: ["asistentes", "jueces de linea", "equipo arbitral"],
  },
  { title: "La duración del partido", aliases: ["duracion", "tiempo de juego"] },
  {
    title: "El inicio y la reanudación del juego",
    aliases: ["saque inicial", "inicio del juego", "reanudacion"],
  },
  {
    title: "El balón en juego y fuera de juego",
    aliases: ["balon en juego", "fuera de juego del balon"],
  },
  {
    title: "El resultado de un partido",
    aliases: ["gol", "resultado", "tanto"],
  },
  { title: "El fuera de juego", aliases: ["fuera de lugar", "offside"] },
  { title: "Faltas e incorrecciones", aliases: ["faltas", "infracciones", "conducta"] },
  { title: "Tiros libres", aliases: ["tiro libre", "faltas indirectas"] },
  { title: "El penal", aliases: ["penalti", "penalty", "penal"] },
  { title: "El saque de banda", aliases: ["lateral", "saque de banda"] },
  { title: "El saque de meta", aliases: ["saque de puerta", "goal kick"] },
  { title: "El saque de esquina", aliases: ["corner", "tiro de esquina"] },
] as const;

export interface GphStationTest {
  id: string;
  number: number;
  /** Código de batería, p. ej. 2C. */
  code?: string;
  section?: GphBatterySectionId;
  label: string;
  unit: string;
  module: DiagnosisModule;
  stage: GphProtocolStage | "ambos";
  /** Si existe, la prueba aplica a esos módulos (p. ej. cognitivas para campo y portero). */
  appliesTo?: readonly DiagnosisModule[];
  /** esencial = E/360; plus = solo 360 */
  usage: "esencial" | "plus";
  kind: GphTestKind;
  conversion: GphConversion;
  attempts: number;
  attemptLabels?: readonly string[];
  maxPoints?: number;
  setup: string;
  execution: string;
  record: string;
  indicatorId?: string;
  relevanceDefault: 1 | 2 | 3;
  /** Subgrupo dentro de Técnicas (porteros). */
  subsection?: { id: string; label: string; protocol: string };
  /** Sigue en el catálogo para reportes viejos; no sale en la batería nueva. */
  retired?: boolean;
}

export interface GphShotDistanceCapture {
  /** Puntos o aciertos en esa distancia. */
  precision: number | null;
  /** Potencia (radar) en km/h. */
  powerKmh: number | null;
}

export interface GphTestCapture {
  attempts: Array<number | null>;
  hits: number | null;
  opportunities: number | null;
  errors: number | null;
  leftHits: number | null;
  rightHits: number | null;
  /** Aciertos de pase a 5 / 10 / 20 m (Pase de precisión). */
  hits5m: number | null;
  hits10m: number | null;
  hits20m: number | null;
  /** Precisión + potencia por distancia (tiros). */
  shotDistances: Record<string, GphShotDistanceCapture>;
  /** Las 17 reglas en orden (prueba reglamentaria). */
  ruleSlots: string[];
  radarKmh: number | null;
  score: number | null;
  relevance: 1 | 2 | 3;
  flagged: boolean;
  note: string;
}

export interface GphPhysicalCapture {
  attempts: Array<number | null>;
  note: string;
  score: number | null;
}

export const DIAGNOSIS_EVIDENCE_MAX = 12;

export type GphEvidenceKind = "photo" | "video";

export interface GphEvidenceItem {
  id: string;
  kind: GphEvidenceKind;
  url: string;
  caption: string;
  stationId: string;
  createdAt: string;
}

export interface GphSessionClosing {
  testsComplete: boolean | null;
  videosIdentified: boolean | null;
  dataLoaded: boolean | null;
  incidentsLogged: boolean | null;
  reportScheduled: boolean | null;
  feedbackDate: string;
}

export const GPH_CLOSING_CHECKS = [
  { id: "testsComplete", label: "Pruebas completas" },
  { id: "videosIdentified", label: "Videos identificados" },
  { id: "dataLoaded", label: "Datos cargados" },
  { id: "incidentsLogged", label: "Incidencias registradas" },
  { id: "reportScheduled", label: "Reporte programado" },
] as const;

export const GPH_PERCENTILE_NOTE =
  "Tiempo y distancia: guardar siempre el dato crudo. Hasta reunir 30 resultados por grupo de edad, comparar contra el propio jugador; después, percentiles P1–20 = 1 … P81–100 = 5.";

export interface GphFieldSession {
  protocolStage: GphProtocolStage;
  sessionType: GphSessionType;
  /** draft = avance parcial; ready = ficha cerrada para entregar. */
  status: "draft" | "ready";
  surface: string;
  weather: string;
  ballSize: string;
  ballPsi: string;
  venueCode: string;
  bibNumber: string;
  currentClub: string;
  familiarizationDone: boolean | null;
  regulationDistance: boolean | null;
  ballSurfaceLogged: boolean | null;
  keyTestsVideo: boolean | null;
  observation: string;
  incident: string;
  closing: GphSessionClosing;
  tests: Record<string, GphTestCapture>;
  physical: Record<string, GphPhysicalCapture>;
  evidence: GphEvidenceItem[];
  coachBrief: DiagnosisCoachBrief | null;
}

function t(
  partial: Omit<GphStationTest, "module" | "stage"> & {
    module: DiagnosisModule;
    stage: GphProtocolStage | "ambos";
  },
): GphStationTest {
  return partial;
}

function gkSub(id: (typeof GPH_GK_TECH_GROUPS)[number]["id"]) {
  const group = GPH_GK_TECH_GROUPS.find((item) => item.id === id);
  if (!group) throw new Error(`Unknown GK tech group: ${id}`);
  return { id: group.id, label: group.label, protocol: group.protocol };
}

export const GPH_STATION_TESTS: readonly GphStationTest[] = [
  t({
    id: "ini_c_dominadas",
    number: 1,
    code: "2A",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Dominadas libres",
    unit: "contactos",
    kind: "contacts",
    conversion: "contacts_ini",
    attempts: 5,
    setup: "Zona 3 × 3 m; balón por edad; cronómetro.",
    execution: "5 intentos, máximo 30 s. Inicia con balón en mano; pies y muslos permitidos.",
    record: "Contactos de cada intento; mejor; promedio; pie menos usado.",
    indicatorId: "conduccion",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_control",
    number: 2,
    code: "2E",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Control fijo y orientado raso",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 4,
    attemptLabels: ["Fijo 5 m", "Orientado 5 m", "Fijo 10 m", "Orientado 10 m"],
    maxPoints: 6,
    setup: "Servicio raso; zonas de control a 5 m y 10 m.",
    execution:
      "En cada distancia (5 m y 10 m): una medición de control fijo y otra de control orientado. Un intento cada una.",
    record: "Rúbrica 0–6: control fijo y control orientado a 5 m y a 10 m.",
    indicatorId: "control_orientado",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_slalom",
    number: 3,
    code: "2C",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Zig Zag",
    unit: "s + penalización",
    kind: "time",
    conversion: "manual",
    attempts: 4,
    attemptLabels: ["Izq 1", "Izq 2", "Der 1", "Der 2"],
    setup: "Conos en zig zag; 10 m de ida y 10 m de vuelta.",
    execution:
      "Dos intentos por lado (izquierda y derecha). Conducir 10 m de ida y 10 m de vuelta.",
    record: "Tiempo de cada intento; +1 s por cono; +2 s si pierde el balón a más de 1 m.",
    indicatorId: "conduccion",
    relevanceDefault: 2,
  }),
  t({
    id: "ini_c_pase",
    number: 4,
    code: "2D",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Pase de precisión",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 10,
    setup: "Puerta de 1.5 m; líneas de golpeo a 5 m, 10 m y 20 m.",
    execution:
      "En cada distancia: 10 pases (5 con cada pie), balón detenido. Registrar aciertos a 5, 10 y 20 m.",
    record: "Aciertos a 5 m, 10 m y 20 m; aciertos por pie; porcentaje bilateral.",
    indicatorId: "pase",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_recepcion",
    number: 5,
    code: "2E",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Control fijo y orientado elevado",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 6,
    attemptLabels: [
      "Fijo muslo 20 m",
      "Orientado muslo 20 m",
      "Fijo pecho 20 m",
      "Orientado pecho 20 m",
      "Fijo pie 20 m",
      "Orientado pie 20 m",
    ],
    maxPoints: 6,
    setup: "Servicio elevado a 20 m; muslo, pecho y pie.",
    execution:
      "En cada superficie (muslo, pecho y pie) a 20 m: una medición de control fijo y otra de control orientado. Un intento cada una.",
    record: "Rúbrica 0–6: control fijo y control orientado en muslo, pecho y pie a 20 m.",
    indicatorId: "recepcion",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_tiro",
    number: 6,
    code: "2G",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Tiro a gol en movimiento",
    unit: "precisión + potencia · 11 / 16.5 / 20 m · izq y der",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 8,
    setup: "Conducción corta; líneas a 11 m, 16.5 m y 20 m; ambos perfiles.",
    execution:
      "En cada distancia: tiro en movimiento con derecha y con izquierda. Precisión y potencia.",
    record: "Precisión y potencia a 11 m, 16.5 m y 20 m, izquierda y derecha.",
    indicatorId: "finalizacion",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_golpeo",
    number: 7,
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    retired: true,
    label: "Golpeo largo",
    unit: "m + corredor",
    kind: "distance",
    conversion: "manual",
    attempts: 5,
    setup: "Corredor de 8 m de ancho; marcas cada 5 m.",
    execution: "5 golpeos desde balón detenido. Medir primer bote.",
    record: "Metros por intento; mejor; promedio; dentro/fuera del corredor.",
    indicatorId: "golpeo",
    relevanceDefault: 2,
  }),
  t({
    id: "ini_c_sprint",
    number: 8,
    module: "campo",
    stage: "iniciacion",
    usage: "plus",
    retired: true,
    label: "Sprint 10 m",
    unit: "s",
    kind: "time",
    conversion: "manual",
    attempts: 2,
    setup: "Salida fija; línea a 10 m; cámara lateral.",
    execution: "Dos intentos; 60 s de recuperación.",
    record: "Tiempo de ambos intentos; conservar el mejor.",
    indicatorId: "velocidad",
    relevanceDefault: 2,
  }),
  t({
    id: "ini_c_duelo",
    number: 9,
    module: "campo",
    stage: "iniciacion",
    usage: "plus",
    retired: true,
    label: "Duelo 1 contra 1",
    unit: "éxitos / oportunidades",
    kind: "ratio",
    conversion: "accuracy",
    attempts: 0,
    setup: "Espacio 10 × 8 m; miniportería a 8 m.",
    execution: "6 ataques y 6 defensas; límite de 8 s por acción.",
    record: "Duelos ganados; tiros; pérdidas; recuperaciones.",
    indicatorId: "uno_contra_uno",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_juego",
    number: 10,
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    retired: true,
    label: "Juego aplicado",
    unit: "decisiones correctas / oportunidades",
    kind: "ratio",
    conversion: "accuracy",
    attempts: 0,
    setup: "3v3; 20 × 15 m; 6 min; grabar.",
    execution: "Juego libre. Registrar cada intervención relevante.",
    record: "Decisiones correctas/oportunidades; pases; progresiones; recuperaciones.",
    indicatorId: "toma_decisiones",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_dominadas",
    number: 1,
    code: "2A",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Dominadas alternadas",
    unit: "contactos / % pie menor",
    kind: "contacts",
    conversion: "contacts_des",
    attempts: 5,
    setup: "Zona 3 × 3 m; cronómetro.",
    execution: "5 intentos de 45 s; alternar derecho e izquierdo.",
    record: "Contactos; mejor; promedio; % de pie menos usado.",
    indicatorId: "conduccion",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_patrones",
    number: 2,
    code: "2B",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Conducción a velocidad",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 8,
    maxPoints: 6,
    setup: "Líneas a 5, 10, 20 y 30 m. 2 repeticiones por distancia (1 por perfil).",
    execution:
      "Por distancia (5, 10, 20, 30 m): un intento derecha y uno izquierda.",
    record: "Rúbrica por intento: 0 deficiente · 2 regular · 4 bueno · 6 óptimo.",
    indicatorId: "conduccion",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_slalom",
    number: 3,
    code: "2C",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Zig Zag",
    unit: "s + penalización",
    kind: "time",
    conversion: "manual",
    attempts: 4,
    attemptLabels: ["Izq 1", "Izq 2", "Der 1", "Der 2"],
    setup: "Conos en zig zag; 10 m de ida y 10 m de vuelta.",
    execution:
      "Dos intentos por lado (izquierda y derecha). Conducir 10 m de ida y 10 m de vuelta a máxima velocidad controlada.",
    record: "Tiempo de cada intento; +1 s por cono; +2 s por pérdida a más de 1 m.",
    indicatorId: "conduccion",
    relevanceDefault: 2,
  }),
  t({
    id: "des_c_pase",
    number: 4,
    code: "2D",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Pase de precisión",
    unit: "aciertos / 12",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 12,
    maxPoints: 12,
    setup: "Puerta de 1 m; líneas de golpeo a 5 m, 10 m y 20 m.",
    execution:
      "En cada distancia: 12 pases (6 por pie), balón detenido. Registrar aciertos a 5, 10 y 20 m.",
    record: "Aciertos a 5 m, 10 m y 20 m; % por pie; diferencia bilateral.",
    indicatorId: "pase",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_control",
    number: 5,
    code: "2E",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Control fijo y orientado raso",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 4,
    attemptLabels: ["Fijo 5 m", "Orientado 5 m", "Fijo 10 m", "Orientado 10 m"],
    maxPoints: 6,
    setup: "Servicio raso; zonas de control a 5 m y 10 m.",
    execution:
      "En cada distancia (5 m y 10 m): una medición de control fijo y otra de control orientado. Un intento cada una.",
    record: "Rúbrica 0–6: control fijo y control orientado a 5 m y a 10 m.",
    indicatorId: "control_orientado",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_tiro",
    number: 6,
    code: "2G",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Tiro a gol en movimiento",
    unit: "precisión + potencia · 11 / 16.5 / 20 m · izq y der",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 8,
    setup: "Conducción corta; líneas a 11 m, 16.5 m y 20 m; ambos perfiles.",
    execution:
      "En cada distancia: tiro en movimiento con derecha y con izquierda. Precisión y potencia.",
    record: "Precisión y potencia a 11 m, 16.5 m y 20 m, izquierda y derecha.",
    indicatorId: "finalizacion",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_tiro_gol",
    number: 7,
    code: "2G",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Tiro a gol fijo",
    unit: "precisión + potencia · 11 / 16.5 / 20 m · izq y der",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 8,
    setup:
      "Balón detenido; distancias 11 m (penal), 16.5 m (fuera de área) y 20 m; ambos perfiles; radar opcional.",
    execution:
      "En cada distancia: tiro a gol fijo con derecha y con izquierda. Precisión y potencia.",
    record: "Precisión y potencia a 11 m, 16.5 m y 20 m, izquierda y derecha.",
    indicatorId: "finalizacion",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_largo",
    number: 8,
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    retired: true,
    label: "Pase largo",
    unit: "puntos / 18",
    kind: "points",
    conversion: "accuracy",
    attempts: 6,
    maxPoints: 18,
    setup: "Objetivo 5 × 5 m a 20–25 m; corredor de 10 m.",
    execution: "6 golpeos: 3 por pie.",
    record: "3 dentro; 2 a menos de 3 m; 1 corredor; 0 fuera.",
    indicatorId: "pase",
    relevanceDefault: 2,
  }),
  t({
    id: "des_c_5105",
    number: 9,
    module: "campo",
    stage: "desarrollo",
    usage: "plus",
    retired: true,
    label: "Cambio 5-0-5",
    unit: "s",
    kind: "time",
    conversion: "manual",
    attempts: 2,
    setup: "Líneas a 5 m; circuito 5-0-5.",
    execution: "Dos cambios de dirección (un intento por lado).",
    record: "Tiempos; mejor marca; diferencia derecha/izquierda.",
    indicatorId: "velocidad",
    relevanceDefault: 2,
  }),
  t({
    id: "des_c_illinois",
    number: 10,
    module: "campo",
    stage: "desarrollo",
    usage: "plus",
    retired: true,
    label: "Prueba de Illinois",
    unit: "s",
    kind: "time",
    conversion: "manual",
    attempts: 2,
    setup: "Circuito Illinois marcado.",
    execution: "Dos intentos; recuperación completa entre marcas.",
    record: "Tiempos; conservar el mejor.",
    indicatorId: "velocidad",
    relevanceDefault: 2,
  }),
  t({
    id: "des_c_duelo",
    number: 11,
    module: "campo",
    stage: "desarrollo",
    usage: "plus",
    retired: true,
    label: "Duelo por función",
    unit: "% éxito ataque / defensa",
    kind: "ratio",
    conversion: "accuracy",
    attempts: 0,
    setup: "Espacio 12 × 8 m; portería; límite 8 s.",
    execution: "8 ataques y 8 defensas.",
    record: "% éxito ofensivo; % defensivo; acción dominante.",
    indicatorId: "uno_contra_uno",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_juego",
    number: 12,
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    retired: true,
    label: "Juego aplicado",
    unit: "decisiones correctas / oportunidades",
    kind: "ratio",
    conversion: "accuracy",
    attempts: 0,
    setup: "3v3 o 4v4; 25 × 18 m; 8 min; grabar.",
    execution: "Juego libre. Codificar decisiones con y sin balón.",
    record: "Correctas/oportunidades; progresiones; pérdidas; recuperaciones; escaneos.",
    indicatorId: "toma_decisiones",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_p_posicion",
    retired: true,
    number: 1,
    module: "portero",
    stage: "iniciacion",
    usage: "esencial",
    label: "Posición básica",
    unit: "criterios / 10",
    kind: "ratio",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "Zona central; señal visual; cámara frontal.",
    execution: "Adoptar posición ante 10 señales.",
    record: "Criterios cumplidos: pies, flexión, tronco, manos y equilibrio.",
    indicatorId: "posicion_base",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_p_desplaza",
    retired: true,
    number: 2,
    module: "portero",
    stage: "iniciacion",
    usage: "esencial",
    label: "Desplazamiento + armado",
    unit: "s / errores",
    kind: "time",
    conversion: "manual",
    attempts: 12,
    setup: "Conos a 2 m de cada lado.",
    execution: "Tocar cono, regresar y armar. 6 por lado.",
    record: "Tiempo; armado antes del estímulo; pérdidas de equilibrio.",
    indicatorId: "desplazamientos",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_p_blocaje",
    retired: true,
    number: 3,
    module: "portero",
    stage: "iniciacion",
    usage: "esencial",
    label: "Blocaje frontal",
    unit: "limpios / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 10,
    setup: "Servicios desde 5 m a tres alturas.",
    execution: "10 servicios válidos; repetir los que salgan de zona.",
    record: "Blocaje limpio; segundo contacto; rebote peligroso.",
    indicatorId: "blocaje_recepcion",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_p_raso",
    retired: true,
    number: 4,
    module: "portero",
    stage: "iniciacion",
    usage: "esencial",
    label: "Balón raso + caída",
    unit: "puntos / 16",
    kind: "points",
    conversion: "accuracy",
    attempts: 8,
    maxPoints: 16,
    setup: "Servicios a 5–6 m; cuatro por lado.",
    execution: "8 acciones alternadas, con recuperación completa.",
    record: "2 blocaje; 1 desvío seguro; 0 gol/rebote peligroso.",
    indicatorId: "caidas_desvios",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_p_colocacion",
    retired: true,
    number: 5,
    module: "portero",
    stage: "iniciacion",
    usage: "plus",
    label: "Colocación",
    unit: "correctas / 8",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 8,
    maxPoints: 8,
    setup: "Tres ángulos marcados; 8 tiros controlados.",
    execution: "Portero se coloca antes de cada golpeo.",
    record: "Posición inicial correcta; resultado; rebote.",
    indicatorId: "lectura_mando",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_p_1v1",
    retired: true,
    number: 6,
    module: "portero",
    stage: "iniciacion",
    usage: "plus",
    label: "Mano a mano",
    unit: "atajos / 6",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 6,
    maxPoints: 6,
    setup: "Atacante inicia a 8 m; portería.",
    execution: "6 acciones; atacante dispone de 6 s.",
    record: "Atajada; salida correcta; reducción de ángulo.",
    indicatorId: "uno_contra_uno_gk",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_p_reaccion",
    retired: true,
    number: 7,
    module: "portero",
    stage: "iniciacion",
    usage: "plus",
    label: "Reacción",
    unit: "atajos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 10,
    setup: "Rebounder; servicio desde zona fija.",
    execution: "10 servicios válidos.",
    record: "Atajadas; contacto; tiempo por video si es posible.",
    indicatorId: "atencion",
    relevanceDefault: 2,
  }),
  t({
    id: "ini_p_mano",
    retired: true,
    number: 8,
    module: "portero",
    stage: "iniciacion",
    usage: "esencial",
    label: "Distribución con mano",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 10,
    setup: "Objetivo 2 × 2 m a 7 m.",
    execution: "10 lanzamientos: 5 por lado.",
    record: "Aciertos; distancia al centro; técnica.",
    indicatorId: "distribucion",
    relevanceDefault: 2,
  }),
  t({
    id: "ini_p_pie",
    retired: true,
    number: 9,
    module: "portero",
    stage: "iniciacion",
    usage: "esencial",
    label: "Pase con pie",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 10,
    setup: "Puerta 1.5 m a 8 m.",
    execution: "10 pases: 5 por pie.",
    record: "Aciertos; % por pie; tiempo de preparación.",
    indicatorId: "distribucion",
    relevanceDefault: 2,
  }),
  t({
    id: "ini_p_despeje",
    retired: true,
    number: 10,
    module: "portero",
    stage: "iniciacion",
    usage: "esencial",
    label: "Despeje",
    unit: "m + corredor",
    kind: "distance",
    conversion: "manual",
    attempts: 5,
    setup: "Corredor de 8 m; marcas cada 5 m.",
    execution: "5 golpeos desde balón detenido.",
    record: "Distancia al primer bote; mejor; promedio; precisión.",
    indicatorId: "golpeo",
    relevanceDefault: 2,
  }),
  t({
    id: "ini_p_tiro_gol",
    number: 11,
    code: "4H",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "iniciacion",
    usage: "esencial",
    label: "Tiro a gol fijo",
    unit: "precisión + potencia · 11 / 16.5 / 20 m · izq y der",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 8,
    setup:
      "Balón detenido; distancias 11 m (penal), 16.5 m (fuera de área) y 20 m; ambos perfiles; radar opcional.",
    execution:
      "En cada distancia: tiro a gol fijo con derecha y con izquierda. Precisión y potencia.",
    record: "Precisión y potencia a 11 m, 16.5 m y 20 m, izquierda y derecha.",
    indicatorId: "golpeo",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_pies",
    retired: true,
    number: 1,
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Pies, armado y atajada",
    unit: "s / atajos",
    kind: "time",
    conversion: "manual",
    attempts: 8,
    setup: "Conos a 3 m; tiro después del regreso.",
    execution: "8 secuencias alternadas.",
    record: "Tiempo de armado; atajada; equilibrio.",
    indicatorId: "posicion_base",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_blocaje",
    retired: true,
    number: 2,
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Blocaje por alturas",
    unit: "limpios / 12",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 12,
    maxPoints: 12,
    setup: "Servicios desde 8 m: rasos, medios y altos.",
    execution: "12 servicios válidos.",
    record: "Blocaje limpio; segundo contacto; rebote.",
    indicatorId: "blocaje_recepcion",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_caidas",
    retired: true,
    number: 3,
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Caídas y vuelos",
    unit: "atajos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 10,
    setup: "Cinco balones por lado desde 7–9 m.",
    execution: "10 acciones con recuperación completa.",
    record: "Atajada; alcance; dirección del desvío; técnica.",
    indicatorId: "caidas_desvios",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_aereo",
    retired: true,
    number: 4,
    module: "portero",
    stage: "desarrollo",
    usage: "plus",
    label: "Juego aéreo",
    unit: "puntos / 16",
    kind: "points",
    conversion: "accuracy",
    attempts: 8,
    maxPoints: 16,
    setup: "Centros desde dos puntos fijos.",
    execution: "8 centros: 4 por lado.",
    record: "2 blocaje; 1 despeje seguro; 0 error. Decisión de salida.",
    indicatorId: "juego_aereo",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_segunda",
    retired: true,
    number: 5,
    module: "portero",
    stage: "desarrollo",
    usage: "plus",
    label: "Segunda acción",
    unit: "éxitos / 8",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 8,
    maxPoints: 8,
    setup: "Primer tiro y rebote programado.",
    execution: "8 secuencias.",
    record: "Primera respuesta; levantada; segunda atajada; tiempo.",
    indicatorId: "caidas_desvios",
    relevanceDefault: 2,
  }),
  t({
    id: "des_p_1v1",
    retired: true,
    number: 6,
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Mano a mano",
    unit: "atajos / 8",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 8,
    maxPoints: 8,
    setup: "Atacante inicia a 10–12 m.",
    execution: "8 acciones; máximo 6 s.",
    record: "Atajada; momento de salida; reducción de ángulo.",
    indicatorId: "uno_contra_uno_gk",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_reaccion",
    retired: true,
    number: 7,
    module: "portero",
    stage: "desarrollo",
    usage: "plus",
    label: "Reacción",
    unit: "atajos / 12",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 12,
    maxPoints: 12,
    setup: "Rebounder o doble balón; zona de servicio fija.",
    execution: "12 servicios válidos.",
    record: "Atajadas; contactos útiles; tiempo de respuesta.",
    indicatorId: "atencion",
    relevanceDefault: 2,
  }),
  t({
    id: "des_p_presion",
    retired: true,
    number: 8,
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Pase bajo presión",
    unit: "aciertos / 12",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 12,
    maxPoints: 12,
    setup: "Tres puertas a 10–15 m; señal después de recibir.",
    execution: "12 pases tras cesión.",
    record: "Elección; precisión; tiempo desde control hasta pase.",
    indicatorId: "distribucion",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_mano",
    retired: true,
    number: 9,
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Distribución con mano",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 10,
    setup: "Objetivos 2 × 2 m a 12 y 15 m.",
    execution: "10 lanzamientos: 5 por zona.",
    record: "Aciertos; distancia al centro; perfil.",
    indicatorId: "distribucion",
    relevanceDefault: 2,
  }),
  t({
    id: "des_p_saque",
    retired: true,
    number: 10,
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Saque de meta",
    unit: "km/h + m + corredor",
    kind: "distance",
    conversion: "manual",
    attempts: 5,
    setup: "Corredor de 10 m; marcas cada 5 m.",
    execution: "5 golpeos desde balón detenido. Radar opcional.",
    record: "Radar km/h; primer bote; precisión.",
    indicatorId: "distribucion",
    relevanceDefault: 2,
  }),
  t({
    id: "des_p_volea",
    retired: true,
    number: 11,
    module: "portero",
    stage: "desarrollo",
    usage: "plus",
    label: "Volea desde manos",
    unit: "m + corredor",
    kind: "distance",
    conversion: "manual",
    attempts: 5,
    setup: "Mismo corredor de 10 m.",
    execution: "5 despejes de volea.",
    record: "Primer bote; promedio; mejor; dentro/fuera.",
    indicatorId: "distribucion",
    relevanceDefault: 2,
  }),
  t({
    id: "des_p_juego",
    retired: true,
    number: 12,
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Juego aplicado",
    unit: "decisiones correctas / oportunidades",
    kind: "ratio",
    conversion: "accuracy",
    attempts: 0,
    setup: "Partido 5v5; 10 min; grabar.",
    execution: "Registrar intervenciones con y sin balón.",
    record: "Apoyos; comunicación; salidas; decisiones; distribución.",
    indicatorId: "lectura_mando",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_conduccion",
    number: 13,
    code: "4E",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Conducción a velocidad",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 8,
    maxPoints: 6,
    setup: "Líneas a 5, 10, 20 y 30 m. 2 repeticiones por distancia (1 por perfil).",
    execution:
      "Por distancia (5, 10, 20, 30 m): un intento derecha y uno izquierda.",
    record: "Rúbrica por intento: 0 deficiente · 2 regular · 4 bueno · 6 óptimo.",
    indicatorId: "conduccion",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_dominadas",
    retired: true,
    number: 14,
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Dominadas alternadas",
    unit: "contactos / % pie menor",
    kind: "contacts",
    conversion: "contacts_des",
    attempts: 5,
    setup: "Zona 3 × 3 m; cronómetro.",
    execution: "5 intentos de 45 s; alternar derecho e izquierdo.",
    record: "Contactos; mejor; promedio; % de pie menos usado.",
    indicatorId: "conduccion",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_pase",
    number: 15,
    code: "4B",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Pase de precisión",
    unit: "aciertos / 12",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 12,
    maxPoints: 12,
    setup: "Puerta de 1 m; líneas de golpeo a 5 m, 10 m y 20 m.",
    execution:
      "En cada distancia: 12 pases (6 por pie), balón detenido. Registrar aciertos a 5, 10 y 20 m.",
    record: "Aciertos a 5 m, 10 m y 20 m; % por pie; diferencia bilateral.",
    indicatorId: "pase",
    relevanceDefault: 3,
  }),
  t({
    id: "des_p_tiro_gol",
    number: 16,
    code: "4H",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "desarrollo",
    usage: "esencial",
    label: "Tiro a gol fijo",
    unit: "precisión + potencia · 11 / 16.5 / 20 m · izq y der",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 8,
    setup:
      "Balón detenido; distancias 11 m (penal), 16.5 m (fuera de área) y 20 m; ambos perfiles; radar opcional.",
    execution:
      "En cada distancia: tiro a gol fijo con derecha y con izquierda. Precisión y potencia.",
    record: "Precisión y potencia a 11 m, 16.5 m y 20 m, izquierda y derecha.",
    indicatorId: "golpeo",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_bloq_bajo_perfilado",
    number: 1,
    code: "1A",
    section: "tecnicas",
    subsection: gkSub("bloqueo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Bloqueo bajo perfilado",
    unit: "1–10",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "Un bloque de 10 repeticiones. Bloqueo bajo con perfil.",
    execution: "10 repeticiones. Calificar de 1 a 10 el bloque completo.",
    record: "Calificación 1–10 del bloque.",
    indicatorId: "blocaje_recepcion",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_bloq_bajo_europeo",
    number: 2,
    code: "1B",
    section: "tecnicas",
    subsection: gkSub("bloqueo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Bloqueo bajo europeo",
    unit: "1–10",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "Un bloque de 10 repeticiones. Bloqueo bajo estilo europeo.",
    execution: "10 repeticiones. Calificar de 1 a 10 el bloque completo.",
    record: "Calificación 1–10 del bloque.",
    indicatorId: "blocaje_recepcion",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_bloq_medio",
    number: 3,
    code: "1C",
    section: "tecnicas",
    subsection: gkSub("bloqueo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Bloqueo medio",
    unit: "1–10",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "Un bloque de 10 repeticiones. Bloqueo a media altura.",
    execution: "10 repeticiones. Calificar de 1 a 10 el bloque completo.",
    record: "Calificación 1–10 del bloque.",
    indicatorId: "blocaje_recepcion",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_bloq_frontal",
    number: 4,
    code: "1D",
    section: "tecnicas",
    subsection: gkSub("bloqueo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Bloqueo frontal",
    unit: "1–10",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "Un bloque de 10 repeticiones. Bloqueo frontal.",
    execution: "10 repeticiones. Calificar de 1 a 10 el bloque completo.",
    record: "Calificación 1–10 del bloque.",
    indicatorId: "blocaje_recepcion",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_bloq_boliche",
    number: 5,
    code: "1E",
    section: "tecnicas",
    subsection: gkSub("bloqueo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Reinicio de boliche y rotación",
    unit: "1–10",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "Un bloque de 10 repeticiones. Acción de reinicio de boliche y rotación.",
    execution: "10 repeticiones. Calificar de 1 a 10 el bloque completo.",
    record: "Calificación 1–10 del bloque.",
    indicatorId: "blocaje_recepcion",
    relevanceDefault: 2,
  }),
  t({
    id: "gk_rechace_1palma",
    number: 1,
    code: "2A",
    section: "tecnicas",
    subsection: gkSub("recueste"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Rechace a 1 palma",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "Servicios a cada lado. 5 izquierdo y 5 derechos.",
    execution: "5 repeticiones por lado. Rechace con una palma.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "caidas_desvios",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_rechace_2palmas",
    number: 2,
    code: "2B",
    section: "tecnicas",
    subsection: gkSub("recueste"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Rechace a 2 palmas",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "Servicios a cada lado. 5 izquierdo y 5 derechos.",
    execution: "5 repeticiones por lado. Rechace con dos palmas.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "caidas_desvios",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_recueste_1palma",
    number: 3,
    code: "2C",
    section: "tecnicas",
    subsection: gkSub("recueste"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Recueste a 1 palma (bote picado)",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "Bote picado. 5 izquierdo y 5 derechos.",
    execution: "5 repeticiones por lado. Recueste con una palma.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "caidas_desvios",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_recueste_2palmas",
    number: 4,
    code: "2D",
    section: "tecnicas",
    subsection: gkSub("recueste"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Recueste a 2 palmas (bote picado)",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "Bote picado. 5 izquierdo y 5 derechos.",
    execution: "5 repeticiones por lado. Recueste con dos palmas.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "caidas_desvios",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_recueste_raso",
    number: 5,
    code: "2E",
    section: "tecnicas",
    subsection: gkSub("recueste"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Recueste raso",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "Servicio raso. 5 izquierdo y 5 derechos.",
    execution: "5 repeticiones por lado. Recueste a ras de suelo.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "caidas_desvios",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_recueste_media",
    number: 6,
    code: "2E",
    section: "tecnicas",
    subsection: gkSub("recueste"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Recueste media altura",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "Servicio a media altura. 5 izquierdo y 5 derechos.",
    execution: "5 repeticiones por lado. Recueste a media altura.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "caidas_desvios",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_recueste_vuelo",
    number: 7,
    code: "2E",
    section: "tecnicas",
    subsection: gkSub("recueste"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Recueste fase de vuelo",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "Servicio en fase de vuelo. 5 izquierdo y 5 derechos.",
    execution: "5 repeticiones por lado. Recueste en el aire.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "caidas_desvios",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_aereo_abajo_arriba",
    number: 1,
    code: "3A",
    section: "tecnicas",
    subsection: gkSub("aereo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Abajo hacia arriba",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "10 servicios de trayectoria de abajo hacia arriba.",
    execution: "10 repeticiones. Juego aéreo de abajo hacia arriba.",
    record: "Aciertos sobre 10.",
    indicatorId: "juego_aereo",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_aereo_arriba_abajo",
    number: 2,
    code: "3B",
    section: "tecnicas",
    subsection: gkSub("aereo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Arriba hacia abajo",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "10 servicios de trayectoria de arriba hacia abajo.",
    execution: "10 repeticiones. Juego aéreo de arriba hacia abajo.",
    record: "Aciertos sobre 10.",
    indicatorId: "juego_aereo",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_fildeo_corto",
    number: 3,
    code: "3C",
    section: "tecnicas",
    subsection: gkSub("aereo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Fildeo corto (frontal)",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "10 repeticiones. Fildeo corto frontal.",
    execution: "10 acciones de fildeo corto de frente.",
    record: "Aciertos sobre 10.",
    indicatorId: "juego_aereo",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_fildeo_medio",
    number: 4,
    code: "3C",
    section: "tecnicas",
    subsection: gkSub("aereo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Fildeo medio (frontal)",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "10 repeticiones. Fildeo medio frontal.",
    execution: "10 acciones de fildeo medio de frente.",
    record: "Aciertos sobre 10.",
    indicatorId: "juego_aereo",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_fildeo_largo",
    number: 5,
    code: "3C",
    section: "tecnicas",
    subsection: gkSub("aereo"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Fildeo largo (frontal)",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 10,
    setup: "10 repeticiones. Fildeo largo frontal.",
    execution: "10 acciones de fildeo largo de frente.",
    record: "Aciertos sobre 10.",
    indicatorId: "juego_aereo",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_circulacion_corta",
    number: 1,
    code: "4A",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Circulación corta",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "10 acciones, 5 con cada pie. Circulación corta.",
    execution: "5 pases cortos por pie.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "distribucion",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_circulacion_media",
    number: 2,
    code: "4A",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Circulación media",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "10 acciones, 5 con cada pie. Circulación media.",
    execution: "5 pases medios por pie.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "distribucion",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_circulacion_larga",
    number: 3,
    code: "4A",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Circulación larga",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "10 acciones, 5 con cada pie. Circulación larga.",
    execution: "5 pases largos por pie.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "distribucion",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_pase_elevado",
    number: 4,
    code: "4C",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Pase elevado",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "10 acciones, 5 con cada pie. Pase elevado.",
    execution: "5 pases elevados por pie.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "distribucion",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_pase_volea",
    number: 5,
    code: "4D",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Pase de volea largo",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "10 acciones, 5 con cada pie. Volea larga.",
    execution: "5 voleas largas por pie.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "distribucion",
    relevanceDefault: 2,
  }),
  t({
    id: "gk_control_fijo",
    number: 6,
    code: "4F",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Control fijo",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "10 acciones, 5 con cada pie. Control fijo.",
    execution: "5 controles fijos por pie.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "control_orientado",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_control_orientado",
    number: 7,
    code: "4F",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Control orientado",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "10 acciones, 5 con cada pie. Control orientado.",
    execution: "5 controles orientados por pie.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "control_orientado",
    relevanceDefault: 3,
  }),
  t({
    id: "gk_rompimiento",
    number: 8,
    code: "4G",
    section: "tecnicas",
    subsection: gkSub("pies"),
    module: "portero",
    stage: "ambos",
    usage: "esencial",
    label: "Rompimiento de primera",
    unit: "aciertos / 5 por pie",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 5,
    setup: "10 acciones, 5 con cada pie. Rompimiento de primera.",
    execution: "5 rompimientos de primera por pie.",
    record: "Aciertos por pie (5 izq y 5 der).",
    indicatorId: "golpeo",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_patrones",
    number: 2,
    code: "2B",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Conducción a velocidad",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 8,
    maxPoints: 6,
    setup: "Líneas a 5, 10, 20 y 30 m. 2 repeticiones por distancia (1 por perfil).",
    execution: "Por distancia (5, 10, 20, 30 m): un intento derecha y uno izquierda.",
    record: "Rúbrica por intento: 0 deficiente · 2 regular · 4 bueno · 6 óptimo.",
    indicatorId: "conduccion",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_tiro_gol",
    number: 7,
    code: "2G",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Tiro a gol fijo",
    unit: "precisión + potencia · 11 / 16.5 / 20 m · izq y der",
    kind: "points",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 8,
    setup:
      "Balón detenido; distancias 11 m (penal), 16.5 m (fuera de área) y 20 m; ambos perfiles; radar opcional.",
    execution:
      "En cada distancia: tiro a gol fijo con derecha y con izquierda. Precisión y potencia.",
    record: "Precisión y potencia a 11 m, 16.5 m y 20 m, izquierda y derecha.",
    indicatorId: "finalizacion",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_dribling",
    number: 8,
    code: "2F",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Dribling 5 m",
    unit: "s",
    kind: "time",
    conversion: "manual",
    attempts: 8,
    attemptLabels: [
      "Dinámica der 1",
      "Dinámica der 2",
      "Dinámica izq 1",
      "Dinámica izq 2",
      "Estática der 1",
      "Estática der 2",
      "Estática izq 1",
      "Estática izq 2",
    ],
    setup: "Línea de 5 m; dribling dinámica y estática, ambos perfiles.",
    execution: "Dos intentos de cada variante: dinámica e izquierda/derecha; estática e izquierda/derecha.",
    record: "Tiempo de cada intento (2 por variante).",
    indicatorId: "uno_contra_uno",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_dribling",
    number: 8,
    code: "2F",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Dribling 5 m",
    unit: "s",
    kind: "time",
    conversion: "manual",
    attempts: 8,
    attemptLabels: [
      "Dinámica der 1",
      "Dinámica der 2",
      "Dinámica izq 1",
      "Dinámica izq 2",
      "Estática der 1",
      "Estática der 2",
      "Estática izq 1",
      "Estática izq 2",
    ],
    setup: "Línea de 5 m; dribling dinámica y estática, ambos perfiles.",
    execution: "Dos intentos de cada variante: dinámica e izquierda/derecha; estática e izquierda/derecha.",
    record: "Tiempo de cada intento (2 por variante).",
    indicatorId: "uno_contra_uno",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_control_elevado",
    number: 5,
    code: "2E",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Control fijo y orientado elevado",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 6,
    attemptLabels: [
      "Fijo muslo 20 m",
      "Orientado muslo 20 m",
      "Fijo pecho 20 m",
      "Orientado pecho 20 m",
      "Fijo pie 20 m",
      "Orientado pie 20 m",
    ],
    maxPoints: 6,
    setup: "Servicio elevado a 20 m; muslo, pecho y pie.",
    execution:
      "En cada superficie (muslo, pecho y pie) a 20 m: una medición de control fijo y otra de control orientado. Un intento cada una.",
    record: "Rúbrica 0–6: control fijo y control orientado en muslo, pecho y pie a 20 m.",
    indicatorId: "recepcion",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_fildeo",
    number: 9,
    code: "2H",
    section: "tecnicas",
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Fildeo",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 4,
    attemptLabels: ["Pie izq", "Pie der", "Cabeza izq", "Cabeza der"],
    maxPoints: 6,
    setup: "Servicios a pie y de cabeza, ambos lados.",
    execution: "Un intento de fildeo con pie izquierdo, pie derecho, cabeza izquierda y cabeza derecha.",
    record: "Rúbrica 0–6 de cada fildeo (1 intento).",
    indicatorId: "recepcion",
    relevanceDefault: 2,
  }),
  t({
    id: "des_c_fildeo",
    number: 9,
    code: "2H",
    section: "tecnicas",
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Fildeo",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 4,
    attemptLabels: ["Pie izq", "Pie der", "Cabeza izq", "Cabeza der"],
    maxPoints: 6,
    setup: "Servicios a pie y de cabeza, ambos lados.",
    execution: "Un intento de fildeo con pie izquierdo, pie derecho, cabeza izquierda y cabeza derecha.",
    record: "Rúbrica 0–6 de cada fildeo (1 intento).",
    indicatorId: "recepcion",
    relevanceDefault: 2,
  }),
  t({
    id: "gph_semaforo",
    number: 1,
    code: "3A",
    section: "coordinativas",
    module: "campo",
    appliesTo: ["campo", "portero"],
    stage: "ambos",
    usage: "esencial",
    label: "Prueba del semáforo",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 1,
    maxPoints: 6,
    setup: "Tres estímulos de color (rojo / amarillo / verde) visibles de frente. Distancia de 8–10 m.",
    execution:
      "Un intento. Rojo = frenar; amarillo = cambiar de dirección; verde = acelerar. El estímulo sale sin aviso.",
    record: "Rúbrica 0–6: reacción, elección y control del cuerpo. 1 intento.",
    indicatorId: "coordinacion",
    relevanceDefault: 2,
  }),
  t({
    id: "gph_perfiles",
    number: 2,
    code: "3B",
    section: "coordinativas",
    module: "campo",
    appliesTo: ["campo", "portero"],
    stage: "ambos",
    usage: "esencial",
    label: "Perfiles condicionados",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 1,
    maxPoints: 6,
    setup: "Señal de mano o color para abrir, cerrar o cambiar de perfil. Espacio 6 × 6 m.",
    execution:
      "Un intento. El jugador recibe el estímulo y adopta el perfil pedido antes del siguiente contacto.",
    record: "Rúbrica 0–6: velocidad de orientación y perfil útil. 1 intento.",
    indicatorId: "coordinacion",
    relevanceDefault: 2,
  }),
  t({
    id: "gph_marcha",
    number: 3,
    code: "3C",
    section: "coordinativas",
    module: "campo",
    appliesTo: ["campo", "portero"],
    stage: "ambos",
    usage: "esencial",
    label: "Marcha",
    unit: "s",
    kind: "time",
    conversion: "manual",
    attempts: 6,
    attemptLabels: [
      "Unipodal der 1",
      "Unipodal der 2",
      "Unipodal izq 1",
      "Unipodal izq 2",
      "Bipodal 1",
      "Bipodal 2",
    ],
    setup: "Línea de 10 m. Unipodal: apoyos de una pierna. Bipodal: ambos pies.",
    execution:
      "Dos intentos de unipodal derecha, unipodal izquierda y bipodal. Recorrer la línea sin perder el patrón.",
    record: "Tiempo en segundos de cada intento (mejor = más bajo). Anotar tropiezos en la nota.",
    indicatorId: "coordinacion",
    relevanceDefault: 2,
  }),
  t({
    id: "gph_giros",
    number: 4,
    code: "3D",
    section: "coordinativas",
    module: "campo",
    appliesTo: ["campo", "portero"],
    stage: "ambos",
    usage: "esencial",
    label: "Giros",
    unit: "rúbrica 0–6",
    kind: "contacts",
    conversion: "rubric_06",
    attempts: 6,
    maxPoints: 6,
    attemptLabels: [
      "Marometa frente 1",
      "Marometa frente 2",
      "Marometa atrás 1",
      "Marometa atrás 2",
      "Pérdida de orientación 1",
      "Pérdida de orientación 2",
    ],
    setup: "Colchoneta o zona segura. Pérdida de orientación: giro 360° y reorientar a un estímulo.",
    execution:
      "Dos intentos de marometa al frente, marometa atrás y pérdida de orientación (giro y reencontrar el frente).",
    record: "Rúbrica 0–6 por intento: control, alineación y reorientación.",
    indicatorId: "coordinacion",
    relevanceDefault: 2,
  }),
  t({
    id: "gph_memoria_corto",
    number: 1,
    code: "4A",
    section: "cognitivas",
    module: "campo",
    appliesTo: ["campo", "portero"],
    stage: "ambos",
    usage: "esencial",
    label: "Memoria de corto plazo",
    unit: "aciertos / 6",
    kind: "contacts",
    conversion: "manual",
    attempts: 2,
    setup: "Secuencia de 6 elementos (colores, números o acciones) mostrada 8 s. Recuerdo inmediato.",
    execution: "Dos intentos con secuencias distintas. El jugador reproduce en orden.",
    record: "Aciertos en orden (0–6) de cada intento.",
    indicatorId: "atencion",
    relevanceDefault: 2,
  }),
  t({
    id: "gph_percepcion",
    number: 2,
    code: "4B",
    section: "cognitivas",
    module: "campo",
    appliesTo: ["campo", "portero"],
    stage: "ambos",
    usage: "esencial",
    label: "Percepción",
    unit: "aciertos / 5",
    kind: "contacts",
    conversion: "manual",
    attempts: 1,
    setup: "Escena de 5 s: compañeros, conos o puertas. Preguntar cantidad, lado o espacio libre.",
    execution: "Un intento. El jugador responde de memoria lo que vio.",
    record: "Aciertos (0–5) del intento.",
    indicatorId: "escaneo",
    relevanceDefault: 2,
  }),
  t({
    id: "gph_decisiones",
    number: 3,
    code: "4C",
    section: "cognitivas",
    module: "campo",
    appliesTo: ["campo", "portero"],
    stage: "ambos",
    usage: "esencial",
    label: "Toma de decisiones 5, 6 y 7",
    unit: "aciertos 0–1",
    kind: "contacts",
    conversion: "manual",
    attempts: 6,
    attemptLabels: [
      "Decisión 5 · 1",
      "Decisión 5 · 2",
      "Decisión 6 · 1",
      "Decisión 6 · 2",
      "Decisión 7 · 1",
      "Decisión 7 · 2",
    ],
    setup: "Tres escenarios GPH (5, 6 y 7): diagrama o video con 2–3 opciones de pase/desborde/retención.",
    execution: "Dos intentos por escenario. 1 = decisión correcta y a tiempo; 0 = incorrecta o tardía.",
    record: "0 o 1 en cada intento (2 por escenario 5, 6 y 7).",
    indicatorId: "toma_decisiones",
    relevanceDefault: 3,
  }),
  t({
    id: "gph_memoria_largo",
    number: 4,
    code: "4D",
    section: "cognitivas",
    module: "campo",
    appliesTo: ["campo", "portero"],
    stage: "ambos",
    usage: "esencial",
    label: "Memoria de largo plazo",
    unit: "aciertos / 6",
    kind: "contacts",
    conversion: "manual",
    attempts: 1,
    setup: "Misma secuencia de 4A, o consignas dadas al inicio de la sesión. Recuerdo al cierre (≥20 min).",
    execution: "Un intento de recuerdo diferido, sin volver a mostrar la secuencia.",
    record: "Aciertos en orden (0–6) del intento.",
    indicatorId: "atencion",
    relevanceDefault: 2,
  }),
  t({
    id: "gph_reglas",
    number: 1,
    code: "5A",
    section: "reglamentarias",
    module: "campo",
    appliesTo: ["campo", "portero"],
    stage: "ambos",
    usage: "esencial",
    label: "Las 17 reglas",
    unit: "reglas en orden",
    kind: "contacts",
    conversion: "accuracy",
    attempts: 0,
    maxPoints: 17,
    setup: "Sin material a la vista. El jugador enuncia las 17 reglas del juego en orden.",
    execution: "Anotar lo que dice en cada espacio. La clave del evaluador está debajo de cada campo.",
    record: "Las 17 reglas en orden. El 1–5 sale del acierto de secuencia; se puede ajustar a mano.",
    indicatorId: "ubicacion",
    relevanceDefault: 2,
  }),
];

export const GPH_PHYSICAL_TESTS = [
  {
    id: "salto_horizontal",
    label: "Salto horizontal",
    protocol: "3 intentos. Desde la línea hasta el talón posterior.",
    unit: "cm",
    attempts: 3,
    desarrolloOnly: false,
    legacy: true,
    indicatorId: "fuerza_estabilidad" as const,
  },
  {
    id: "equilibrio",
    label: "Equilibrio unipodal",
    protocol: "30 s por pierna. Contar apoyos, salto o salida de zona.",
    unit: "errores",
    attempts: 3,
    desarrolloOnly: false,
    legacy: true,
    indicatorId: "fuerza_estabilidad" as const,
  },
  {
    id: "sprint_5m",
    label: "Sprint 5 m",
    protocol: "2 intentos. Salida fija; cronometrar 5 m. Mejor marca; 60 s de recuperación.",
    unit: "s",
    attempts: 2,
    desarrolloOnly: false,
    code: "1A",
    group: "sprint" as const,
    indicatorId: "velocidad" as const,
  },
  {
    id: "sprint_10m",
    label: "Sprint 10 m",
    protocol: "2 intentos. Salida fija; cronometrar 10 m. Mejor marca; 60 s de recuperación.",
    unit: "s",
    attempts: 2,
    desarrolloOnly: false,
    code: "1A",
    group: "sprint" as const,
    indicatorId: "velocidad" as const,
  },
  {
    id: "sprint_20m",
    label: "Sprint 20 m",
    protocol: "2 intentos. Salida fija; cronometrar 20 m. Mejor marca; 60 s de recuperación.",
    unit: "s",
    attempts: 2,
    desarrolloOnly: false,
    code: "1A",
    group: "sprint" as const,
    indicatorId: "velocidad" as const,
  },
  {
    id: "sprint_30m",
    label: "Sprint 30 m",
    protocol: "2 intentos. Salida fija; cronometrar 30 m. Mejor marca; 60 s de recuperación.",
    unit: "s",
    attempts: 2,
    desarrolloOnly: false,
    code: "1A",
    group: "sprint" as const,
    indicatorId: "velocidad" as const,
  },
  {
    /** Capturas antiguas con Sprint 10/20 combinado. No se ofrece en formularios nuevos. */
    id: "sprint",
    label: "Sprint 10 / 20 m",
    protocol: "2 × 10 m y 2 × 20 m. Mejor marca; 60 s de recuperación.",
    unit: "s",
    attempts: 4,
    desarrolloOnly: false,
    legacy: true,
    indicatorId: "velocidad" as const,
  },
  {
    id: "cambio_5105",
    label: "Cambio 5-0-5",
    protocol: "2 intentos. Registrar diferencia derecha/izquierda.",
    unit: "s",
    attempts: 2,
    desarrolloOnly: false,
    code: "1B",
    indicatorId: "velocidad" as const,
  },
  {
    id: "illinois",
    label: "Prueba de Illinois",
    protocol: "2 intentos. Circuito Illinois; mejor marca.",
    unit: "s",
    attempts: 2,
    desarrolloOnly: false,
    code: "1C",
    indicatorId: "velocidad" as const,
  },
  {
    id: "movilidad_tobillo",
    label: "Movilidad de tobillo",
    protocol: "Rodilla a la pared. Talón sin despegar.",
    unit: "cm",
    attempts: 2,
    desarrolloOnly: false,
    legacy: true,
    indicatorId: "movilidad" as const,
  },
  {
    id: "resistencia_20",
    label: "Course Navette",
    protocol: "1 intento. Registrar el resultado del Course Navette.",
    unit: "nivel",
    attempts: 1,
    desarrolloOnly: false,
    code: "1D",
    indicatorId: "resistencia" as const,
  },
  {
    id: "fuerza_lagartijas",
    label: "Lagartijas",
    protocol: "1 intento. En 1 minuto, cuántas lagartijas.",
    unit: "rep",
    attempts: 1,
    desarrolloOnly: false,
    code: "1E",
    group: "fuerza" as const,
    indicatorId: "fuerza_estabilidad" as const,
  },
  {
    id: "fuerza_abdominales",
    label: "Abdominales",
    protocol: "1 intento. En 1 minuto, cuántos abdominales.",
    unit: "rep",
    attempts: 1,
    desarrolloOnly: false,
    code: "1E",
    group: "fuerza" as const,
    indicatorId: "fuerza_estabilidad" as const,
  },
  {
    id: "fuerza_espalda_baja",
    label: "Espalda baja",
    protocol: "1 intento. En 1 minuto, cuántas repeticiones de espalda baja.",
    unit: "rep",
    attempts: 1,
    desarrolloOnly: false,
    code: "1E",
    group: "fuerza" as const,
    indicatorId: "fuerza_estabilidad" as const,
  },
  {
    id: "fuerza_sentadillas",
    label: "Sentadillas",
    protocol: "1 intento. En 1 minuto, cuántas sentadillas.",
    unit: "rep",
    attempts: 1,
    desarrolloOnly: false,
    code: "1E",
    group: "fuerza" as const,
    indicatorId: "fuerza_estabilidad" as const,
  },
] as const;

export const GPH_PENALTIES = [
  "Cono tocado o derribado: +1 segundo.",
  "Cono omitido o balón perdido a más de 1 m: +2 segundos.",
  "Servicio fuera del área definida: intento inválido; se repite.",
  "Fatiga, dolor o mareo: detener; no completar a cualquier costo.",
  "Distancia de despeje: medir hasta el primer bote, no hasta que se detenga.",
] as const;

export const GPH_ROTATION_CAMPO = [
  { minutes: "1", title: "Físicas", detail: "Sprint, 505, Illinois, Navette y fuerza." },
  { minutes: "2", title: "Técnicas", detail: "Dominadas, conducción, zig zag, pase, control, dribling, tiro y fildeo." },
  { minutes: "3", title: "Coordinativas", detail: "Semáforo, perfiles, marcha y giros." },
  { minutes: "4", title: "Cognitivas", detail: "Memoria, percepción y toma de decisiones." },
  { minutes: "5", title: "Reglamentarias", detail: "Las 17 reglas en orden." },
] as const;

export const GPH_ROTATION_PORTERO = [
  { minutes: "1", title: "Físicas", detail: "Sprint, 505, Illinois, Navette y fuerza." },
  { minutes: "2", title: "Técnicas", detail: "Bloqueo, recueste, juego aéreo y juego de pies." },
  { minutes: "3", title: "Coordinativas", detail: "Semáforo, perfiles, marcha y giros." },
  { minutes: "4", title: "Cognitivas", detail: "Memoria, percepción y toma de decisiones." },
  { minutes: "5", title: "Reglamentarias", detail: "Las 17 reglas en orden." },
] as const;

export const GPH_WEEK_360 = [
  { day: 1, title: "Físicas", tests: "Sprint, cambio 505, Illinois, Course Navette y fuerza (1 min).", deliverable: "Marcas crudas." },
  { day: 2, title: "Técnicas", tests: "Dominadas, conducción, zig zag, pase, control, dribling, tiro a gol y fildeo.", deliverable: "Resultados técnicos." },
  { day: 3, title: "Coordinativas y cognitivas", tests: "Semáforo, perfiles, marcha, giros, memoria, percepción y decisiones 5-6-7.", deliverable: "Perfil coordinativo y mental." },
  { day: 4, title: "Reglamentarias y cierre", tests: "Las 17 reglas en orden; videos y reporte.", deliverable: "3–5 prioridades y plan." },
] as const;

export function protocolStageFromAssigned(
  stage: DiagnosisStage | null | undefined,
): GphProtocolStage {
  return stage === "desarrollo" || stage === "alto_rendimiento"
    ? "desarrollo"
    : "iniciacion";
}

/** U13+ usa batería Desarrollo; más chicos, Iniciación. */
export function protocolStageFromAge(age: number | null | undefined): GphProtocolStage {
  if (age == null || !Number.isFinite(age)) return "iniciacion";
  return age >= 13 ? "desarrollo" : "iniciacion";
}

export function testsForBattery(
  module: DiagnosisModule,
  stage: GphProtocolStage,
  sessionType: GphSessionType,
) {
  const sectionOrder = GPH_BATTERY_SECTIONS.map((item) => item.id);
  return GPH_STATION_TESTS.filter((test) => {
    if (test.retired) return false;
    const modules = test.appliesTo ?? [test.module];
    if (!modules.includes(module)) return false;
    if (test.stage !== "ambos" && test.stage !== stage) return false;
    if (sessionType === "esencial") return test.usage === "esencial";
    return true;
  }).slice()
    .sort((a, b) => {
      const as = a.section ? sectionOrder.indexOf(a.section) : 99;
      const bs = b.section ? sectionOrder.indexOf(b.section) : 99;
      if (as !== bs) return as - bs;
      const ac = a.code ?? "";
      const bc = b.code ?? "";
      if (ac !== bc) return ac.localeCompare(bc, "es", { numeric: true });
      return a.number - b.number || a.label.localeCompare(b.label, "es");
    });
}

export function testHeading(test: GphStationTest) {
  return test.code ? `${test.code}) ${test.label}` : `${test.number}. ${test.label}`;
}

export function emptyRuleSlots() {
  return Array.from({ length: GPH_REGULATION_RULE_COUNT }, () => "");
}

function normalizeRuleText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function regulationSlotMatches(slotIndex: number, spoken: string) {
  const rule = GPH_REGULATION_RULES[slotIndex];
  if (!rule) return false;
  const got = normalizeRuleText(spoken);
  if (got.length < 3) return false;
  const needles = [rule.title, ...rule.aliases].map(normalizeRuleText);
  return needles.some((needle) => {
    if (!needle) return false;
    if (got === needle) return true;
    if (got.includes(needle) && needle.length >= 4) return true;
    if (needle.includes(got) && got.length >= 8) return true;
    return false;
  });
}

export function regulationOrderHits(slots: string[] | undefined) {
  const values = slots ?? [];
  let hits = 0;
  for (let index = 0; index < GPH_REGULATION_RULE_COUNT; index += 1) {
    if (regulationSlotMatches(index, values[index] ?? "")) hits += 1;
  }
  return hits;
}

export function physicalTestsForSession(session: GphFieldSession) {
  return GPH_PHYSICAL_TESTS.filter(
    (item) =>
      !("legacy" in item && item.legacy) &&
      (!item.desarrolloOnly || session.protocolStage === "desarrollo"),
  );
}

export function isPhysicalCaptureComplete(
  test: (typeof GPH_PHYSICAL_TESTS)[number],
  capture: GphPhysicalCapture | undefined,
) {
  if (!capture) return false;
  const hasAttempt = capture.attempts.some((value) => value != null && Number.isFinite(value));
  return hasAttempt || capture.score != null;
}

export function emptyClosing(): GphSessionClosing {
  return {
    testsComplete: null,
    videosIdentified: null,
    dataLoaded: null,
    incidentsLogged: null,
    reportScheduled: null,
    feedbackDate: "",
  };
}

export function emptyTestCapture(test: GphStationTest): GphTestCapture {
  return {
    attempts: Array.from({ length: test.attempts }, () => null),
    hits: null,
    opportunities: test.maxPoints ?? null,
    errors: null,
    leftHits: null,
    rightHits: null,
    hits5m: null,
    hits10m: null,
    hits20m: null,
    shotDistances: {},
    ruleSlots: test.id === "gph_reglas" ? emptyRuleSlots() : [],
    radarKmh: null,
    score: null,
    relevance: test.relevanceDefault,
    flagged: false,
    note: "",
  };
}

export function emptyFieldSession(
  stage: GphProtocolStage = "iniciacion",
  sessionType: GphSessionType = "esencial",
): GphFieldSession {
  return {
    protocolStage: stage,
    sessionType,
    status: "draft",
    surface: "",
    weather: "",
    ballSize: "",
    ballPsi: "",
    venueCode: "",
    bibNumber: "",
    currentClub: "",
    familiarizationDone: null,
    regulationDistance: null,
    ballSurfaceLogged: null,
    keyTestsVideo: null,
    observation: "",
    incident: "",
    closing: emptyClosing(),
    tests: {},
    physical: {},
    evidence: [],
    coachBrief: null,
  };
}

export function isFieldSessionDraft(session: GphFieldSession | null | undefined) {
  return session?.status === "draft";
}

export function testNeedsBilateral(test: GphStationTest) {
  const text = `${test.record} ${test.execution} ${test.unit}`.toLowerCase();
  return (
    text.includes("bilateral") ||
    text.includes("por pie") ||
    text.includes("izq y der") ||
    text.includes("pie menos") ||
    text.includes("pie menor")
  );
}

export function testNeedsRadar(test: GphStationTest) {
  return /km\/h|radar/i.test(`${test.unit} ${test.execution} ${test.record}`);
}

/** Pase de precisión: captura aciertos por distancia 5 / 10 / 20 m. */
export function testNeedsPassDistances(test: GphStationTest) {
  return (
    test.id === "ini_c_pase" ||
    test.id === "des_c_pase" ||
    test.id === "des_p_pase"
  );
}

export type GphShotDistanceSpec = { key: string; label: string; shortLabel: string };

export const GPH_SHOT_GOL_SPECS: GphShotDistanceSpec[] = [
  { key: "11m_der", label: "11 m · der", shortLabel: "11m der" },
  { key: "11m_izq", label: "11 m · izq", shortLabel: "11m izq" },
  { key: "16_5m_der", label: "16.5 m · der", shortLabel: "16.5m der" },
  { key: "16_5m_izq", label: "16.5 m · izq", shortLabel: "16.5m izq" },
  { key: "20m_der", label: "20 m · der", shortLabel: "20m der" },
  { key: "20m_izq", label: "20 m · izq", shortLabel: "20m izq" },
];

function isShotGolTest(test: GphStationTest) {
  return (
    test.id === "des_c_tiro" ||
    test.id === "des_c_tiro_gol" ||
    test.id === "ini_c_tiro" ||
    test.id === "ini_c_tiro_gol" ||
    test.id === "ini_p_tiro_gol" ||
    test.id === "des_p_tiro_gol"
  );
}

/** Tiros con precisión + potencia por distancia. */
export function shotDistanceSpecs(test: GphStationTest): GphShotDistanceSpec[] | null {
  if (isShotGolTest(test)) return GPH_SHOT_GOL_SPECS;
  return null;
}

export function testNeedsShotDistances(test: GphStationTest) {
  return shotDistanceSpecs(test) != null;
}

export function emptyShotDistance(): GphShotDistanceCapture {
  return { precision: null, powerKmh: null };
}

export function shotDistanceEntry(
  capture: GphTestCapture,
  key: string,
): GphShotDistanceCapture {
  return capture.shotDistances?.[key] ?? emptyShotDistance();
}

export function shotPrecisionTotal(capture: GphTestCapture, keys: string[]) {
  const values = keys
    .map((key) => shotDistanceEntry(capture, key).precision)
    .filter((value): value is number => value != null && Number.isFinite(value));
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

export function shotPowerBest(capture: GphTestCapture, keys: string[]) {
  const values = keys
    .map((key) => shotDistanceEntry(capture, key).powerKmh)
    .filter((value): value is number => value != null && Number.isFinite(value));
  if (values.length === 0) return null;
  return Math.max(...values);
}

export function passDistanceHitsTotal(capture: GphTestCapture) {
  const values = [capture.hits5m, capture.hits10m, capture.hits20m].filter(
    (value): value is number => value != null && Number.isFinite(value),
  );
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

export function weakerFootPercent(left: number | null, right: number | null) {
  if (left == null || right == null) return null;
  const total = left + right;
  if (total <= 0) return null;
  return (Math.min(left, right) / total) * 100;
}

export const GPH_SPEED_DRIBBLE_LABELS = [
  "Der 5 m",
  "Izq 5 m",
  "Der 10 m",
  "Izq 10 m",
  "Der 20 m",
  "Izq 20 m",
  "Der 30 m",
  "Izq 30 m",
] as const;

export function testNeedsSpeedDribbleRubric(test: GphStationTest) {
  return (
    test.id === "des_c_patrones" ||
    test.id === "ini_c_patrones" ||
    test.id === "des_p_conduccion"
  );
}

export const GPH_RUBRIC_06 = [
  { value: 0, label: "Deficiente" },
  { value: 2, label: "Regular" },
  { value: 4, label: "Bueno" },
  { value: 6, label: "Óptimo" },
] as const;

export function testNeedsRubric06(test: GphStationTest) {
  return test.conversion === "rubric_06";
}

export function scoreFromAccuracyPercent(percent: number) {
  if (percent <= 20) return 1;
  if (percent <= 40) return 2;
  if (percent <= 60) return 3;
  if (percent <= 80) return 4;
  return 5;
}

export function scoreFromRubric06(average: number) {
  // 0 → 1 · 2 → 2 · 4 → 4 · 6 → 5
  return Math.max(1, Math.min(5, Math.round(1 + (average / 6) * 4)));
}

export function scoreFromContacts(value: number, conversion: GphConversion) {
  if (conversion === "contacts_ini") {
    if (value <= 2) return 1;
    if (value <= 5) return 2;
    if (value <= 10) return 3;
    if (value <= 20) return 4;
    return 5;
  }
  if (conversion === "contacts_des") {
    if (value <= 9) return 1;
    if (value <= 19) return 2;
    if (value <= 39) return 3;
    if (value <= 59) return 4;
    return 5;
  }
  return null;
}

export function numericAttempts(capture: GphTestCapture) {
  return capture.attempts.filter((value): value is number => value != null && Number.isFinite(value));
}

export function bestAttempt(capture: GphTestCapture, kind: GphTestKind) {
  const values = numericAttempts(capture);
  if (values.length === 0) return null;
  return kind === "time" ? Math.min(...values) : Math.max(...values);
}

export function averageAttempt(capture: GphTestCapture) {
  const values = numericAttempts(capture);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function derivedPercent(test: GphStationTest, capture: GphTestCapture) {
  if (test.kind === "ratio") {
    if (capture.hits == null || !capture.opportunities) return null;
    return (capture.hits / capture.opportunities) * 100;
  }
  if (test.kind === "accuracy" || test.kind === "points") {
    const shotSpecs = shotDistanceSpecs(test);
    if (shotSpecs) {
      const keys = shotSpecs.map((spec) => spec.key);
      const total = shotPrecisionTotal(capture, keys);
      const filled = keys.filter(
        (key) => shotDistanceEntry(capture, key).precision != null,
      ).length;
      if (total == null || filled === 0) return null;
      const maxPerDistance = capture.opportunities ?? test.maxPoints ?? 0;
      if (!maxPerDistance) return null;
      return (total / (filled * maxPerDistance)) * 100;
    }
    const distanceTotal = passDistanceHitsTotal(capture);
    const distanceCount = [capture.hits5m, capture.hits10m, capture.hits20m].filter(
      (value) => value != null && Number.isFinite(value),
    ).length;
    if (distanceTotal != null && distanceCount > 0) {
      const maxPerDistance = capture.opportunities ?? test.maxPoints ?? test.attempts;
      if (!maxPerDistance) return null;
      return (distanceTotal / (distanceCount * maxPerDistance)) * 100;
    }
    if (capture.leftHits != null && capture.rightHits != null) {
      const maxEach = capture.opportunities ?? test.maxPoints;
      if (!maxEach) return null;
      return ((capture.leftHits + capture.rightHits) / (2 * maxEach)) * 100;
    }
    const values = numericAttempts(capture);
    const total =
      capture.hits != null
        ? capture.hits
        : values.length > 0
          ? values.reduce((sum, value) => sum + value, 0)
          : null;
    const max = capture.opportunities ?? test.maxPoints ?? test.attempts;
    if (total == null || !max) return null;
    return (total / max) * 100;
  }
  return null;
}

export function suggestedScore(test: GphStationTest, capture: GphTestCapture) {
  if (test.id === "gph_reglas") {
    const filled = (capture.ruleSlots ?? []).filter((item) => item.trim()).length;
    if (filled === 0) return capture.score;
    const hits = regulationOrderHits(capture.ruleSlots);
    return scoreFromAccuracyPercent((hits / GPH_REGULATION_RULE_COUNT) * 100);
  }
  if (test.conversion === "accuracy") {
    const percent = derivedPercent(test, capture);
    return percent == null ? null : scoreFromAccuracyPercent(percent);
  }
  if (test.conversion === "rubric_06") {
    const values = numericAttempts(capture);
    if (values.length === 0) return null;
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    return scoreFromRubric06(avg);
  }
  if (test.conversion === "contacts_ini" || test.conversion === "contacts_des") {
    const best = bestAttempt(capture, test.kind);
    return best == null ? null : scoreFromContacts(best, test.conversion);
  }
  return capture.score;
}

export function priorityValue(score: number, relevance: 1 | 2 | 3) {
  return (5 - score) * relevance;
}

export function isFieldSessionPopulated(session: GphFieldSession | null | undefined) {
  if (!session) return false;
  if (session.evidence.length > 0) return true;
  return Object.values(session.tests).some((capture) => {
    if (!capture) return false;
    const hasShot = Object.values(capture.shotDistances ?? {}).some(
      (entry) => entry.precision != null || entry.powerKmh != null,
    );
    return (
      numericAttempts(capture).length > 0 ||
      capture.hits != null ||
      capture.hits5m != null ||
      capture.hits10m != null ||
      capture.hits20m != null ||
      hasShot ||
      (capture.ruleSlots ?? []).some((item) => item.trim()) ||
      capture.score != null
    );
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Acepta 8,5 / 8.5 / 08. Vacío o basura → null. */
export function parseMeasureInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!trimmed) return null;
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

export function isPartialMeasureInput(raw: string) {
  const trimmed = raw.trim().replace(/\s/g, "");
  return trimmed === "-" || trimmed === "." || trimmed === "," || /^-?\d+[.,]$/.test(trimmed);
}

function parseNum(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") return parseMeasureInput(value);
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function formatMeasure(value: number, integer = false) {
  if (integer) return String(Math.round(value));
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

export function isRatioKind(kind: GphTestKind) {
  return kind === "accuracy" || kind === "points" || kind === "ratio";
}

export function isTestCaptureComplete(test: GphStationTest, capture: GphTestCapture | undefined) {
  if (!capture) return false;
  const score = capture.score ?? suggestedScore(test, capture);
  if (test.id === "gph_reglas") {
    const filled = (capture.ruleSlots ?? []).filter((item) => item.trim()).length;
    return filled >= GPH_REGULATION_RULE_COUNT;
  }
  if (isRatioKind(test.kind)) {
    const max = capture.opportunities ?? test.maxPoints;
    if (testNeedsShotDistances(test)) {
      const specs = shotDistanceSpecs(test) ?? [];
      const allPrecision = specs.every(
        (spec) => shotDistanceEntry(capture, spec.key).precision != null,
      );
      if (!allPrecision && capture.hits == null) return false;
      if (max == null || max <= 0) return false;
    } else if (testNeedsPassDistances(test)) {
      if (max == null || max <= 0) return false;
      const hasDistances =
        capture.hits5m != null && capture.hits10m != null && capture.hits20m != null;
      if (!hasDistances && capture.hits == null) return false;
    } else if (testNeedsBilateral(test)) {
      if (max == null || max <= 0) return false;
      if (capture.leftHits == null || capture.rightHits == null) {
        if (capture.hits == null) return false;
      }
    } else if (capture.hits == null || max == null || max <= 0) {
      return false;
    }
  } else if (numericAttempts(capture).length === 0) {
    return false;
  } else if (testNeedsRubric06(test) && numericAttempts(capture).length < test.attempts) {
    return false;
  }
  if (test.conversion === "manual" && score == null) return false;
  return true;
}

export function fieldSessionProgress(
  session: GphFieldSession,
  module: DiagnosisModule,
) {
  const tests = testsForBattery(module, session.protocolStage, session.sessionType);
  const physical = physicalTestsForSession(session);
  const stationFilled = tests.filter((test) => isTestCaptureComplete(test, session.tests[test.id]));
  const physicalFilled = physical.filter((test) =>
    isPhysicalCaptureComplete(test, session.physical[test.id]),
  );
  const missing = [
    ...tests.filter((test) => !isTestCaptureComplete(test, session.tests[test.id])),
    ...physical.filter((test) => !isPhysicalCaptureComplete(test, session.physical[test.id])),
  ];
  return {
    filled: stationFilled.length + physicalFilled.length,
    total: tests.length + physical.length,
    missing,
  };
}

export function formatTestRaw(test: GphStationTest, capture: GphTestCapture | undefined) {
  if (!capture) return "—";
  if (test.id === "gph_reglas") {
    const filled = (capture.ruleSlots ?? []).filter((item) => item.trim()).length;
    const hits = regulationOrderHits(capture.ruleSlots);
    return `${hits}/${GPH_REGULATION_RULE_COUNT} en orden · ${filled} escritas`;
  }
  if (isRatioKind(test.kind)) {
    const hits = capture.hits;
    const max = capture.opportunities ?? test.maxPoints;
    const shotSpecs = shotDistanceSpecs(test);
    const distanceTotal = passDistanceHitsTotal(capture);
    const hasPassDistances =
      capture.hits5m != null || capture.hits10m != null || capture.hits20m != null;
    if (shotSpecs) {
      const parts: string[] = [];
      for (const spec of shotSpecs) {
        const entry = shotDistanceEntry(capture, spec.key);
        if (entry.precision == null && entry.powerKmh == null) continue;
        const bits: string[] = [];
        if (entry.precision != null) bits.push(`P ${formatMeasure(entry.precision, true)}`);
        if (entry.powerKmh != null) bits.push(`${formatMeasure(entry.powerKmh)} km/h`);
        parts.push(`${spec.shortLabel} ${bits.join(" / ")}`);
      }
      const percent = derivedPercent(test, capture);
      if (percent != null) parts.push(`${Math.round(percent)}%`);
      const bestPower = shotPowerBest(
        capture,
        shotSpecs.map((spec) => spec.key),
      );
      if (bestPower != null && !parts.some((part) => part.includes("km/h"))) {
        parts.push(`mejor ${formatMeasure(bestPower)} km/h`);
      }
      return parts.length ? parts.join(" · ") : "—";
    }
    if (
      hits == null &&
      !hasPassDistances &&
      max == null &&
      capture.errors == null
    ) {
      const values = numericAttempts(capture);
      if (values.length === 0) return "—";
    }
    const parts: string[] = [];
    if (hasPassDistances) {
      parts.push(
        `5m ${capture.hits5m ?? "—"} · 10m ${capture.hits10m ?? "—"} · 20m ${capture.hits20m ?? "—"}`,
      );
      if (distanceTotal != null && max != null) {
        const filled = [capture.hits5m, capture.hits10m, capture.hits20m].filter(
          (value) => value != null,
        ).length;
        parts.push(`${formatMeasure(distanceTotal, true)}/${formatMeasure(filled * max, true)}`);
      }
    } else if (hits != null && max != null) {
      parts.push(`${formatMeasure(hits, true)}/${formatMeasure(max, true)}`);
    } else if (hits != null) {
      parts.push(formatMeasure(hits, true));
    }
    if (capture.errors != null) parts.push(`${formatMeasure(capture.errors, true)} err.`);
    const percent = derivedPercent(test, capture);
    if (percent != null) parts.push(`${Math.round(percent)}%`);
    if (capture.leftHits != null || capture.rightHits != null) {
      parts.push(
        `Der ${capture.rightHits ?? "—"} · Izq ${capture.leftHits ?? "—"}`,
      );
      const weak = weakerFootPercent(capture.leftHits, capture.rightHits);
      if (weak != null) parts.push(`pie menor ${Math.round(weak)}%`);
    }
    if (capture.radarKmh != null) parts.push(`${formatMeasure(capture.radarKmh)} km/h`);
    return parts.length ? parts.join(" · ") : "—";
  }
  const values = numericAttempts(capture);
  if (values.length === 0) return "—";
  const integer = test.kind === "contacts";
  const listed = values.map((value) => formatMeasure(value, integer)).join(" · ");
  const best = bestAttempt(capture, test.kind);
  const avg = averageAttempt(capture);
  const bits = [listed];
  if (best != null) bits.push(`mejor ${formatMeasure(best, integer)}`);
  if (avg != null && values.length > 1) bits.push(`prom. ${avg.toFixed(1)}`);
  if (capture.leftHits != null || capture.rightHits != null) {
    bits.push(`Der ${capture.rightHits ?? "—"} · Izq ${capture.leftHits ?? "—"}`);
    const weak = weakerFootPercent(capture.leftHits, capture.rightHits);
    if (weak != null) bits.push(`pie menor ${Math.round(weak)}%`);
  }
  if (capture.radarKmh != null) bits.push(`${formatMeasure(capture.radarKmh)} km/h`);
  return bits.join(" · ");
}

function copyShotIfEmpty(
  shotDistances: Record<string, GphShotDistanceCapture>,
  fromKey: string,
  toKey: string,
) {
  const from = shotDistances[fromKey];
  if (!from) return;
  const to = shotDistances[toKey];
  if (to && (to.precision != null || to.powerKmh != null)) return;
  if (from.precision == null && from.powerKmh == null) return;
  shotDistances[toKey] = { ...from };
}

function migrateLegacyShotDistances(
  testId: string,
  shotDistances: Record<string, GphShotDistanceCapture>,
) {
  if (testId === "des_c_tiro" || testId === "ini_c_tiro") {
    copyShotIfEmpty(shotDistances, "5m", "11m_der");
    copyShotIfEmpty(shotDistances, "10m", "16_5m_der");
    copyShotIfEmpty(shotDistances, "20m", "20m_der");
  }
  if (testId === "des_c_tiro_gol" || testId === "ini_c_tiro_gol") {
    copyShotIfEmpty(shotDistances, "11m", "11m_der");
    copyShotIfEmpty(shotDistances, "16_5m", "16_5m_der");
    copyShotIfEmpty(shotDistances, "20m", "20m_der");
  }
}

export function parseFieldSession(value: unknown): GphFieldSession {
  const empty = emptyFieldSession();
  if (!isRecord(value)) return empty;
  const stage = GPH_PROTOCOL_STAGES.includes(value.protocolStage as GphProtocolStage)
    ? (value.protocolStage as GphProtocolStage)
    : "iniciacion";
  const sessionType = GPH_SESSION_TYPES.includes(value.sessionType as GphSessionType)
    ? (value.sessionType as GphSessionType)
    : "esencial";
  const tests: Record<string, GphTestCapture> = {};
  if (isRecord(value.tests)) {
    for (const [id, raw] of Object.entries(value.tests)) {
      if (!isRecord(raw)) continue;
      const attempts = Array.isArray(raw.attempts)
        ? raw.attempts.map((item) => parseNum(item))
        : [];
      const relevanceRaw = Number(raw.relevance);
      const shotDistances: Record<string, GphShotDistanceCapture> = {};
      if (isRecord(raw.shotDistances)) {
        for (const [key, entry] of Object.entries(raw.shotDistances)) {
          if (!isRecord(entry)) continue;
          shotDistances[key] = {
            precision: parseNum(entry.precision),
            powerKmh: parseNum(entry.powerKmh),
          };
        }
      }
      migrateLegacyShotDistances(id, shotDistances);
      const ruleSlots = Array.isArray(raw.ruleSlots)
        ? raw.ruleSlots.map((item) => (typeof item === "string" ? item : ""))
        : [];
      while (ruleSlots.length < GPH_REGULATION_RULE_COUNT && id === "gph_reglas") {
        ruleSlots.push("");
      }
      tests[id] = {
        attempts,
        hits: parseNum(raw.hits),
        opportunities: parseNum(raw.opportunities),
        errors: parseNum(raw.errors),
        leftHits: parseNum(raw.leftHits),
        rightHits: parseNum(raw.rightHits),
        hits5m: parseNum(raw.hits5m),
        hits10m: parseNum(raw.hits10m),
        hits20m: parseNum(raw.hits20m),
        shotDistances,
        ruleSlots,
        radarKmh: parseNum(raw.radarKmh),
        score: parseNum(raw.score),
        relevance: relevanceRaw === 1 || relevanceRaw === 3 ? relevanceRaw : 2,
        flagged: Boolean(raw.flagged),
        note: typeof raw.note === "string" ? raw.note : "",
      };
    }
  }
  const physical: Record<string, GphPhysicalCapture> = {};
  if (isRecord(value.physical)) {
    for (const [id, raw] of Object.entries(value.physical)) {
      if (!isRecord(raw)) continue;
      physical[id] = {
        attempts: Array.isArray(raw.attempts) ? raw.attempts.map((item) => parseNum(item)) : [],
        note: typeof raw.note === "string" ? raw.note : "",
        score: parseNum(raw.score),
      };
    }
  }
  // Capturas viejas: Cambio 5-10-5 con 4 intentos → 5-0-5 (1–2) + Illinois (3–4).
  const legacyCambio = physical.cambio_5105;
  if (legacyCambio && legacyCambio.attempts.length > 2) {
    const illinoisAttempts = [
      legacyCambio.attempts[2] ?? null,
      legacyCambio.attempts[3] ?? null,
    ];
    const hasIllinoisData = illinoisAttempts.some((v) => v != null);
    const existingIllinois = physical.illinois;
    const illinoisEmpty =
      !existingIllinois ||
      existingIllinois.attempts.every((v) => v == null);
    if (hasIllinoisData && illinoisEmpty) {
      physical.illinois = {
        attempts: illinoisAttempts,
        note: existingIllinois?.note ?? "",
        score: existingIllinois?.score ?? null,
      };
    }
    physical.cambio_5105 = {
      ...legacyCambio,
      attempts: legacyCambio.attempts.slice(0, 2),
    };
  }
  const legacyNavette = physical.resistencia_20;
  if (legacyNavette && legacyNavette.attempts.length > 1) {
    physical.resistencia_20 = {
      ...legacyNavette,
      attempts: legacyNavette.attempts.slice(0, 1),
    };
  }
  const tri = (raw: unknown) => (raw === true ? true : raw === false ? false : null);
  const closingRaw = isRecord(value.closing) ? value.closing : {};
  const status = value.status === "draft" ? "draft" : "ready";
  return {
    protocolStage: stage,
    sessionType,
    status,
    surface: typeof value.surface === "string" ? value.surface : "",
    weather: typeof value.weather === "string" ? value.weather : "",
    ballSize: typeof value.ballSize === "string" ? value.ballSize : "",
    ballPsi: typeof value.ballPsi === "string" ? value.ballPsi : "",
    venueCode: typeof value.venueCode === "string" ? value.venueCode : "",
    bibNumber: typeof value.bibNumber === "string" ? value.bibNumber : "",
    currentClub: typeof value.currentClub === "string" ? value.currentClub : "",
    familiarizationDone: tri(value.familiarizationDone),
    regulationDistance: tri(value.regulationDistance),
    ballSurfaceLogged: tri(value.ballSurfaceLogged),
    keyTestsVideo: tri(value.keyTestsVideo),
    observation: typeof value.observation === "string" ? value.observation : "",
    incident: typeof value.incident === "string" ? value.incident : "",
    closing: {
      testsComplete: tri(closingRaw.testsComplete),
      videosIdentified: tri(closingRaw.videosIdentified),
      dataLoaded: tri(closingRaw.dataLoaded),
      incidentsLogged: tri(closingRaw.incidentsLogged),
      reportScheduled: tri(closingRaw.reportScheduled),
      feedbackDate:
        typeof closingRaw.feedbackDate === "string" ? closingRaw.feedbackDate : "",
    },
    tests,
    physical,
    evidence: parseEvidence(value.evidence),
    coachBrief: parseCoachBrief(value.coachBrief),
  };
}

function parseEvidence(value: unknown): GphEvidenceItem[] {
  if (!Array.isArray(value)) return [];
  const items: GphEvidenceItem[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const url = typeof raw.url === "string" ? raw.url.trim() : "";
    const kind: GphEvidenceKind | null =
      raw.kind === "video" ? "video" : raw.kind === "photo" ? "photo" : null;
    if (!url || !kind) continue;
    items.push({
      id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : crypto.randomUUID(),
      kind,
      url,
      caption: typeof raw.caption === "string" ? raw.caption.trim() : "",
      stationId: typeof raw.stationId === "string" ? raw.stationId.trim() : "",
      createdAt:
        typeof raw.createdAt === "string" && raw.createdAt
          ? raw.createdAt
          : new Date().toISOString(),
    });
  }
  return items.slice(0, DIAGNOSIS_EVIDENCE_MAX);
}

export function scoresFromFieldSession(session: GphFieldSession, module: DiagnosisModule) {
  const tests = testsForBattery(module, session.protocolStage, session.sessionType);
  const buckets = new Map<string, number[]>();
  for (const test of tests) {
    if (!test.indicatorId) continue;
    const capture = session.tests[test.id];
    if (!capture) continue;
    const score = capture.score ?? suggestedScore(test, capture);
    if (score == null) continue;
    const list = buckets.get(test.indicatorId) ?? [];
    list.push(score);
    buckets.set(test.indicatorId, list);
  }
  for (const test of GPH_PHYSICAL_TESTS) {
    if ("legacy" in test && test.legacy) continue;
    if (test.desarrolloOnly && session.protocolStage !== "desarrollo") continue;
    const capture = session.physical[test.id];
    if (capture?.score == null) continue;
    const list = buckets.get(test.indicatorId) ?? [];
    list.push(capture.score);
    buckets.set(test.indicatorId, list);
  }
  const scores: Record<string, number> = {};
  for (const [id, values] of buckets) {
    scores[id] = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }
  return scores;
}

export function flaggedIndicatorsFromField(session: GphFieldSession, module: DiagnosisModule) {
  const tests = testsForBattery(module, session.protocolStage, session.sessionType);
  const ids: string[] = [];
  for (const test of tests) {
    if (!test.indicatorId) continue;
    if (session.tests[test.id]?.flagged) ids.push(test.indicatorId);
  }
  return [...new Set(ids)];
}

export function suggestPrioritiesFromField(session: GphFieldSession, module: DiagnosisModule) {
  const tests = testsForBattery(module, session.protocolStage, session.sessionType);
  return tests
    .map((test) => {
      const capture = session.tests[test.id] ?? emptyTestCapture(test);
      const score = capture.score ?? suggestedScore(test, capture);
      if (score == null) return null;
      const weight = priorityValue(score, capture.relevance);
      return { test, capture, score, weight };
    })
    .filter((item): item is NonNullable<typeof item> => item != null && item.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.score - b.score)
    .slice(0, 5)
    .map((item) => ({
      indicator_id: item.test.indicatorId,
      title: item.test.label,
      baseline: `${item.score}/5 · prioridad ${item.weight}`,
      december_goal: "",
      progress_indicator: item.test.record,
      main_action: item.test.execution,
    }));
}
