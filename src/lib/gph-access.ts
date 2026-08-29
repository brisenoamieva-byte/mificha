function parseList(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.replace(/[<>]/g, "").trim().toLowerCase())
    .filter(Boolean);
}

/** Evaluador GPH (Gustavo) si aún no está en gph_evaluators. */
const GPH_EVALUATOR_FALLBACK = ["gkperformancehub@gmail.com"];

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
