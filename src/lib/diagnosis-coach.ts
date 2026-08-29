/**
 * Lectura de entrenador: convierte puntajes GPH en comentarios, foco de sesión y plan.
 * La etapa 1–5 la calcula GPH; la IA (si hay clave) solo redacta con criterio de staff.
 */

import { calculateAge, getPositionLabel } from "@/lib/dashboard-utils";
import {
  GPH_PHYSICAL_TESTS,
  GPH_PRINCIPLE,
  GPH_STATION_TESTS,
  suggestedScore,
  testsForBattery,
  type GphFieldSession,
} from "@/lib/gph-field-protocol";
import {
  computeDiagnosisResult,
  DIAGNOSIS_DOMAIN_LABELS,
  DIAGNOSIS_DOMAINS,
  DIAGNOSIS_MONTH_META,
  DIAGNOSIS_MONTHS,
  DIAGNOSIS_SCALE,
  DIAGNOSIS_STAGE_COPY,
  DIAGNOSIS_STAGE_LABELS,
  emptyMonthlyPlan,
  indicatorById,
  indicatorsForModule,
  parseCoachBrief,
  rankedIndicators,
  type DiagnosisCoachBrief,
  type DiagnosisDomain,
  type DiagnosisKind,
  type DiagnosisModule,
  type DiagnosisMonthlyPlan,
  type DiagnosisNotes,
  type DiagnosisPriorityItem,
  type DiagnosisScores,
  type DiagnosisStage,
} from "@/lib/player-diagnosis";
import type { PlayerPosition } from "@/types/database";

export interface CoachBriefInput {
  firstName: string;
  age: number | null;
  position: PlayerPosition;
  module: DiagnosisModule;
  kind: DiagnosisKind;
  scores: DiagnosisScores;
  notes: DiagnosisNotes;
  flagged: string[];
  injuries: string | null;
  playerGoal: string | null;
  familyGoal: string | null;
  whyJoin: string | null;
  fieldSession: GphFieldSession;
}

export interface CoachBriefOutput {
  brief: DiagnosisCoachBrief;
  priorities: DiagnosisPriorityItem[];
  monthlyPlan: DiagnosisMonthlyPlan;
  assignmentNotes: string;
  source: "ai" | "gph";
  aiAvailable: boolean;
  aiFallback: boolean;
}

interface DrillPack {
  drill: string;
  goal: string;
  cue: string;
}

