import { redirect } from "next/navigation";

/** Espacio unificado: tutor y representante usan /fut/tutor. */
export default function AgentePage() {
  redirect("/fut/tutor");
}
