/** Fase de lanzamiento: acceso gratuito para academias, padres y scouts. */
export function isLaunchFreeMode() {
  const flag = process.env.NEXT_PUBLIC_LAUNCH_FREE;

  if (flag === "false") return false;
  return true;
}

export const LAUNCH_COPY = {
  badge: "Lanzamiento",
  title: "MiFicha está en lanzamiento",
  description:
    "Acceso completo gratis como academia fundadora. Carga plantel, captura minutos post-partido y MiFicha avisa a tutores por email o WhatsApp.",
  footnote:
    "Las academias que entren ahora quedan registradas como fundadoras.",
} as const;
