/** Fase de lanzamiento: acceso gratuito para academias, padres y scouts. */
export function isLaunchFreeMode() {
  const flag = process.env.NEXT_PUBLIC_LAUNCH_FREE;

  if (flag === "false") return false;
  return true;
}
