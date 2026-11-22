/** Copy de misión — tono directo, sin jerga de pitch. */

export const MISION_PATH = "/fut/mision";

export const FOUNDER_BADGE_LABEL = "Fundador 2026";
export const FOUNDER_BADGE_HINT =
  "Publicaste en Explorar cuando la base todavía se está armando. Gracias por sumar.";

export const MISION_GOALS = [
  {
    id: "fichas",
    label: "Fichas",
    target: "2 000",
    detail: "Jugadores con ficha en MiFicha",
  },
  {
    id: "optin",
    label: "En Explorar",
    target: "35%",
    detail: "Con consentimiento del tutor",
  },
  {
    id: "estados",
    label: "Estados fuertes",
    target: "3",
    detail: "Con al menos 100 fichas cada uno",
  },
] as const;

export const MISION_STAGES = [
  {
    n: "1",
    title: "Llenar la base",
    now: true,
    body: "Que haya jugadores de verdad en el mapa y en Explorar. Sin eso, lo demás no sirve.",
  },
  {
    n: "2",
    title: "Mejor señal",
    now: false,
    body: "Evaluaciones GPH, video e historial donde ya haya gente. Para que un scout vea algo útil.",
  },
  {
    n: "3",
    title: "Torneos conectados",
    now: false,
    body: "Que los resultados de torneos entren solos a la ficha, con organizers de varios estados.",
  },
  {
    n: "4",
    title: "Más puertas",
    now: false,
    body: "Clubes, academias y apoyos cuando la base ya sea grande. No prometemos eso hoy.",
  },
] as const;

export const MISION_ACTIONS = [
  {
    title: "Arma la ficha",
    body: "En unos minutos. Foto, posición, ciudad. Es del jugador.",
    href: "/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=cta&utm_campaign=crear_ficha",
    cta: "Crear ficha",
  },
  {
    title: "Publícala en Explorar",
    body: "Hace falta tu firma. Sin eso no aparece en el buscador.",
    href: "/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=cta&utm_campaign=consent",
    cta: "Ir a firmar",
  },
  {
    title: "Pásalo a otros padres",
    body: "Si tres del equipo arman ficha, tu ciudad empieza a verse en el mapa.",
    href: "/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=cta&utm_campaign=invite",
    cta: "Entrar e invitar",
  },
] as const;
