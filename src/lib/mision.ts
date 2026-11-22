/** Copy de misión — tono directo, sin jerga de pitch. */

export const MISION_PATH = "/fut/mision";

export const FOUNDER_BADGE_LABEL = "Fundador 2026";
export const FOUNDER_BADGE_HINT =
  "Publicaste en Explorar cuando apenas había fichas. Gracias.";

export const MISION_GOALS = [
  {
    id: "fichas",
    label: "Fichas",
    target: "2 000",
    detail: "Jugadores con su ficha",
  },
  {
    id: "optin",
    label: "En Explorar",
    target: "35%",
    detail: "Con la firma del tutor",
  },
  {
    id: "estados",
    label: "Estados con gente",
    target: "3",
    detail: "100 fichas o más en cada uno",
  },
] as const;

export const MISION_STAGES = [
  {
    n: "1",
    title: "Llenar la base",
    now: true,
    body: "Que tu ciudad tenga jugadores en el mapa y en Explorar. Sin fichas, lo demás no sirve.",
  },
  {
    n: "2",
    title: "Evaluaciones y video",
    now: false,
    body: "GPH y video, donde ya haya jugadores. Para que la ficha diga más que la posición.",
  },
  {
    n: "3",
    title: "Torneos en la ficha",
    now: false,
    body: "Que el resultado del torneo pase a la ficha sin capturarlo a mano. Torneos de varios estados.",
  },
  {
    n: "4",
    title: "Clubes y academias",
    now: false,
    body: "Eso es para cuando ya haya muchos jugadores. Hoy no lo prometemos.",
  },
] as const;

export const MISION_ACTIONS = [
  {
    title: "Arma la ficha",
    body: "Unos minutos. Foto, posición y ciudad de tu hijo.",
    href: "/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=cta&utm_campaign=crear_ficha",
    cta: "Crear ficha",
  },
  {
    title: "Publícala en Explorar",
    body: "Sin tu firma no sale. Tú decides si se ve.",
    href: "/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=cta&utm_campaign=consent",
    cta: "Ir a firmar",
  },
  {
    title: "Pásala a los papás",
    body: "Por WhatsApp, a los del equipo. Con tres fichas, tu ciudad ya se nota en el mapa.",
    href: "/fut/entrar?next=/fut/tutor&utm_source=mision&utm_medium=cta&utm_campaign=invite",
    cta: "Invitar al equipo",
  },
] as const;
