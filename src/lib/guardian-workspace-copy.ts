import type { GuardianKind } from "@/lib/tutor-family";

/** Copy unificado cuenta persona (familia o representante). */
export const PERSONA_WORKSPACE_COPY = {
  kind: "tutor" as const,
  path: "/fut/tutor",
  eyebrow: "Cuenta persona",
  authTitle: "Entra para armar tus fichas",
  authDetail:
    "Sube fotos, videos e historia, lleva el seguimiento y publícalas en Explorar con consentimiento.",
  onboardEmpty: "Cuenta lista. Ahora crea la primera ficha para continuar.",
  onboardWelcome: "Bienvenido. Elige un jugador o crea otra ficha.",
  rosterLabel: "Tus fichas · elige a quién editar",
  addAnother: "+ Otro jugador",
  addAnotherNotice: "Crea otra ficha para un jugador adicional.",
  emptyRoster:
    "Aún no hay jugadores. Completa el formulario y pulsa Crear ficha y continuar.",
  createEyebrow: "Nuevo jugador",
  createTitle: "Empieza con el nombre",
  createDetail: "Luego el constructor te pide el resto paso a paso.",
  afterAuthHint: "Después de {action} pasas directo a crear la ficha del jugador.",
} as const;

/** @deprecated Prefer PERSONA_WORKSPACE_COPY — un solo espacio persona. */
export const GUARDIAN_WORKSPACE_COPY = {
  tutor: PERSONA_WORKSPACE_COPY,
  agente: {
    ...PERSONA_WORKSPACE_COPY,
    kind: "agente" as const,
    path: "/fut/tutor",
  },
} as const;

export function guardianWorkspaceCopy(_kind?: GuardianKind) {
  return PERSONA_WORKSPACE_COPY;
}
