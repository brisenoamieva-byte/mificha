import { DEMO_FICHA_PREVIEW } from "@/lib/demo-ficha-preview";
import { emptyFieldSession, type GphTestCapture } from "@/lib/gph-field-protocol";
import { MARKETING_IMAGES } from "@/lib/marketing-assets";
import {
  computeDiagnosisResult,
  emptyMonthlyPlan,
  type DiagnosisAcademySnapshot,
  type DiagnosisPlayerSnapshot,
  type DiagnosisScores,
  type PlayerDiagnosisRecord,
} from "@/lib/player-diagnosis";

const DEMO_SCORES: DiagnosisScores = {
  control_orientado: 4,
  conduccion: 4,
  pase: 3,
  recepcion: 4,
  golpeo: 4,
  uno_contra_uno: 4,
  escaneo: 3,
  toma_decisiones: 3,
  ubicacion: 3,
  transiciones: 2,
  perfil_corporal: 4,
  desmarque_apoyo: 3,
  juego_bajo_presion: 3,
  duelo_ofensivo: 4,
  duelo_defensivo: 3,
  finalizacion: 4,
  lectura_posicion: 3,
  participacion_colectiva: 4,
  coordinacion: 4,
  movilidad: 3,
  velocidad: 4,
  fuerza_estabilidad: 3,
  resistencia: 4,
  prevencion: 3,
  confianza: 4,
  atencion: 3,
  disciplina: 4,
  manejo_error: 3,
  comunicacion: 3,
  compromiso: 4,
};

function demoTest(
  capture: Omit<GphTestCapture, "leftHits" | "rightHits" | "radarKmh" | "hits5m" | "hits10m" | "hits20m"> &
    Partial<Pick<GphTestCapture, "leftHits" | "rightHits" | "radarKmh" | "hits5m" | "hits10m" | "hits20m">>,
): GphTestCapture {
  return {
    leftHits: null,
    rightHits: null,
    hits5m: null,
    hits10m: null,
    hits20m: null,
    radarKmh: null,
    ...capture,
  };
}

export function isDemoDiagnosisToken(token: string) {
  return token === "demo";
}

