# Semana 0 — Ops MiFicha (visorías)

## Resend
- Plan actual: **100 emails/día**. Subir en https://resend.com (Manage Plan) antes del 25–27 nov.
- Horarios: `node --env-file=.env.local tmp/send-visoria-horarios.mjs dry-run|all`
- Follow-up ficha: `node --env-file=.env.local tmp/send-visoria-ficha-followup.mjs dry-run|all`
- Nudge consentimiento: `node --env-file=.env.local tmp/send-consent-nudge.mjs dry-run` luego `all [limit]`

## Estado (21 nov 2026 noche)
- Horarios email: **cola vacía** (171 enviados)
- Follow-up ficha: **cola vacía** (reenviados los pendientes)
- WhatsApp sin email: `tmp/visoria-horarios-sin-email-whatsapp.csv` (~235 teléfonos únicos)
- Nudge consentimiento: lotes enviados 21 nov; reintentar `all 50` hasta vaciar (~cuota 100/día)

## WhatsApp (sin email)
Lista: `tmp/visoria-horarios-sin-email-whatsapp.csv`  
Regenerar: `node --env-file=.env.local tmp/export-visoria-sin-email.mjs`

Plantilla sugerida:

```
Hola {nombre}, soy de GPH/CRACKS.
Horarios visorías 26–27 nov: https://www.mificha.mx/fut/visorias#horarios
Arma la ficha de {jugador} (gratis): https://www.mificha.mx/fut/entrar?next=/fut/tutor
Con tu consentimiento aparece en Explorar para scouts.
Folio {folio}
```

## Postgres moat
- SQL: `supabase/tutor-children-moat.sql` + fix guardian
- Backfill: `node --env-file=.env.local tmp/sync-tutor-children-pg.mjs` (275/275)
