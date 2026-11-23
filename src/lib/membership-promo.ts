/**
 * Interruptores de membresía gratuita.
 * Persona: gratis → Explorar Pro (sin copy de “tiempo limitado”).
 * Academia: canal gratuito (plantel/partidos/MF); no es pitch de cuota.
 * Apagar *_FREE_PROMO solo cuando cobremos ese acceso.
 */

export const PERSONA_MEMBERSHIP_FREE_PROMO = true;
export const ACADEMY_MEMBERSHIP_FREE_PROMO = true;

/** Alineado con ACADEMY_MEMBERSHIP_FREE_PROMO (pricing / billing UI). */
export const ACADEMY_BILLING_PROMO_FREE = ACADEMY_MEMBERSHIP_FREE_PROMO;
