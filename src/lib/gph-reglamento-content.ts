/**
 * Reglamento y Carta Compromiso GPH 2027 — plantilla versionada.
 * Cualquier cambio de texto o tarifas = nueva versión (bump VERSION).
 */

export const GPH_REGLAMENTO_VERSION = "2027.1";
export const GPH_REGLAMENTO_TITLE = "Reglamento y Carta Compromiso";
export const GPH_REGLAMENTO_ISSUED_AT = "2027-01-01";

export const GPH_ACADEMY_SLUG = "academia-gph";

export const GPH_SEDES = [
  { id: "casa_juventud", label: "Casa de la Juventud" },
  { id: "san_javier", label: "San Javier" },
] as const;

export const GPH_SCHEDULES = [
  { id: "lun_mie", label: "Lunes y miércoles" },
  { id: "mar_jue", label: "Martes y jueves" },
] as const;

export const GPH_POSITIONS = [
  { id: "campo", label: "Campo" },
  { id: "portero", label: "Portero" },
] as const;

export const GPH_LEVELS = [
  {
    id: "iniciacion",
    label: "Iniciación",
    monthlyMxn: 1200,
    prepaidMonthlyMxn: 1080,
  },
  {
    id: "desarrollo",
    label: "Desarrollo",
    monthlyMxn: 1700,
    prepaidMonthlyMxn: 1530,
  },
  {
    id: "alto_rendimiento",
    label: "Alto Rendimiento",
    monthlyMxn: 2200,
    prepaidMonthlyMxn: 1980,
  },
] as const;

export const GPH_INSCRIPTION_MXN = 800;

export type GphLevelId = (typeof GPH_LEVELS)[number]["id"];
export type GphSedeId = (typeof GPH_SEDES)[number]["id"];
export type GphScheduleId = (typeof GPH_SCHEDULES)[number]["id"];
export type GphPositionId = (typeof GPH_POSITIONS)[number]["id"];
export type GphPaymentMode = "monthly" | "prepaid";

export interface GphReglamentoSection {
  id: string;
  title: string;
  paragraphs: string[];
}

