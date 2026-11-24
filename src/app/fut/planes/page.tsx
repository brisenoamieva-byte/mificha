import { redirect } from "next/navigation";

/**
 * Ya no hay planes de pago de plataforma: persona y academia son gratis.
 * El cobro vive en Productos GPH. /fut/planes redirige a Entrar (elegir cuenta).
 */
export default function PlanesPage() {
  redirect("/fut/entrar");
}