const DRILLS: Record<string, DrillPack> = {
  control_orientado: {
    drill: "Servicios a distintos ángulos: primer toque hacia el espacio libre y pase al tercer hombre. 4×8 repeticiones.",
    goal: "Orientar el primer toque al espacio útil en 8 de 10 recepciones.",
    cue: "Pecho abierto, primer toque lejos de la presión.",
  },
  conduccion: {
    drill: "Slalom + cambio de ritmo a cono de salida; luego 1v1 en pasillo estrecho. Pie menos hábil en bloque 2.",
    goal: "Cambiar de dirección sin perder el balón bajo oposición reducida.",
    cue: "Balón pegado, cabeza arriba en el tercer contacto.",
  },
  pase: {
    drill: "Rueda de pases a 8–12 m con ambos perfiles; meta de acierto y tercer hombre. Cerrar con 5v3.",
    goal: "Completar 8/10 pases cortos con cada pie en circuito cronometrado.",
    cue: "Apoyo firme, superficie interior, peso al compañero.",
  },
  recepcion: {
    drill: "Cuadro 1.5 m: recibir, girar y jugar a puerta o compañero. 10 servicios por lado.",
    goal: "Control + pase en dos toques en 8 de 10 servicios.",
    cue: "Perfil antes de que llegue el balón.",
  },
  golpeo: {
    drill: "Golpeo parado y en movimiento a objetivos 1×1. 5 por pie. Corregir apoyo y follow-through.",
    goal: "Dirigir 12/20 tiros a zona pedida con ambos perfiles.",
    cue: "Cabeza estable, contacto con empeine o interior según consigna.",
  },
  uno_contra_uno: {
    drill: "Pasillos 1v1 ofensivo y defensivo (ida y vuelta). Máximo 6 s. Rotar rol.",
    goal: "Crear o negar ventaja en 1v1 sin falta ni pérdida fácil.",
    cue: "Ofensivo: finta + aceleración. Defensivo: temporizar y orientar.",
  },
  escaneo: {
    drill: "Posesión 5v5 con regla: dos chequeos de hombro antes de recibir o se pierde el punto.",
    goal: "Mirar hombro antes de recibir en 8 de 10 acciones filmadas.",
    cue: "Chequeo temprano, no cuando el balón ya está en el pie.",
  },
  toma_decisiones: {
    drill: "Juegos 5v5 con tercer hombre y tres opciones pintadas (pase adelante, retención, desborde).",
    goal: "Elegir pase adelante vs retención según presión en 7/10 acciones.",
    cue: "Si hay línea, juega. Si no, asegura y reabre.",
  },
  ubicacion: {
    drill: "Rondos por líneas (4v2 / 6v3) con consigna de distancias entre compañeros.",
    goal: "Mantener distancia útil a la línea de pase en juegos reducidos.",
    cue: "Ni amontonarse ni desconectar: ver balón, compañero y portería.",
  },
  transiciones: {
    drill: "4v2 + contraataque a 8 s al robo; al perder, 3 s para replegar a línea.",
    goal: "Reaccionar en 2–3 s al cambio de posesión en 8 de 10 robos/pérdidas.",
    cue: "Primer paso inmediato: atacar espacio o cerrar el próximo pase.",
  },
  perfil_corporal: {
    drill: "Recepciones de espaldas con pivote: abrir perfil al primer toque y jugar adelante.",
    goal: "Recibir de frente al juego en 8/10 acciones de media cancha.",
    cue: "Hombro a la portería rival antes del control.",
  },
  desmarque_apoyo: {
    drill: "Tercer hombre y desmarque de ruptura vs 2 defensas. Alternar apoyo corto y diagonal.",
    goal: "Ofrecer línea de pase útil en cada posesión de su línea.",
    cue: "Si el compañero está marcado, muévete; si está libre, fíjate.",
  },
  juego_bajo_presion: {
    drill: "Presión 3v2 en cuadrado 8×8: dos toques, salida a un extremo. Rotar el que presiona.",
    goal: "Conservar calidad de pase/control con oposición en 7/10 salidas.",
    cue: "Cuerpo entre balón y rival; jugar simple si no hay ventaja.",
  },
  duelo_ofensivo: {
    drill: "1v1 desde banda hacia portería pequeña. Máximo 8 s. Premiar recorte al espacio.",
    goal: "Superar o filtrar en 1v1 ofensivo al menos 50% de duelos de estación.",
    cue: "Engañar el apoyo, atacar el espacio débil.",
  },
  duelo_defensivo: {
    drill: "Defensa de pasillo: temporizar, orientar a banda y entrar al balón en el timing.",
    goal: "Recuperar o retrasar sin falta en 7/10 duelos defensivos de estación.",
    cue: "No zambullirse; el segundo paso gana el duelo.",
  },
  finalizacion: {
    drill: "Finalizaciones a 8–12 m: parado, primer toque y 1v1 al arco. Ambos pies. 16 remates.",
    goal: "Elegir superficie y dirección; 40% de remates a portería en circuito.",
    cue: "Mira el objetivo una vez; después ejecuta.",
  },
  lectura_posicion: {
    drill: "Juego posicional 7v7 con tarjetas de rol (qué cubro si sale el compañero).",
    goal: "Cubrir la responsabilidad de su rol en transiciones del propio equipo.",
    cue: "Pregunta: ¿quién queda libre si yo salgo?",
  },
  participacion_colectiva: {
    drill: "Posesión con comodines y consigna de comunicar la presión (nombre + lado).",
    goal: "Conectarse en la circulación y marcar al menos una consigna verbal por jugada.",
    cue: "Hablar antes de que llegue el balón.",
  },
  posicion_base: {
    drill: "Set de posición: semiflexión, manos adelante, pasos de ajuste a 4 disparos laterales.",
    goal: "Llegar a cada intervención desde base estable, sin cruzar piernas.",
    cue: "Peso en puntas, pecho al balón, listo a 1er paso.",
  },
  desplazamientos: {
    drill: "Arcos laterales + drop step a conos. 6 repeticiones por lado, sin perder frente.",
    goal: "Ajustar ángulo y distancia en 8/10 desplazamientos a balón cruzado.",
    cue: "Pasos cortos; el cuerpo llega antes que las manos.",
  },
  blocaje_recepcion: {
    drill: "Blocajes centrales y a media altura; segundo balón al rebote. 12 servicios.",
    goal: "Asegurar 10/12 blocajes sin rebote largo.",
    cue: "Manos firmes al pecho; el cuerpo cierra el hueco.",
  },
  caidas_desvios: {
    drill: "Caídas laterales a zona marcada; desvío a banda, no al centro. 8 por lado.",
    goal: "Desviar a zona segura en 7/8 intervenciones laterales.",
    cue: "Empuja el balón donde no hay remate de vuelta.",
  },
  uno_contra_uno_gk: {
    drill: "1v1 desde 12 m: temporizar, reducir ángulo, decidir blocaje o desvío.",
    goal: "Reducir ángulo y decidir bien en 6/8 duelos 1v1.",
    cue: "No te tires pronto; el atacante tiene que decidir primero.",
  },
  juego_aereo: {
    drill: "Centros con oposición pasiva, luego 1 atacante. Grito de mando obligatorio.",
    goal: "Atacar 7/10 centros con comunicación clara.",
    cue: "Decide temprano: mío o queda.",
  },
  distribucion: {
    drill: "Saques de mano a objetivos + pase con pie a laterales. 10 por tipo.",
    goal: "Iniciar con precisión 8/10 distribuciones a objetivo pedido.",
    cue: "Primero asegura; luego juega entre líneas si está limpio.",
  },
  lectura_mando: {
    drill: "Juego 8v8 con el portero como primer constructor: consigna de línea y lado de presión.",
    goal: "Ordenar la primera línea en cada inicio y cada centro.",
    cue: "El portero habla primero; el equipo ejecuta.",
  },
  coordinacion: {
    drill: "Circuito coordinativo con balón: skip, hop, 1-2 y control. 3×30 s.",
    goal: "Moverse con control segmentario sin perder el balón en el circuito.",
    cue: "Calidad del apoyo antes que velocidad.",
  },
  movilidad: {
    drill: "Movilidad de cadera y tobillo (rodilla a la pared) + activación 8 min pre-sesión.",
    goal: "Completar rango funcional de tobillo/cadera sin compensación evidente.",
    cue: "Talón pegado; no armar con la lumbar.",
  },
  velocidad: {
    drill: "Aceleraciones 10 m + cambio 5-10-5. 4 reps. Recuperación completa.",
    goal: "Mejorar el primer paso y el cambio de dirección sin perder técnica.",
    cue: "Inclinación, brazos, frecuencia en los primeros 5 m.",
  },
  fuerza_estabilidad: {
    drill: "Estabilidad unipodal 20 s + puente / split squat técnico. 3×8. Sin dolor.",
    goal: "Sostener acciones de duelo sin perder el eje.",
    cue: "Rodilla alinea con pie; abdomen firme.",
  },
  resistencia: {
    drill: "Juegos 4v4 de 3 min con 90 s de pausa. Calidad de decisión al minuto 3.",
    goal: "Mantener calidad técnica en el último tercio de la sesión.",
    cue: "Si baja el pase, baja la intensidad del juego, no la exigencia de calidad.",
  },
  prevencion: {
    drill: "Rutina de 8 min: tobillo, isquio, adductor. Registrar molestia 0–10 al cierre.",
    goal: "Cero molestias ignoradas; cargar solo lo que el cuerpo tolera.",
    cue: "Dolor agudo = se para. Molestia 3/10 se modifica, no se heroiza.",
  },
  confianza: {
    drill: "Tareas con éxito temprano (8/10 fácil) y un reto (4/10). Feedback de 1 frase.",
    goal: "Reintentar después del error sin bajarse del ejercicio.",
    cue: "El error es información; el siguiente contacto cuenta.",
  },
  atencion: {
    drill: "Consignas de 6 palabras máximo. Parar el juego si no se ejecutó. Repetir una vez.",
    goal: "Ejecutar la consigna pedida en 8 de 10 paradas.",
    cue: "Una idea por ronda. Comprobar con una pregunta.",
  },
  disciplina: {
    drill: "Ritual de llegada: agua, material, saludo. Cronometrar el arranque de cada bloque.",
    goal: "Puntualidad y cumplimiento de la rutina en 90% de sesiones del mes.",
    cue: "El estándar se ve en el primer minuto, no en el gol.",
  },
  manejo_error: {
    drill: "Tras fallo forzado, 5 s para reset (respirar + consigna) y repetir la acción.",
    goal: "Volver a competir en la siguiente acción, no a la siguiente sesión.",
    cue: "Cuerpo alto, siguiente balón. Nada de teatro.",
  },
  comunicacion: {
    drill: "Cada acción de presión lleva nombre del compañero. Premiar la consigna útil.",
    goal: "Hablar en cada fase de presión o inicio de jugada.",
    cue: "Nombre + lado. Corto y claro.",
  },
  compromiso: {
    drill: "Mini-tarea consciente 10 min en casa (dominadas o perfil) 3 días/semana. Se registra.",
    goal: "Asistencia esperada + práctica extra breve y constante.",
    cue: "Lo que no se registra no se mejora.",
  },
};

