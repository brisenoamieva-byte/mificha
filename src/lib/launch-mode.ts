/** Fase de lanzamiento: acceso gratuito para academias, padres y scouts. */
export function isLaunchFreeMode() {
  const flag = process.env.NEXT_PUBLIC_LAUNCH_FREE;

  if (flag === "false") return false;
  return true;
}

export const LAUNCH_COPY = {
  badge: "Lanzamiento · acceso gratuito",
  title: "MiFicha está en lanzamiento",
  description:
    "Por ahora todas las academias tienen acceso completo sin costo. Enfócate en cargar plantel, registrar partidos y compartir fichas con padres.",
  footnote:
    "Cuando haya suficiente base de academias y talento verificado, activaremos planes de pago. Las academias fundadoras serán las primeras en enterarse.",
} as const;
