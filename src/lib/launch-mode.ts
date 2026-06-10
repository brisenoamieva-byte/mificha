/** Fase de lanzamiento: academias activas sin flujo de suscripción. */
export function isLaunchFreeMode() {
  const flag = process.env.NEXT_PUBLIC_LAUNCH_FREE;

  if (flag === "false") return false;
  return true;
}
