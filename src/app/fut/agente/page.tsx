import { redirect } from "next/navigation";

/** Espacio unificado: familia y representante usan /fut/tutor. */
export default function AgentePage() {
  redirect("/fut/tutor");
}
