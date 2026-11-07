function parseList(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.replace(/[<>]/g, "").trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Evaluadores / super-admins GPH si aún no están en gph_evaluators.
 * Incluye a Ricardo (plataforma) y Gustavo (metodología).
 */
const GPH_EVALUATOR_FALLBACK = [
  "gkperformancehub@gmail.com",
  "brisenoamieva@gmail.com",
];

/** Correos extra de evaluadores GPH (comma-separated). La fuente de verdad es gph_evaluators. */
export function getGphEvaluatorEmailsFromEnv(): string[] {
  const explicit = process.env.GPH_EVALUATOR_EMAILS?.trim();
  const fromEnv = explicit ? parseList(explicit) : [];
  return [...new Set([...GPH_EVALUATOR_FALLBACK, ...fromEnv])];
}

export function emailLooksLikeGphEvaluator(email?: string | null): boolean {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  return getGphEvaluatorEmailsFromEnv().includes(normalized);
}
