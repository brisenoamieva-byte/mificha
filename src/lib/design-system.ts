/**
 * MiFicha — tokens y lineamientos de color
 *
 * AZUL (principal · `--mf-brand`)
 * - Identidad: header, logo, navegación, botones primarios, enlaces, focus de inputs
 * - Confianza institucional: academias, registro, configuración, documentos legales
 *
 * VERDE (acento · `--mf-accent`, del tier Passport "En ascenso")
 * - Progreso y rendimiento: Passport Score, stats positivas, barras de avance
 * - Verificación: badges "verificada", tendencias al alza, partidos ganados
 * - CTAs secundarios de descubrimiento: explorar, WhatsApp, ver ficha
 * - NO usar verde como color dominante de fondo en marketing (solo acentos)
 *
 * REGLA 60/30/10: ~60% neutros (canvas/surface), ~30% azul, ~10% verde
 */
export const MF_COLORS = {
  brand: "#1b4f8c",
  brandDark: "#0f2d52",
  brandSoft: "#e8eef5",
  accent: "#34d399",
  accentBright: "#6ee7b7",
  accentDark: "#059669",
  accentSoft: "#ecfdf5",
  accentMuted: "#d1fae5",
  canvas: "#f3f2ef",
} as const;

export type MfColorRole = "brand" | "accent" | "neutral";

/** Cuándo usar cada rol en componentes nuevos */
export const COLOR_USAGE = {
  brand: [
    "Botón primario (Registrar, Guardar, Iniciar sesión)",
    "Eyebrows de sección y navegación",
    "Enlaces de texto por defecto",
    "Iconos de funciones de plataforma / academia",
    "Header de ficha y barras institucionales",
  ],
  accent: [
    "Passport Score y segmentos de progreso",
    "Métricas destacadas (goles, tendencia +N, progreso verificado)",
    "Badges de verificación y estado activo",
    "CTA secundario (Explorar, WhatsApp, copiar link)",
    "Columna MiFicha en tablas comparativas vs liga",
  ],
  neutral: [
    "Fondos canvas y cards",
    "Texto body y bordes",
    "Tier Passport bajo / datos sin destacar",
  ],
} as const;
