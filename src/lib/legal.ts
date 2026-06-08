/** Datos legales del operador de la plataforma (actualizar si cambia la razón social). */
export const LEGAL_ENTITY = {
  brand: "MiFicha",
  domain: "mificha.mx",
  url: "https://mificha.mx",
  operator: "MiFicha",
  address: "Querétaro, Querétaro, México",
  contactEmail: "hola@mificha.mx",
  privacyEmail: "privacidad@mificha.mx",
  jurisdiction: "Estados Unidos Mexicanos",
  lastUpdated: "7 de junio de 2026",
} as const;

export const LEGAL_ROUTES = {
  privacy: "/aviso-privacidad",
  terms: "/terminos",
  cookies: "/cookies",
} as const;

/** Aviso simplificado (LFPDPPP) para formularios de recolección. */
export const PRIVACY_NOTICE_SHORT = `MiFicha, con domicilio en ${LEGAL_ENTITY.address}, es responsable del tratamiento de los datos personales que nos proporcionas al registrarte como academia (nombre, correo y datos de operación de la cuenta). Utilizamos estos datos para crear y administrar tu cuenta, prestar el servicio de fichas digitales y comunicarnos contigo sobre la plataforma. No vendemos tus datos. Puedes ejercer tus derechos ARCO escribiendo a ${LEGAL_ENTITY.privacyEmail}. Para conocer el tratamiento completo, finalidades secundarias, transferencias y uso de cookies, consulta nuestro aviso de privacidad integral.`;

export const TERMS_ACCEPTANCE_LABEL =
  "He leído y acepto los Términos y Condiciones y el Aviso de Privacidad de MiFicha.";
