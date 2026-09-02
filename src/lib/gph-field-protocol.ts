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

export type GphConversion = "accuracy" | "contacts_ini" | "contacts_des" | "manual";

export interface GphStationTest {
  id: string;
  number: number;
  label: string;
  unit: string;
  module: DiagnosisModule;
  stage: GphProtocolStage;
  /** esencial = E/360; plus = solo 360 */
  usage: "esencial" | "plus";
  kind: GphTestKind;
  conversion: GphConversion;
  attempts: number;
  maxPoints?: number;
  setup: string;
  execution: string;
  record: string;
  indicatorId?: string;
  relevanceDefault: 1 | 2 | 3;
}

export interface GphTestCapture {
  attempts: Array<number | null>;
  hits: number | null;
  opportunities: number | null;
  errors: number | null;
  leftHits: number | null;
  rightHits: number | null;
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
    stage: GphProtocolStage;
  },
): GphStationTest {
  return partial;
}

export const GPH_STATION_TESTS: readonly GphStationTest[] = [
  t({
    id: "ini_c_dominadas",
    number: 1,
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
    module: "campo",
    stage: "iniciacion",
    usage: "plus",
    label: "Control reducido",
    unit: "contactos / salidas",
    kind: "contacts",
    conversion: "manual",
    attempts: 2,
    setup: "Cuadro 3 × 3 m; cuatro conos.",
    execution: "30 s de contactos libres sin que el balón salga. Dos rondas.",
    record: "Contactos correctos; salidas; pérdidas de control.",
    indicatorId: "control_orientado",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_slalom",
    number: 3,
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Slalom",
    unit: "s + penalización",
    kind: "time",
    conversion: "manual",
    attempts: 2,
    setup: "6 conos cada 1.5 m; recorrido ida y vuelta.",
    execution: "Conducir, girar en el último cono y regresar. Dos intentos.",
    record: "Tiempo; +1 s por cono; +2 s si pierde el balón a más de 1 m.",
    indicatorId: "conduccion",
    relevanceDefault: 2,
  }),
  t({
    id: "ini_c_pase",
    number: 4,
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Pase de precisión",
    unit: "aciertos / 10",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 10,
    setup: "Puerta de 1.5 m a 6 m; línea de golpeo.",
    execution: "10 pases: 5 con cada pie. Balón detenido.",
    record: "Aciertos totales; aciertos por pie; porcentaje bilateral.",
    indicatorId: "pase",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_recepcion",
    number: 5,
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Recepción + pase",
    unit: "puntos / 20",
    kind: "points",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 20,
    setup: "Cuadro 1.5 × 1.5 m; servicio a 5 m; puerta a 6 m.",
    execution: "Recibir dentro del cuadro y pasar por la puerta. 10 servicios.",
    record: "1 punto control + 1 punto pase. Máximo 20.",
    indicatorId: "recepcion",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_tiro",
    number: 6,
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
    label: "Tiro de precisión",
    unit: "puntos / 20",
    kind: "points",
    conversion: "accuracy",
    attempts: 10,
    maxPoints: 20,
    setup: "Línea a 8 m; cuatro objetivos de 1 × 1 m.",
    execution: "10 tiros con balón detenido: 5 por pie.",
    record: "2 objetivo; 1 portería; 0 fuera. Máximo 20.",
    indicatorId: "finalizacion",
    relevanceDefault: 3,
  }),
  t({
    id: "ini_c_golpeo",
    number: 7,
    module: "campo",
    stage: "iniciacion",
    usage: "esencial",
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
    module: "campo",
    stage: "desarrollo",
    usage: "plus",
    label: "Dominio por patrones",
    unit: "ciclos / errores",
    kind: "contacts",
    conversion: "manual",
    attempts: 4,
    setup: "Cuadro 3 × 3 m.",
    execution: "Interior-interior, planta, exterior y arrastre; 20 s por patrón.",
    record: "Ciclos correctos y errores por patrón.",
    indicatorId: "control_orientado",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_slalom",
    number: 3,
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Slalom a velocidad",
    unit: "s + penalización",
    kind: "time",
    conversion: "manual",
    attempts: 2,
    setup: "8 conos cada 1.2 m; giro de 180 grados.",
    execution: "Ida y vuelta a máxima velocidad controlada. Dos intentos.",
    record: "Tiempo; +1 s por cono; +2 s por pérdida a más de 1 m.",
    indicatorId: "conduccion",
    relevanceDefault: 2,
  }),
  t({
    id: "des_c_pase",
    number: 4,
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Pase de precisión",
    unit: "aciertos / 12",
    kind: "accuracy",
    conversion: "accuracy",
    attempts: 12,
    maxPoints: 12,
    setup: "Puerta de 1 m a 10 m.",
    execution: "12 pases: 6 por pie; balón detenido.",
    record: "Aciertos; % por pie; diferencia bilateral.",
    indicatorId: "pase",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_control",
    number: 5,
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Control orientado",
    unit: "puntos / 24",
    kind: "points",
    conversion: "accuracy",
    attempts: 12,
    maxPoints: 24,
    setup: "Servicio a 8 m; dos zonas de 1.5 × 1.5 m.",
    execution: "Tras salir el balón se indica izquierda/derecha; controlar y pasar. 12 repeticiones.",
    record: "1 punto zona + 1 pase; tiempo de ejecución. Máximo 24.",
    indicatorId: "control_orientado",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_tiro",
    number: 6,
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
    label: "Tiro en movimiento",
    unit: "puntos / 24",
    kind: "points",
    conversion: "accuracy",
    attempts: 12,
    maxPoints: 24,
    setup: "Conducción 3 m; tiro desde 12–14 m; cuatro objetivos.",
    execution: "12 tiros: 6 por pie. Radar opcional.",
    record: "2 objetivo; 1 portería; 0 fuera.",
    indicatorId: "finalizacion",
    relevanceDefault: 3,
  }),
  t({
    id: "des_c_largo",
    number: 7,
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
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
    number: 8,
    module: "campo",
    stage: "desarrollo",
    usage: "plus",
    label: "Velocidad + 5-10-5",
    unit: "s",
    kind: "time",
    conversion: "manual",
    attempts: 4,
    setup: "Líneas a 10 y 20 m; circuito 5-10-5.",
    execution: "Dos sprints y dos cambios de dirección por lado.",
    record: "Tiempos; mejor marca; diferencia derecha/izquierda.",
    indicatorId: "velocidad",
    relevanceDefault: 2,
  }),
  t({
    id: "des_c_duelo",
    number: 9,
    module: "campo",
    stage: "desarrollo",
    usage: "plus",
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
    number: 10,
    module: "campo",
    stage: "desarrollo",
    usage: "esencial",
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
    id: "des_p_pies",
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
];

export const GPH_PHYSICAL_TESTS = [
  {
    id: "salto_horizontal",
    label: "Salto horizontal",
    protocol: "3 intentos. Desde la línea hasta el talón posterior.",
    unit: "cm",
    attempts: 3,
    desarrolloOnly: false,
    indicatorId: "fuerza_estabilidad" as const,
  },
  {
    id: "equilibrio",
    label: "Equilibrio unipodal",
    protocol: "30 s por pierna. Contar apoyos, salto o salida de zona.",
    unit: "errores",
    attempts: 3,
    desarrolloOnly: false,
    indicatorId: "fuerza_estabilidad" as const,
  },
  {
    id: "sprint_5m",
    label: "Sprint 5 m",
    protocol: "2 intentos. Salida fija; cronometrar 5 m. Mejor marca; 60 s de recuperación.",
    unit: "s",
    attempts: 2,
    desarrolloOnly: false,
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
    label: "Cambio 5-10-5",
    protocol: "2 por lado. Registrar diferencia derecha/izquierda.",
    unit: "s",
    attempts: 4,
    desarrolloOnly: false,
    indicatorId: "velocidad" as const,
  },
  {
    id: "movilidad_tobillo",
    label: "Movilidad de tobillo",
    protocol: "Rodilla a la pared. Talón sin despegar.",
    unit: "cm",
    attempts: 2,
    desarrolloOnly: false,
    indicatorId: "movilidad" as const,
  },
  {
    id: "resistencia_20",
    label: "Resistencia de velocidad",
    protocol: "6 × 20 m. Solo Desarrollo; controlar recuperación.",
    unit: "% fatiga",
    attempts: 6,
    desarrolloOnly: true,
    indicatorId: "resistencia" as const,
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
  { minutes: "0–10", title: "Activación", detail: "Registro, número y ensayo que no cuenta." },
  { minutes: "10–55", title: "Técnica", detail: "Tres bloques de 15 min; dos pruebas relacionadas." },
  { minutes: "55–70", title: "Velocidad / golpeo", detail: "Recuperación y orden fijo." },
  { minutes: "70–85", title: "Duelo / juego", detail: "Grabar oportunidades, no impresiones." },
  { minutes: "85–90", title: "Cierre", detail: "Revisar vacíos y guardar videos." },
] as const;

export const GPH_ROTATION_PORTERO = [
  { minutes: "10 min", title: "Activación", detail: "Registro y ensayo no válido." },
  { minutes: "30 min", title: "Pies / manos", detail: "Posición, desplazamiento y blocaje." },
  { minutes: "25 min", title: "Acciones", detail: "Caídas, 1v1 y reacción." },
  { minutes: "15 min", title: "Distribución", detail: "Mano, pie y despeje." },
  { minutes: "10 min", title: "Cierre", detail: "Campos vacíos y video." },
] as const;

export const GPH_WEEK_360 = [
  { day: 1, title: "Técnica base", tests: "Dominio, conducción, pase, recepción, blocaje.", deliverable: "Resultados técnicos crudos." },
  { day: 2, title: "Físico y funcional", tests: "Sprint 5/10/20/30 m, salto, equilibrio, movilidad y fisioterapia.", deliverable: "Perfil físico y alertas." },
  { day: 3, title: "Decisión y mental", tests: "Duelo, juego aplicado, reacción al error y concentración.", deliverable: "Conductas observadas." },
  { day: 4, title: "Aplicación y cierre", tests: "Tiro, golpeo, distribución, competencia y nutrición.", deliverable: "3–5 prioridades y plan." },
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
  return GPH_STATION_TESTS.filter((test) => {
    if (test.module !== module || test.stage !== stage) return false;
    if (sessionType === "esencial") return test.usage === "esencial";
    return true;
  });
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

export function testNeedsBilateral(test: GphStationTest) {
  const text = `${test.record} ${test.execution} ${test.unit}`.toLowerCase();
  return (
    text.includes("bilateral") ||
    text.includes("por pie") ||
    text.includes("pie menos") ||
    text.includes("pie menor")
  );
}

export function testNeedsRadar(test: GphStationTest) {
  return /km\/h|radar/i.test(`${test.unit} ${test.execution} ${test.record}`);
}

export function weakerFootPercent(left: number | null, right: number | null) {
  if (left == null || right == null) return null;
  const total = left + right;
  if (total <= 0) return null;
  return (Math.min(left, right) / total) * 100;
}

export function scoreFromAccuracyPercent(percent: number) {
  if (percent <= 20) return 1;
  if (percent <= 40) return 2;
  if (percent <= 60) return 3;
  if (percent <= 80) return 4;
  return 5;
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
  if (test.conversion === "accuracy") {
    const percent = derivedPercent(test, capture);
    return percent == null ? null : scoreFromAccuracyPercent(percent);
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
    return (
      numericAttempts(capture).length > 0 ||
      capture.hits != null ||
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
  if (isRatioKind(test.kind)) {
    const hits = capture.hits;
    const max = capture.opportunities ?? test.maxPoints;
    if (hits == null || max == null || max <= 0) return false;
  } else if (numericAttempts(capture).length === 0) {
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
  const filled = tests.filter((test) => isTestCaptureComplete(test, session.tests[test.id]));
  return { filled: filled.length, total: tests.length, missing: tests.filter((test) => !isTestCaptureComplete(test, session.tests[test.id])) };
}

export function formatTestRaw(test: GphStationTest, capture: GphTestCapture | undefined) {
  if (!capture) return "—";
  if (isRatioKind(test.kind)) {
    const hits = capture.hits;
    const max = capture.opportunities ?? test.maxPoints;
    if (hits == null && max == null && capture.errors == null) {
      const values = numericAttempts(capture);
      if (values.length === 0) return "—";
    }
    const parts: string[] = [];
    if (hits != null && max != null) parts.push(`${formatMeasure(hits, true)}/${formatMeasure(max, true)}`);
    else if (hits != null) parts.push(formatMeasure(hits, true));
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
      tests[id] = {
        attempts,
        hits: parseNum(raw.hits),
        opportunities: parseNum(raw.opportunities),
        errors: parseNum(raw.errors),
        leftHits: parseNum(raw.leftHits),
        rightHits: parseNum(raw.rightHits),
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
  const tri = (raw: unknown) => (raw === true ? true : raw === false ? false : null);
  const closingRaw = isRecord(value.closing) ? value.closing : {};
  return {
    protocolStage: stage,
    sessionType,
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
  if (session.sessionType === "360") {
    for (const test of GPH_PHYSICAL_TESTS) {
      if (test.desarrolloOnly && session.protocolStage !== "desarrollo") continue;
      const capture = session.physical[test.id];
      if (capture?.score == null) continue;
      const list = buckets.get(test.indicatorId) ?? [];
      list.push(capture.score);
      buckets.set(test.indicatorId, list);
    }
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
