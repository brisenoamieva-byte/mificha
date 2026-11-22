/** Narrativa de etapa fundacional — co-construcción de la red. */

export const MISION_PATH = "/fut/mision";

export const FOUNDER_BADGE_LABEL = "Fundador de la base 2026";
export const FOUNDER_BADGE_HINT =
  "Firmaste consentimiento en la etapa fundacional. Tu ficha ayuda a construir el catálogo nacional.";

export const MISION_GOALS = [
  {
    id: "fichas",
    label: "Fichas en la red",
    target: "2 000+",
    detail: "Familias con ficha armada en MiFicha",
  },
  {
    id: "optin",
    label: "Consentimiento Explorar",
    target: "≥ 35%",
    detail: "Para que el directorio muestre talento real",
  },
  {
    id: "estados",
    label: "Estados con densidad",
    target: "≥ 3 × 100",
    detail: "Al menos 100 fichas en tres estados",
  },
] as const;

export const MISION_STAGES = [
  {
    n: "1",
    title: "Fundación de la base",
    now: true,
    body: "Armar el catálogo nacional de jugadores amateurs con consentimiento. Cada ficha suma; la red es de quien participa.",
  },
  {
    n: "2",
    title: "Señal y competitividad",
    now: false,
    body: "Evaluaciones, video e historial donde ya hay densidad. Datos objetivos para scouts, academias y familias.",
  },
  {
    n: "3",
    title: "Torneos conectados",
    now: false,
    body: "Organizadores ligan resultados a fichas MF- para que el desempeño viaje solo entre sedes de México.",
  },
  {
    n: "4",
    title: "Puertas y apoyos",
    now: false,
    body: "Visibilidad ante clubes, educación y apoyos deportivos o académicos cuando la red tenga escala y partners reales.",
  },
] as const;

export const MISION_ACTIONS = [
  {
    title: "Publica la ficha",
    body: "Nombre, categoría, posición y foto. Es tuya; el código MF- te identifica en la red.",
    href: "/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=cta&utm_campaign=crear_ficha",
    cta: "Armar ficha en ~5 min",
  },
  {
    title: "Firma Explorar",
    body: "Sin consentimiento no hay directorio. Al firmar entras como fundador de la base 2026.",
    href: "/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=cta&utm_campaign=consent",
    cta: "Ir a firmar",
  },
  {
    title: "Invita a 3 del equipo",
    body: "La red crece cuando un padre suma a otros. Si es de todos, se comparte.",
    href: "/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=cta&utm_campaign=invite",
    cta: "Entrar e invitar",
  },
] as const;
