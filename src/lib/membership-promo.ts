/**
 * Interruptores de promo de membresía.
 * Persona: “gratis por tiempo limitado” → Explorar Pro.
 * Academia: canal gratuito (plantel/partidos/MF); no es pitch de cuota.
 * Apagar ACADEMY_MEMBERSHIP_FREE_PROMO solo cuando cobremos acceso academia.
 */

export const PERSONA_MEMBERSHIP_FREE_PROMO = true;
export const ACADEMY_MEMBERSHIP_FREE_PROMO = true;

/** Alineado con ACADEMY_MEMBERSHIP_FREE_PROMO (pricing / billing UI). */
export const ACADEMY_BILLING_PROMO_FREE = ACADEMY_MEMBERSHIP_FREE_PROMO;