const DEFAULT_DRILL: DrillPack = {
  drill: "Circuito de 12 min: 4 min técnica aislada, 4 min oposición reducida, 4 min juego con una sola consigna.",
  goal: "Subir un punto en la escala 1–5 del indicador más bajo en el siguiente corte.",
  cue: "Menos consignas, más repeticiones de calidad.",
};

const KIMI_DEFAULT_BASE = "https://api.moonshot.ai/v1";
const KIMI_DEFAULT_MODEL = "kimi-k2.6";
const OPENAI_DEFAULT_BASE = "https://api.openai.com/v1";
const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

function resolveCoachLlm() {
  const kimiKey = process.env.KIMI_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const apiKey = kimiKey || openaiKey;
  if (!apiKey) return null;

  const explicitBase = (
    process.env.KIMI_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    ""
  ).replace(/\/$/, "");
  const useKimi = Boolean(kimiKey) || explicitBase.includes("moonshot");
  const baseUrl = explicitBase || (useKimi ? KIMI_DEFAULT_BASE : OPENAI_DEFAULT_BASE);
  const model =
    process.env.KIMI_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    (useKimi ? KIMI_DEFAULT_MODEL : OPENAI_DEFAULT_MODEL);

  return { apiKey, baseUrl, model, useKimi };
}

export function isCoachAiConfigured() {
  return Boolean(resolveCoachLlm());
}

function ageBand(age: number | null): "u10" | "u13" | "u16" | "senior" {
  if (age == null) return "u13";
  if (age <= 10) return "u10";
  if (age <= 13) return "u13";
  if (age <= 16) return "u16";
  return "senior";
}

function ageVoice(age: number | null) {
  const band = ageBand(age);
  if (band === "u10") {
    return "lenguaje de juego y contactos; consignas de 4–6 palabras; el éxito se siente, no se explica";
  }
  if (band === "u13") {
    return "fundamentos + una decisión por ejercicio; oposición reducida; vídeo de 2 jugadas propias";
  }
  if (band === "u16") {
    return "rol posicional, presión y calidad al final de la serie; comparar dato vs partido";
  }
  return "exigencia competitiva, carga bien dosificada y criterios de partido, no de exhibición";
}

function scaleLabel(score: number) {
  return DIAGNOSIS_SCALE.find((item) => item.value === Math.round(score))?.label ?? "";
}

