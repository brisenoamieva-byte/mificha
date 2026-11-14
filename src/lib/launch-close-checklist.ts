/** Checklist de cierre técnico antes de la ola piloto (acciones en Supabase Dashboard). */

export const SUPABASE_PROJECT_REF = "wikximfaxonyhgblgazk";

export const SUPABASE_SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new`;
export const SUPABASE_AUTH_TEMPLATES_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/templates`;
export const SUPABASE_AUTH_URL_CONFIG = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/url-configuration`;

export const VISORIA_OTRO_SQL = `alter table public.visoria_registrations
  drop constraint if exists visoria_registrations_category_check;

alter table public.visoria_registrations
  add constraint visoria_registrations_category_check
  check (category in ('femenil', 'varonil', 'otro'));`;

/** Body del template Confirm signup (Supabase Auth → Email Templates). */
export const CONFIRM_SIGNUP_EMAIL_BODY = `Confirma tu correo en MiFicha:

{{ .SiteURL }}/fut/confirmar?token_hash={{ .TokenHash }}&type=signup

Si el botón no funciona, copia y pega el enlace en el navegador.`;

export const CONFIRM_SIGNUP_SITE_URL = "https://www.mificha.mx";

export const LAUNCH_CLOSE_STEPS = [
  {
    id: "visoria-otro",
    title: "SQL · categoría Otro en visorías",
    detail:
      "Sin esto, el registro con categoría «Otro» falla al insertar en la tabla.",
    href: SUPABASE_SQL_EDITOR_URL,
    copyLabel: "Copiar SQL",
    copyValue: VISORIA_OTRO_SQL,
  },
  {
    id: "confirm-template",
    title: "Auth · template Confirm signup",
    detail:
      "El correo de confirmación debe abrir mificha.mx/fut/confirmar (no el dominio de Supabase).",
    href: SUPABASE_AUTH_TEMPLATES_URL,
    copyLabel: "Copiar body del correo",
    copyValue: CONFIRM_SIGNUP_EMAIL_BODY,
  },
  {
    id: "site-url",
    title: "Auth · Site URL",
    detail: `Site URL = ${CONFIRM_SIGNUP_SITE_URL}. Redirect URLs debe incluir https://www.mificha.mx/**`,
    href: SUPABASE_AUTH_URL_CONFIG,
    copyLabel: "Copiar Site URL",
    copyValue: CONFIRM_SIGNUP_SITE_URL,
  },
  {
    id: "smoke-test",
    title: "Smoke test (5 min)",
    detail:
      "Vincular tutor↔academia → capturar partido → ver inbox tutor → capturar torneo → ver propuesta en academia.",
    href: "/fut/interno/gph-ola",
    copyLabel: null,
    copyValue: null,
  },
] as const;