export function buildDemoDiagnosisReport(): {
  diagnosis: PlayerDiagnosisRecord;
  player: DiagnosisPlayerSnapshot;
  academy: DiagnosisAcademySnapshot;
} {
  const result = computeDiagnosisResult(DEMO_SCORES, "campo");

  return {
    player: {
      id: "demo",
      first_name: DEMO_FICHA_PREVIEW.firstName,
      last_name: DEMO_FICHA_PREVIEW.lastName,
      birth_date: DEMO_FICHA_PREVIEW.birthDate,
      position: DEMO_FICHA_PREVIEW.position,
      dominant_foot: "left",
      jersey_number: DEMO_FICHA_PREVIEW.jerseyNumber,
      photo_url: DEMO_FICHA_PREVIEW.photoSrc,
      slug: DEMO_FICHA_PREVIEW.slug,
    },
    academy: {
      id: "demo",
      name: DEMO_FICHA_PREVIEW.academy,
      slug: "academia-gallos",
      logo_url: DEMO_FICHA_PREVIEW.academyLogoSrc,
    },
    diagnosis: {
      id: "demo",
      academy_id: "demo",
      player_id: "demo",
      kind: "inicial",
      module: "campo",
      evaluated_at: "2026-09-06",
      evaluator_name: "Gustavo Reyes · GPH",
      years_experience: 4,
      venue: "Casa de la Juventud",
      session_days: "L-Mi",
      sessions_per_week: 2,
      injuries: null,
      why_join: "Quiere un programa medible rumbo a torneos escolares.",
      player_goal: "Mejorar definición y lectura en transiciones.",
      family_goal: "Ver avance claro de septiembre a diciembre.",
      medical_notes: null,
      scores: DEMO_SCORES,
      notes: {},
      flagged: ["transiciones", "escaneo", "toma_decisiones"],
      domain_averages: result.domainAverages,
      global_score: result.globalScore,
      computed_stage: result.stage,
      assigned_stage: result.stage,
      assigned_group: "Avanzado",
      assignment_notes:
        "Rol posicional bajo presión; calidad al final de la serie. Comparar dato de estación vs partido.",
      program_priorities: [
        {
          title: "Transiciones",
          baseline: "2 · Inicial",
          december_goal: "Reaccionar en 2–3 segundos al cambio de posesión",
          progress_indicator: "Reacciona al ganar o perder la posesión.",
          main_action: "Ruedos 4v2 + contraataque limitado a 8 s",
          indicator_id: "transiciones",
        },
        {
          title: "Escaneo",
          baseline: "3 · Funcional",
          december_goal: "Mirar hombro antes de recibir en 8/10 acciones",
          progress_indicator: "Observa antes de recibir y reconoce opciones.",
          main_action: "Juego posicional con regla de dos chequeos",
          indicator_id: "escaneo",
        },
        {
          title: "Toma de decisiones",
          baseline: "3 · Funcional",
          december_goal: "Elegir pase adelante vs retención bajo presión",
          progress_indicator: "Elige con oportunidad y sentido de juego.",
          main_action: "Juegos de posesión 5v5 con tercer hombre",
          indicator_id: "toma_decisiones",
        },
      ],
      monthly_plan: {
        ...emptyMonthlyPlan(),
        september: {
          objective: "Corregir transiciones y hábito de escaneo",
          actions: "Circuito de pérdida/recuperación + video de 3 jugadas propias",
        },
        october: {
          objective: "Consolidar 1v1 ofensivo y pase bajo presión",
          actions: "Duelos laterales + rueda de pases a un toque",
        },
        november: {
          objective: "Aplicar bajo presión de partido",
          actions: "Juegos reducidos 5v5 y partidos internos con foco táctico",
        },
        december: {
          objective: "Revalorar y fijar siguiente ciclo",
          actions: "Misma hoja 1–5 + comparación vs septiembre",
        },
      },
      field_session: {
        ...emptyFieldSession("desarrollo", "esencial"),
        status: "ready",
        venueCode: "CJ",
        bibNumber: "9",
        currentClub: "Escuela Gallos",
        familiarizationDone: true,
        surface: "Pasto",
        weather: "Despejado",
        ballSize: "5",
        ballPsi: "8.5",
        regulationDistance: true,
        ballSurfaceLogged: true,
        keyTestsVideo: true,
        evidence: [
          {
            id: "demo-ev-1",
            kind: "photo",
            url: MARKETING_IMAGES.featureCaptura,
            caption: "Slalom · dato crudo",
            stationId: "des_c_slalom",
            createdAt: "2026-09-06T12:00:00.000Z",
          },
          {
            id: "demo-ev-2",
            kind: "photo",
            url: MARKETING_IMAGES.audienceAcademias,
            caption: "Circuito de transiciones",
            stationId: "",
            createdAt: "2026-09-06T12:08:00.000Z",
          },
        ],
        observation: "Pierde calidad al cambiar de posesión; el pase corto es funcional.",
        coachBrief: {
          source: "gph",
          generatedAt: "2026-09-06T12:00:00.000Z",
          stageRationale:
            "Corte GPH: desarrollo. Fundamentos presentes; aún no estables bajo presión. La etapa fija el punto de partida del ciclo, no el techo.",
          overall:
            "Línea base, no veredicto. Se construye desde conducción, control y duelo ofensivo. Cada sesión del ciclo lleva una tarea medible en transición y escaneo.",
          family:
            "Santiago ya tiene bases técnicas. El salto de este ciclo es la transición: primer paso al robo o a la pérdida, medido en sesión hasta la revaloración de diciembre. Esta ficha es el plan de trabajo, no una etiqueta de carrera.",
          domains: {
            tecnica:
              "Conducción y 1v1 con techo. Piso en el pase. Consigna: apoyo firme y tercer hombre; no acelerar el golpeo hasta que el pase corto sea 8/10.",
            tactica:
              "Cuello de botella. El juego de aplicación quedó marcado en protocolo. Consigna: primer paso al robo o a la pérdida en 2–3 segundos.",
            fisico:
              "Usable para la edad. Movilidad y estabilidad un punto abajo de velocidad y resistencia. Dosificar sprints al cierre para que la decisión no caiga al minuto 3.",
            mental:
              "Confianza y disciplina sostienen el trabajo. Atención, manejo del error y comunicación: consignas cortas y reset de 5 s después del fallo.",
            compromiso:
              "Listo para mini-plan en casa 3 días/semana, registrado. La prevención no se salta aunque el jugador pida más partidos.",
          },
          sessionFocus: [
            "Arranque 8 min: movilidad de tobillo/cadera y 2 aceleraciones submáximas.",
            "Bloque 1 · Transiciones: 4v2 + contraataque a 8 s al robo; al perder, 3 s para replegar. Consigna: primer paso inmediato.",
            "Bloque 2 · Escaneo: posesión 5v5 con dos chequeos de hombro antes de recibir. Consigna: chequeo temprano, no cuando el balón ya está en el pie.",
            "Bloque 3 · Toma de decisiones: 5v5 con tercer hombre y tres opciones (pase adelante, retención, desborde).",
            "Cierre 10 min: juego reducido con la consigna del bloque 1. Si no aparece, se para y se repite una vez.",
          ],
          warnings: [
            "El mes absorbe transiciones, escaneo y decisión. El resto espera al siguiente ciclo.",
          ],
        },
        tests: {
          des_c_dominadas: demoTest({
            attempts: [18, 21, 19, 22, 20],
            hits: null,
            opportunities: null,
            errors: null,
            score: 5,
            relevance: 3,
            flagged: false,
            note: "",
          }),
          des_c_slalom: demoTest({
            attempts: [11.4, 10.8],
            hits: null,
            opportunities: null,
            errors: null,
            score: 3,
            relevance: 2,
            flagged: false,
            note: "+1 s en el segundo intento (cono).",
          }),
          des_c_pase: demoTest({
            attempts: [],
            hits: 20,
            opportunities: 12,
            errors: null,
            leftHits: 9,
            rightHits: 11,
            hits5m: 9,
            hits10m: 7,
            hits20m: 4,
            score: 3,
            relevance: 3,
            flagged: false,
            note: "5 m fuerte; cae a 20 m. 11/18 der · 9/18 izq",
          }),
          des_c_control: demoTest({
            attempts: [],
            hits: 16,
            opportunities: 24,
            errors: null,
            score: 4,
            relevance: 3,
            flagged: false,
            note: "",
          }),
          des_c_tiro: demoTest({
            attempts: [],
            hits: 16,
            opportunities: 24,
            errors: null,
            score: 4,
            relevance: 3,
            flagged: false,
            note: "",
          }),
          des_c_largo: demoTest({
            attempts: [],
            hits: 10,
            opportunities: 18,
            errors: null,
            score: 3,
            relevance: 2,
            flagged: false,
            note: "Primer bote; 1 fuera de corredor.",
          }),
          des_c_juego: demoTest({
            attempts: [],
            hits: 8,
            opportunities: 18,
            errors: 10,
            score: 3,
            relevance: 3,
            flagged: true,
            note: "",
          }),
        },
      },
      share_token_hash: "demo",
      created_at: "2026-09-06T12:00:00.000Z",
      updated_at: "2026-09-06T12:00:00.000Z",
    },
  };
}
