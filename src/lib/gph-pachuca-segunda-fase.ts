export const GPH_PACHUCA_PATH = "/fut/pachuca";

export const GPH_PACHUCA_POSTER =
  "/marketing/gph-cracks-pachuca-segunda-fase.jpg";

export const GPH_PACHUCA_SEGUNDA_FASE = {
  alliance: "GPH + CRACKS",
  eyebrow: "Orgullo GPH",
  title: "Los sueños comienzan a convertirse en oportunidades",
  headline:
    "Cuatro jugadores pasan a la segunda fase de evaluación con el Club Pachuca.",
  place: "Universidad del Fútbol · Pachuca",
  origin: "Visorías de abril · Querétaro",
  shareTitle: "GPH + CRACKS | LOS SUEÑOS COMIENZAN A CONVERTIRSE EN OPORTUNIDADES",
  paragraphs: [
    "Hoy vivimos uno de esos momentos que nos recuerdan por qué comenzamos este proyecto, por qué creemos en el talento de nuestros niños y por qué vale la pena seguir trabajando por sus sueños.",
    "Con enorme emoción y gratitud, hoy vemos los primeros frutos de las visorías que realizamos en abril junto al Club Pachuca.",
    "Aquella oportunidad que comenzó en Querétaro hoy se convierte en un nuevo paso para cuatro de nuestros jugadores, quienes tendrán la oportunidad de presentarse nuevamente ante el Club Pachuca, en una segunda fase de evaluación en la Universidad del Fútbol, en Pachuca.",
    "Para nosotros, esto representa mucho más que una convocatoria. Representa ilusión, esfuerzo, disciplina, sacrificios y, sobre todo, la posibilidad de seguir avanzando en un camino que sabemos que no es sencillo.",
  ],
  thanksClub: [
    "Queremos agradecer profundamente al Club Pachuca y a su visor oficial, por haber confiado en nuestro proyecto, por viajar a Querétaro para observar el talento de nuestros jugadores y por abrirles las puertas para continuar con su proceso de evaluación.",
  ],
  thanksFamilies: [
    "Pero hoy queremos hacer un reconocimiento muy especial a quienes verdaderamente están detrás de cada uno de estos sueños: los papás y las familias.",
    "A ustedes, que hacen un esfuerzo todos los días; que reorganizan sus horarios, recorren kilómetros, esperan durante horas en una cancha, acompañan cada entrenamiento, celebran los triunfos y abrazan a sus hijos cuando las cosas no salen como esperaban.",
    "Ustedes son el verdadero motor de estos sueños. Sin su amor, compromiso, confianza y entrega, ninguna de estas oportunidades sería posible.",
  ],
  thanksAcademies: [
    "También queremos reconocer y agradecer sinceramente a todas las academias, escuelas, clubes y entrenadores que han formado parte del desarrollo de estos jugadores.",
    "Porque tenemos muy claro algo: ningún jugador se forma en un solo lugar, ni su crecimiento es resultado del trabajo de una sola institución.",
    "Cada entrenador que les enseñó sus primeros fundamentos, cada academia que creyó en ellos, cada compañero que los hizo mejores y cada experiencia vivida en una cancha forman parte de su historia.",
    "GPH y CRACKS no pretendemos ser los protagonistas de ese recorrido. Somos un canal, un puente, un granito de arena más que se suma al esfuerzo de muchas personas para acercar a nuestros jugadores a nuevas oportunidades.",
    "Y precisamente esa es nuestra misión: abrir puertas, generar oportunidades y ayudar a que el talento encuentre caminos para seguir creciendo.",
  ],
  toPlayers: [
    "A nuestros cuatro jugadores, queremos decirles que estamos profundamente orgullosos de ustedes. Disfruten esta experiencia, jueguen con el corazón, confíen en lo que han aprendido y recuerden que cada oportunidad es un paso más en su formación.",
    "Ser convocados a una segunda fase es un logro importante, pero sabemos que el camino continúa y que todavía hay mucho por aprender, trabajar y conquistar.",
  ],
  closing: [
    "A todas las familias que han confiado en GPH y CRACKS: gracias.",
    "Gracias por creer cuando apenas comenzábamos, por acompañarnos en este proyecto y por permitirnos ser parte de los sueños de sus hijos.",
    "Hoy son cuatro jugadores los que dan este paso. Nuestro compromiso es seguir trabajando para que mañana sean muchos más los niños y jóvenes queretanos que tengan la oportunidad de mostrar su talento ante el fútbol profesional.",
    "Esto apenas comienza. Seguiremos adelante, con humildad, compromiso y la firme convicción de que los sueños se construyen trabajando juntos.",
  ],
  motto:
    "No somos dueños de los sueños de nuestros jugadores. Somos parte del camino que los ayuda a alcanzarlos.",
} as const;

export function gphPachucaPublicUrl(baseUrl?: string) {
  const root = (baseUrl ?? "https://www.mificha.mx").replace(/\/$/, "");
  return `${root}${GPH_PACHUCA_PATH}`;
}

export function gphPachucaShareHref(baseUrl?: string) {
  const url = gphPachucaPublicUrl(baseUrl);
  const text = `${GPH_PACHUCA_SEGUNDA_FASE.shareTitle}

${GPH_PACHUCA_SEGUNDA_FASE.headline}

${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