/** Cuerpo fijo del reglamento (secciones 3–9). Secciones 1–2 son campos del acuerdo. */
export const GPH_REGLAMENTO_SECTIONS: GphReglamentoSection[] = [
  {
    id: "compromisos_gph",
    title: "3. Compromisos de GPH Performance Hub",
    paragraphs: [
      "Planeación profesional. Diseño de sesiones con objetivos definidos. Planeamos, corregimos y acompañamos a cada jugador siempre priorizando el respeto.",
      "Servicio personalizado dentro del grupo. Adaptación de tareas, correcciones y progresiones a cada nivel, posición, edad y prioridades del jugador, sin que ello constituya una sesión individual exclusiva.",
      "Diagnóstico inicial. Evaluación de los componentes técnicos, tácticos, físicos, mentales y de hábitos aplicables a la etapa y posición correspondiente de cada jugador.",
      "Plan de acción. Determinación de la etapa del jugador (Iniciación, Desarrollo o Alto Rendimiento). Se establecen de 3 a 5 prioridades medibles para el programa.",
      "Seguimiento. Realización de retroalimentación durante el programa, así como una revaloración de cierre.",
      "Comunicación. Información oportuna sobre cambios de sede, horario, suspensión o ajuste operativo.",
      "Plazos: el diagnóstico inicial se realizará después de haber completado dos sesiones de observación. El plan de acción escrito con 3 a 5 prioridades se entregará dentro de los 5 días hábiles posteriores al diagnóstico. La retroalimentación final se realizará dentro de los 5 días hábiles posteriores a la revaloración de cierre. Si faltan sesiones para evaluar, el plazo se recorrerá y GPH lo notificará.",
    ],
  },
  {
    id: "compromisos_familia",
    title: "4. Compromisos de la familia y del jugador",
    paragraphs: [
      "Asistencia mínima. Mantener por lo menos 85% de asistencia respecto de las sesiones base programadas para su grupo (se utiliza el calendario real del grupo y se excluyen las sesiones canceladas por GPH). Si el ciclo contempla 32 sesiones base, se requieren al menos 28 asistencias.",
      "Base del 100%. Dos sesiones por semana constituyen el 100% de asistencia de referencia. Las sesiones adicionales son complementarias y no modifican esta base, salvo acuerdo escrito distinto.",
      "Puntualidad. Presentarse 10 minutos antes del inicio, con ropa deportiva, hidratación y material personal requerido. Un retraso mayor a 15 minutos se registrará como retardo y puede limitar el aprovechamiento o la evaluación de esa sesión.",
      "Avisos. Notificar ausencias previsibles con al menos 24 horas de anticipación y comunicar de inmediato lesiones, enfermedad o restricciones médicas.",
      "Respeto y colaboración. Mantener trato respetuoso con jugadores, familias, profesores, coordinadores, personal de sede y terceros; evitar instrucciones desde la banda que contradigan el trabajo del profesor.",
      "Información veraz. Proporcionar datos correctos de salud, contacto y experiencia deportiva, y actualizar cualquier cambio relevante.",
    ],
  },
  {
    id: "pagos",
    title: "5. Pagos, recargos y beneficio por anticipado",
    paragraphs: [
      "Inscripción. Cargo único de $800 para nuevos alumnos, cubierto antes de la primera sesión. No aplica a alumnos activos de GPH.",
      "Fecha ordinaria. La mensualidad deberá cubrirse dentro de los primeros 5 días naturales de cada mes. Del día 6 al 9 el pago continúa pendiente sin recargo. A partir del día 10 se aplica un recargo del 5% sobre la mensualidad vencida. Si el saldo continúa pendiente al iniciar otro mes, podrá aplicarse un nuevo 5% mensual simple sobre la mensualidad original, sin capitalizar recargos.",
      "Transparencia. GPH informará el saldo, el recargo aplicable y el total a pagar; no se realizarán cargos adicionales no previstos en este documento sin aceptación de la familia.",
      "Beneficio por anticipado. El pago anticipado de todo el periodo recibe 10% de descuento y bonifica la inscripción. El descuento no se acumula con otras promociones ni es retroactivo.",
      "Si un jugador está inactivo sin cubrir sus mensualidades durante 2 meses, para retomar los entrenamientos deberá cubrir el monto de su inscripción.",
    ],
  },
  {
    id: "inasistencias",
    title: "6. Inasistencias, reposiciones y cancelaciones",
    paragraphs: [
      "Las inasistencias personales no generan devolución automática ni obligan a una reposición individual. GPH podrá ofrecer recuperación en otro grupo únicamente cuando exista espacio y compatibilidad de nivel.",
      "Si GPH cancela una sesión, deberá reponerla, aplicar un crédito proporcional o acordar otra solución con la familia.",
      "La baja definitiva deberá solicitarse por escrito. En pagos mensuales, no se generarán mensualidades posteriores a la fecha efectiva de baja, siempre que se haya cubierto lo ya vencido. En pago anticipado, cualquier devolución por meses completos no utilizados se calculará restando del monto pagado los meses cursados a precio mensual regular, así como los saldos pendientes. Cuando la cancelación total sea atribuible a GPH, se devolverá la parte no prestada sin perder el beneficio otorgado.",
    ],
  },
  {
    id: "salud",
    title: "7. Salud, seguridad y conducta",
    paragraphs: [
      "La familia deberá informar lesiones, alergias, tratamientos o restricciones que puedan afectar la práctica. El diagnóstico deportivo no sustituye una valoración médica.",
      "GPH podrá limitar la participación cuando exista riesgo razonable para el jugador o terceros y solicitar autorización médica para su reincorporación.",
      "Cualquier situación de agresión, acoso, discriminación, daño intencional o falta grave será atendida con la familia. Las medidas deberán ser proporcionales, comunicadas por escrito y orientadas a proteger a los menores y al grupo.",
    ],
  },
  {
    id: "resultados",
    title: "8. Seguimiento, resultados y comunicación",
    paragraphs: [
      "El objetivo de este programa es obtener una mejora medible, hábitos y desarrollo individual. GPH asume la responsabilidad y el compromiso de prestar el servicio acordado, pero no garantiza convocatorias, visorías, becas, selección, contrato profesional ni un resultado deportivo específico.",
    ],
  },
  {
    id: "aceptacion",
    title: "9. Aceptación y derechos",
    paragraphs: [
      "Cualquier modificación sustancial de precio, horario, sede, alcance o condiciones deberá comunicarse por escrito y ser aceptada por las partes. Nada de lo aquí previsto limita los derechos que correspondan a la familia como consumidora. Las partes procurarán resolver primero cualquier diferencia por comunicación directa y de buena fe.",
      "Al firmar, las partes declaran haber leído, comprendido y aceptado el presente Reglamento y Carta Compromiso.",
    ],
  },
];

export function getGphLevel(id: string) {
  return GPH_LEVELS.find((row) => row.id === id) ?? null;
}

export function computeGphPackage(input: {
  levelId: GphLevelId;
  paymentMode: GphPaymentMode;
  months: number;
  inscriptionExempt: boolean;
}) {
  const level = getGphLevel(input.levelId);
  if (!level) throw new Error("Nivel inválido.");
  const months = Math.max(1, Math.min(24, Math.round(input.months)));
  const monthly =
    input.paymentMode === "prepaid" ? level.prepaidMonthlyMxn : level.monthlyMxn;
  const tuition = monthly * months;
  const inscription =
    input.paymentMode === "prepaid" || input.inscriptionExempt
      ? 0
      : GPH_INSCRIPTION_MXN;
  return {
    level,
    months,
    monthlyMxn: monthly,
    tuitionMxn: tuition,
    inscriptionMxn: inscription,
    totalMxn: tuition + inscription,
  };
}