function drillFor(indicatorId: string, age: number | null): DrillPack {
  const pack = DRILLS[indicatorId] ?? DEFAULT_DRILL;
  const band = ageBand(age);
  if (band === "u10") {
    return {
      ...pack,
      drill: pack.drill.replaceAll("5v5", "3v3").replaceAll("7v7", "4v4").replaceAll("8v8", "5v5"),
    };
  }
  return pack;
}

function fieldHighlights(session: GphFieldSession, module: DiagnosisModule) {
  const tests = testsForBattery(module, session.protocolStage, session.sessionType);
  return tests
    .map((test) => {
      const capture = session.tests[test.id];
      if (!capture) return null;
      const score = capture.score ?? suggestedScore(test, capture);
      if (score == null && !capture.note && capture.hits == null) return null;
      const hits =
        capture.hits != null && capture.opportunities
          ? `${capture.hits}/${capture.opportunities}`
          : null;
      const best = capture.attempts.filter((item): item is number => item != null);
      return {
        id: test.id,
        label: test.label,
        score,
        hits,
        best: best.length ? Math.max(...best) : null,
        note: capture.note,
        flagged: capture.flagged,
        indicatorId: test.indicatorId,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);
}

function physicalLogged(session: GphFieldSession) {
  return GPH_PHYSICAL_TESTS.filter((test) => {
    const capture = session.physical[test.id];
    return capture?.attempts.some((item) => item != null);
  }).map((test) => test.label);
}

function buildRulesBrief(input: CoachBriefInput): CoachBriefOutput {
  const result = computeDiagnosisResult(input.scores, input.module);
  const stage = result.stage;
  const name = input.firstName.trim() || "El jugador";
  const ageBit = input.age != null ? ` (${input.age} años)` : "";
  const pos = getPositionLabel(input.position);
  const lows = rankedIndicators(input.scores, input.module, "low", 4);
  const highs = rankedIndicators(input.scores, input.module, "high", 3);
  const flagged = input.flagged
    .map((id) => indicatorById(id)?.label)
    .filter((item): item is string => Boolean(item));
  const field = fieldHighlights(input.fieldSession, input.module);
  const fieldWeak = [...field].filter((item) => (item.score ?? 5) <= 3).slice(0, 3);
  const physical = physicalLogged(input.fieldSession);

  const stageRationale = stage
    ? buildStageRationale({
        name,
        stage,
        global: result.globalScore,
        domains: result.domainAverages,
        lows,
        complete: result.complete,
      })
    : "Todavía no hay suficientes indicadores 1–5 para fijar etapa GPH. Completa la escala de cierre.";

  const overall = stage
    ? buildOverall({
        name,
        ageBit,
        pos,
        stage,
        global: result.globalScore,
        highs,
        lows,
        kind: input.kind,
        observation: input.fieldSession.observation,
        playerGoal: input.playerGoal,
      })
    : `${name}${ageBit} aún no tiene perfil cerrado. Prioriza terminar técnica, decisión, físico, mental y hábitos en la misma sesión.`;

  const family = buildFamily({
    name,
    stage,
    lows,
    playerGoal: input.playerGoal,
    familyGoal: input.familyGoal,
  });

  const domains: DiagnosisCoachBrief["domains"] = {};
  for (const domain of DIAGNOSIS_DOMAINS) {
    const average = result.domainAverages[domain];
    if (average == null) continue;
    domains[domain] = buildDomainComment({
      domain,
      average,
      module: input.module,
      scores: input.scores,
      notes: input.notes,
      age: input.age,
      fieldWeak,
    });
  }

  const sessionFocus = buildSessionFocus({
    lows,
    age: input.age,
    module: input.module,
    flagged,
    fieldWeak,
    injuries: input.injuries,
  });

  const warnings = buildWarnings({
    age: input.age,
    stage,
    injuries: input.injuries,
    complete: result.complete,
    sessionType: input.fieldSession.sessionType,
    physical,
    observation: input.fieldSession.observation,
    incident: input.fieldSession.incident,
    flagged,
  });

  const priorities = buildPriorities(lows, input.age, input.notes);
  const monthlyPlan = buildMonthlyPlan(stage, lows, input.age, input.module);
  const assignmentNotes = stage
    ? `${DIAGNOSIS_STAGE_LABELS[stage]}${
        result.globalScore != null ? ` · ${result.globalScore.toFixed(1)}` : ""
      }. ${lows[0] ? `Foco: ${lows[0].label}.` : ""} ${ageVoice(input.age)}.`
    : "Etapa pendiente de escala completa.";

  const brief: DiagnosisCoachBrief = {
    source: "gph",
    generatedAt: new Date().toISOString(),
    stageRationale,
    overall,
    family,
    domains,
    sessionFocus,
    warnings,
  };

  return {
    brief,
    priorities,
    monthlyPlan,
    assignmentNotes,
    source: "gph",
    aiAvailable: isCoachAiConfigured(),
    aiFallback: false,
  };
}

function buildStageRationale(args: {
  name: string;
  stage: DiagnosisStage;
  global: number | null;
  domains: Record<DiagnosisDomain, number | null>;
  lows: ReturnType<typeof rankedIndicators>;
  complete: boolean;
}) {
  const scoreBit =
    args.global != null
      ? `El índice ponderado quedó en ${args.global.toFixed(1)} (iniciación ≤2.2, desarrollo ≤3.7, alto rendimiento ≥3.8).`
      : "El índice aún es parcial.";
  const domainBits = DIAGNOSIS_DOMAINS.filter((domain) => args.domains[domain] != null)
    .map((domain) => `${DIAGNOSIS_DOMAIN_LABELS[domain]} ${args.domains[domain]!.toFixed(1)}`)
    .join("; ");
  const gap = args.lows[0]
    ? `El lastre más claro es ${args.lows[0].label.toLowerCase()} (${args.lows[0].score}/5, ${scaleLabel(args.lows[0].score)}).`
    : "";
  const lock = args.complete
    ? "La etapa es un punto de partida para el programa, no una etiqueta de carrera."
    : "Faltan indicadores: la etapa es orientativa hasta cerrar la escala.";

  return [
    `${args.name} entra a ${DIAGNOSIS_STAGE_LABELS[args.stage].toLowerCase()} según corte GPH. ${scoreBit}`,
    domainBits ? `Perfil: ${domainBits}.` : "",
    gap,
    DIAGNOSIS_STAGE_COPY[args.stage],
    lock,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildOverall(args: {
  name: string;
  ageBit: string;
  pos: string;
  stage: DiagnosisStage;
  global: number | null;
  highs: ReturnType<typeof rankedIndicators>;
  lows: ReturnType<typeof rankedIndicators>;
  kind: DiagnosisKind;
  observation: string;
  playerGoal: string | null;
}) {
  const kindBit =
    args.kind === "seguimiento"
      ? "Es un corte de seguimiento: se compara con el diagnóstico previo, no se reinventa el jugador."
      : args.kind === "revaloracion"
        ? "Es revaloración de ciclo: el criterio es si subió el indicador que se entrenó, no si «se ve mejor»."
        : "Es evaluación inicial: el valor está en la línea base, no en el veredicto.";
  const strength = args.highs[0]
    ? `Se puede construir desde ${args.highs
        .slice(0, 2)
        .map((item) => item.label.toLowerCase())
        .join(" y ")} (${args.highs[0].score}/5).`
    : "";
  const gap = args.lows[0]
    ? `El trabajo de las próximas 8–12 semanas debe girar alrededor de ${args.lows
        .slice(0, 2)
        .map((item) => item.label.toLowerCase())
        .join(" y ")}.`
    : "";
  const obs = args.observation.trim()
    ? `En cancha se observó: ${args.observation.trim().replace(/\.$/, "")}.`
    : "";
  const goal = args.playerGoal?.trim()
    ? `El objetivo que trae (${args.playerGoal.trim()}) solo cuenta si se traduce a una tarea medible por sesión.`
    : "";

  return [
    `${args.name}${args.ageBit}, ${args.pos.toLowerCase()}. ${kindBit}`,
    args.global != null
      ? `Índice ${args.global.toFixed(1)} · etapa ${DIAGNOSIS_STAGE_LABELS[args.stage].toLowerCase()}.`
      : "",
    strength,
    gap,
    obs,
    goal,
    GPH_PRINCIPLE,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildFamily(args: {
  name: string;
  stage: DiagnosisStage | null;
  lows: ReturnType<typeof rankedIndicators>;
  playerGoal: string | null;
  familyGoal: string | null;
}) {
  const stageBit = args.stage
    ? `Hoy el corte GPH lo ubica en ${DIAGNOSIS_STAGE_LABELS[args.stage].toLowerCase()}. Eso describe el punto de partida del programa, no un destino.`
    : "Aún falta cerrar la escala para hablar de etapa.";
  const work = args.lows[0]
    ? `En casa y en el club el foco útil es ${args.lows[0].label.toLowerCase()}: pocas repeticiones conscientes valen más que más partidos.`
    : "El foco es constancia de sesión, no acumular torneos.";
  const familyGoal = args.familyGoal?.trim()
    ? `El objetivo familiar se respeta como dirección, no como promesa de resultado.`
    : "";

  return [
    `Para la familia de ${args.name}: esta ficha sirve para entrenar con criterio.`,
    stageBit,
    work,
    familyGoal,
    "No representa beca, selección, contrato ni resultado profesional. El avance se ve en el siguiente corte con la misma escala.",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildDomainComment(args: {
  domain: DiagnosisDomain;
  average: number;
  module: DiagnosisModule;
  scores: DiagnosisScores;
  notes: DiagnosisNotes;
  age: number | null;
  fieldWeak: ReturnType<typeof fieldHighlights>;
}) {
  const items = indicatorsForModule(args.module).filter((item) => item.domain === args.domain);
  const scored = items
    .map((item) => ({
      ...item,
      score: args.scores[item.id],
      note: args.notes[item.id],
    }))
    .filter((item) => item.score != null)
    .sort((a, b) => (a.score ?? 5) - (b.score ?? 5));
  const weakest = scored[0];
  const strongest = scored[scored.length - 1];
  const tone =
    args.average <= 2.2
      ? "está en construcción: hay que simplificar la tarea y subir contactos de calidad"
      : args.average <= 3.7
        ? "es funcional, pero aún no es estable bajo presión"
        : "ya da para exigir velocidad de ejecución y autonomía";
  const note = weakest?.note?.trim() ? `Nota de estación: ${weakest.note.trim()}.` : "";
  const field = args.fieldWeak.find((item) => {
    const indicator = item.indicatorId ? indicatorById(item.indicatorId) : null;
    return indicator?.domain === args.domain;
  });
  const fieldBit = field
    ? `En protocolo, ${field.label.toLowerCase()} quedó en ${field.score ?? "s/c"}${field.hits ? ` (${field.hits})` : ""}.`
    : "";
  const next = weakest ? drillFor(weakest.id, args.age).cue : DEFAULT_DRILL.cue;

  return [
    `${DIAGNOSIS_DOMAIN_LABELS[args.domain]} ${args.average.toFixed(1)}/5: ${tone}.`,
    weakest && strongest && weakest.id !== strongest.id
      ? `Piso ${weakest.label.toLowerCase()} (${weakest.score}) · techo ${strongest.label.toLowerCase()} (${strongest.score}).`
      : weakest
        ? `Referencia: ${weakest.label.toLowerCase()} (${weakest.score}/5).`
        : "",
    fieldBit,
    note,
    `Consigna de staff: ${next}`,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildSessionFocus(args: {
  lows: ReturnType<typeof rankedIndicators>;
  age: number | null;
  module: DiagnosisModule;
  flagged: string[];
  fieldWeak: ReturnType<typeof fieldHighlights>;
  injuries: string | null;
}): string[] {
  const band = ageBand(args.age);
  const blocks: string[] = [];
  if (args.injuries?.trim()) {
    blocks.push(
      `Arranque: 8 min de prevención y chequeo de molestia (0–10). Restricción declarada: ${args.injuries.trim()}. No forzar sprints ni duelos si hay dolor.`,
    );
  } else {
    blocks.push(
      band === "u10"
        ? "Arranque 8 min: juego de pelota + movilidad. Sin filas; el balón no para."
        : "Arranque 8 min: movilidad de tobillo/cadera y 2 aceleraciones submáximas.",
    );
  }

  args.lows.slice(0, 3).forEach((item, index) => {
    const pack = drillFor(item.id, args.age);
    blocks.push(
      `Bloque ${index + 1} · ${item.label} (${item.score}/5): ${pack.drill} Consigna: ${pack.cue}`,
    );
  });

  if (args.module === "portero") {
    blocks.push(
      "Cierre portero: 8 min de distribución a objetivos + 4 centros con mando verbal. El último bloque es frescura de decisión, no fatiga de lucimiento.",
    );
  } else {
    blocks.push(
      band === "u10"
        ? "Cierre: 8 min de 3v3 con una sola regla (ejemplo: dos chequeos o gol solo de primer toque)."
        : "Cierre 10 min: juego reducido con la consigna del bloque 1. Si no aparece, se para y se repite una vez.",
    );
  }

  if (args.flagged.length) {
    blocks.push(`Prioridad marcada por el evaluador: ${args.flagged.join(", ")}. No diluirla en un circuito genérico.`);
  }
  return blocks.slice(0, 6);
}

function buildWarnings(args: {
  age: number | null;
  stage: DiagnosisStage | null;
  injuries: string | null;
  complete: boolean;
  sessionType: GphFieldSession["sessionType"];
  physical: string[];
  observation: string;
  incident: string;
  flagged: string[];
}) {
  const warnings: string[] = [];
  if (!args.complete) {
    warnings.push(
      "Escala incompleta: no tomes decisiones de grupo o exigencia máxima hasta cerrar físico, mental y hábitos.",
    );
  }
  if (args.injuries?.trim()) {
    warnings.push(
      `Hay restricción declarada (${args.injuries.trim()}). El preparador dosifica; el dato técnico no manda sobre el dolor.`,
    );
  }
  if (args.age != null && args.age <= 11 && args.stage === "alto_rendimiento") {
    warnings.push(
      "Alto rendimiento GPH en esta edad es un corte de ejecución, no un pasaporte a élite. El entrenamiento sigue siendo de formación.",
    );
  }
  if (args.age != null && args.age >= 16 && args.stage === "iniciacion") {
    warnings.push(
      "Iniciación en adolescente mayor: no infantilizar. Bajar complejidad de decisión, no el respeto ni la densidad de contactos.",
    );
  }
  if (args.sessionType === "360" && args.physical.length === 0) {
    warnings.push("Sesión 360 sin batería física registrada. El perfil motriz queda incompleto.");
  }
  if (args.incident.trim()) {
    warnings.push(`Incidente de sesión: ${args.incident.trim()}. Documentar antes del siguiente corte.`);
  }
  if (args.observation.toLowerCase().includes("dolor") || args.observation.toLowerCase().includes("molest")) {
    warnings.push("La observación de cancha menciona molestia. Confirmar con el jugador antes de cargar sprints o 1v1.");
  }
  if (args.flagged.length >= 3) {
    warnings.push(
      `Hay ${args.flagged.length} prioridades marcadas. El mes solo absorbe 3; el resto espera al siguiente ciclo.`,
    );
  }
  return warnings;
}

function buildPriorities(
  lows: ReturnType<typeof rankedIndicators>,
  age: number | null,
  notes: DiagnosisNotes,
): DiagnosisPriorityItem[] {
  return lows.slice(0, 4).map((item) => {
    const pack = drillFor(item.id, age);
    const note = notes[item.id]?.trim();
    return {
      indicator_id: item.id,
      title: item.label,
      baseline: `${item.score} · ${scaleLabel(item.score)}`,
      december_goal: pack.goal,
      progress_indicator: item.criterion,
      main_action: note ? `${pack.drill} Nota de campo: ${note}` : pack.drill,
    };
  });
}

function buildMonthlyPlan(
  stage: DiagnosisStage | null,
  lows: ReturnType<typeof rankedIndicators>,
  age: number | null,
  module: DiagnosisModule,
): DiagnosisMonthlyPlan {
  const plan = emptyMonthlyPlan();
  const primary = lows[0];
  const secondary = lows[1];
  const pack1 = primary ? drillFor(primary.id, age) : DEFAULT_DRILL;
  const pack2 = secondary ? drillFor(secondary.id, age) : DEFAULT_DRILL;
  const gk = module === "portero" ? "Incluir 15 min de portería específica en cada sesión." : "";
  const stageBit = stage ? DIAGNOSIS_STAGE_COPY[stage] : "";

  plan.september = {
    objective: primary
      ? `${DIAGNOSIS_MONTH_META.september.focus}: ${primary.label.toLowerCase()} (${primary.score}/5).`
      : DIAGNOSIS_MONTH_META.september.focus,
    actions: [pack1.drill, "Misma prueba GPH al cierre de mes (dato, no sensación).", gk, stageBit]
      .filter(Boolean)
      .join(" "),
  };
  plan.october = {
    objective: secondary
      ? `${DIAGNOSIS_MONTH_META.october.focus}: ${secondary.label.toLowerCase()} + sostener ${primary?.label.toLowerCase() ?? "la base"}.`
      : DIAGNOSIS_MONTH_META.october.focus,
    actions: [
      pack2.drill,
      "Subir oposición (de aislado a 3v2 / 4v4) sin perder la consigna del mes 1.",
      gk,
    ]
      .filter(Boolean)
      .join(" "),
  };
  plan.november = {
    objective: DIAGNOSIS_MONTH_META.november.focus,
    actions: [
      ageBand(age) === "u10"
        ? "Juegos 3v3 y 4v4 con una regla ligada al foco (escaneo, primer toque o transición)."
        : "Juegos 5v5 / partido interno: la consigna del diagnóstico tiene que aparecer bajo fatiga.",
      "Registrar 3 acciones filmadas del indicador más bajo.",
      gk,
    ]
      .filter(Boolean)
      .join(" "),
  };
  plan.december = {
    objective: DIAGNOSIS_MONTH_META.december.focus,
    actions:
      "Repetir la misma hoja 1–5 y las estaciones GPH de septiembre. Comparar. Si no subió el indicador entrenado, no se cambia de moda: se ajusta la tarea y se vuelve a medir.",
  };
  return plan;
}

function compactFieldForModel(session: GphFieldSession, module: DiagnosisModule) {
  return {
    protocolStage: session.protocolStage,
    sessionType: session.sessionType,
    observation: session.observation || undefined,
    incident: session.incident || undefined,
    tests: fieldHighlights(session, module).map((item) => ({
      label: item.label,
      score: item.score,
      hits: item.hits,
      best: item.best,
      note: item.note || undefined,
      flagged: item.flagged || undefined,
    })),
    physical: physicalLogged(session),
    evidenceCount: session.evidence.length,
    evidenceNotes: session.evidence
      .map((item) => item.caption)
      .filter(Boolean)
      .slice(0, 8),
  };
}

async function enhanceWithOpenAi(
  input: CoachBriefInput,
  base: CoachBriefOutput,
): Promise<CoachBriefOutput> {
  const llm = resolveCoachLlm();
  if (!llm) return base;

  const result = computeDiagnosisResult(input.scores, input.module);
  const { apiKey, baseUrl, model, useKimi } = llm;
  const lows = rankedIndicators(input.scores, input.module, "low", 5);
  const highs = rankedIndicators(input.scores, input.module, "high", 4);

  const payload = {
    principle: GPH_PRINCIPLE,
    player: {
      firstName: input.firstName,
      age: input.age,
      position: getPositionLabel(input.position),
      module: input.module,
      kind: input.kind,
      trainingVoice: ageVoice(input.age),
    },
    gph: {
      globalScore: result.globalScore,
      stage: result.stage,
      stageLocked: true,
      stageCopy: result.stage ? DIAGNOSIS_STAGE_COPY[result.stage] : null,
      domainAverages: result.domainAverages,
      complete: result.complete,
    },
    indicators: indicatorsForModule(input.module).map((item) => ({
      id: item.id,
      label: item.label,
      domain: item.domain,
      score: input.scores[item.id] ?? null,
      note: input.notes[item.id] || undefined,
      flagged: input.flagged.includes(item.id) || undefined,
    })),
    strengths: highs.map((item) => ({ label: item.label, score: item.score })),
    gaps: lows.map((item) => ({ label: item.label, score: item.score, criterion: item.criterion })),
    context: {
      injuries: input.injuries || undefined,
      playerGoal: input.playerGoal || undefined,
      familyGoal: input.familyGoal || undefined,
      whyJoin: input.whyJoin || undefined,
    },
    field: compactFieldForModel(input.fieldSession, input.module),
    draft: {
      stageRationale: base.brief.stageRationale,
      overall: base.brief.overall,
      family: base.brief.family,
      domains: base.brief.domains,
      sessionFocus: base.brief.sessionFocus,
      warnings: base.brief.warnings,
      priorities: base.priorities,
      monthlyPlan: base.monthlyPlan,
      assignmentNotes: base.assignmentNotes,
    },
  };

  const system = [
    "Eres el entrenador en jefe y el preparador físico de una academia seria en México.",
    "Piensas como staff de alto rendimiento aplicado a fútbol formativo: concreto, medible, sin pose.",
    "Redactas en español de México, tuteo profesional al staff; a la familia, claro y respetuoso.",
    "La etapa GPH (iniciación / desarrollo / alto rendimiento) YA está calculada. NO la cambies ni la contradigas.",
    "Medir no es etiquetar. Nada de becas, selecciones, contratos, scouts, ni «tiene madera de profesional».",
    "Cada comentario de dominio debe decir: qué muestran los números, qué se entrena ya, y una consigna o tarea.",
    "Los focos de sesión son bloques de entrenamiento reales (tiempo, formato, consigna), no frases motivacionales.",
    "Respeta edad: infantil = juego y contactos; adolescente = rol y presión dosificada.",
    "Si hay lesión o molestia, la salud manda sobre el plan ambicioso.",
    "Responde SOLO un JSON con las claves: stageRationale, overall, family, domains (tecnica, tactica, fisico, mental, compromiso; omite las que no apliquen), sessionFocus (3 a 6 strings), warnings (array), priorities (array de {title, baseline, december_goal, progress_indicator, main_action, indicator_id}), monthlyPlan ({september,october,november,december} cada uno {objective, actions}), assignmentNotes.",
    "overall: 4 a 7 frases para el staff. family: 3 a 5 frases para padres. stageRationale: 3 a 5 frases. No uses markdown.",
  ].join(" ");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: useKimi ? 0.6 : 0.4,
      response_format: { type: "json_object" },
      ...(useKimi ? { thinking: { type: "disabled" } } : {}),
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Reescribe el borrador GPH con criterio de staff top. Conserva hechos y etapa. Datos:\n${JSON.stringify(payload)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail.slice(0, 180) || `IA ${response.status}: no se pudo generar la lectura.`,
    );
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = body.choices?.[0]?.message?.content;
  if (!raw) throw new Error("La IA no devolvió texto.");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("La IA devolvió un JSON inválido.");
  }

  const brief = parseCoachBrief({
    source: "ai",
    generatedAt: new Date().toISOString(),
    stageRationale: parsed.stageRationale,
    overall: parsed.overall,
    family: parsed.family,
    domains: parsed.domains,
    sessionFocus: parsed.sessionFocus,
    warnings: parsed.warnings,
  });

  if (!brief) throw new Error("La IA no produjo una lectura usable.");

  const monthlyPlan = mergeMonthlyPlan(base.monthlyPlan, parsed.monthlyPlan);
  const priorities = mergePriorities(base.priorities, parsed.priorities);
  const assignmentNotes =
    typeof parsed.assignmentNotes === "string" && parsed.assignmentNotes.trim()
      ? parsed.assignmentNotes.trim()
      : base.assignmentNotes;

  return {
    brief: { ...brief, source: "ai", generatedAt: new Date().toISOString() },
    priorities,
    monthlyPlan,
    assignmentNotes,
    source: "ai",
    aiAvailable: true,
    aiFallback: false,
  };
}

function mergeMonthlyPlan(
  fallback: DiagnosisMonthlyPlan,
  raw: unknown,
): DiagnosisMonthlyPlan {
  const plan = emptyMonthlyPlan();
  const record = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  for (const month of DIAGNOSIS_MONTHS) {
    const item = record[month];
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const row = item as Record<string, unknown>;
      plan[month] = {
        objective:
          typeof row.objective === "string" && row.objective.trim()
            ? row.objective.trim()
            : fallback[month].objective,
        actions:
          typeof row.actions === "string" && row.actions.trim()
            ? row.actions.trim()
            : fallback[month].actions,
      };
    } else {
      plan[month] = fallback[month];
    }
  }
  return plan;
}

function mergePriorities(
  fallback: DiagnosisPriorityItem[],
  raw: unknown,
): DiagnosisPriorityItem[] {
  if (!Array.isArray(raw)) return fallback;
  const parsed = raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      title: String(item.title ?? "").trim(),
      baseline: String(item.baseline ?? "").trim(),
      december_goal: String(item.december_goal ?? item.decemberGoal ?? "").trim(),
      progress_indicator: String(item.progress_indicator ?? item.progressIndicator ?? "").trim(),
      main_action: String(item.main_action ?? item.mainAction ?? "").trim(),
      indicator_id:
        typeof item.indicator_id === "string"
          ? item.indicator_id
          : typeof item.indicatorId === "string"
            ? item.indicatorId
            : undefined,
    }))
    .filter((item) => item.title && item.main_action);
  return parsed.length >= 2 ? parsed.slice(0, 5) : fallback;
}

export async function generateCoachBrief(input: CoachBriefInput): Promise<CoachBriefOutput> {
  const scored = Object.values(input.scores).filter((value) => Number.isFinite(value)).length;
  if (scored < 5) {
    throw new Error("Necesitas al menos 5 indicadores 1–5 para una lectura de entrenador.");
  }

  const base = buildRulesBrief(input);
  if (!isCoachAiConfigured()) return base;

  try {
    return await enhanceWithOpenAi(input, base);
  } catch {
    return { ...base, aiAvailable: true, aiFallback: true };
  }
}

export function applyCoachBriefToSession(
  session: GphFieldSession,
  brief: DiagnosisCoachBrief,
): GphFieldSession {
  return { ...session, coachBrief: brief };
}
