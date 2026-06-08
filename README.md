# MiFicha

**Dominio:** [mificha.mx](https://mificha.mx)

Plataforma para academias de fútbol en México. Cada jugador tiene una ficha técnica digital verificada; los tutores reciben el link automáticamente tras cada partido.

## Stack

- **Next.js 14+** (App Router)
- **Supabase** (Auth, Postgres, Storage, RLS)
- **Tailwind CSS**
- **Stripe** (suscripciones)
- **Resend** (avisos a tutores y reportes mensuales)
- **Vercel** (deploy)

## Requisitos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Stripe](https://stripe.com) (modo test para desarrollo)
- Cuenta en [Resend](https://resend.com) (opcional, para reportes)

## Setup paso a paso

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd mificha
npm install
```

### 2. Variables de entorno

Copia `.env.local` y completa los valores:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend (avisos post-partido + reportes)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=MiFicha <notificaciones@mificha.mx>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MiFicha
NEXT_PUBLIC_LAUNCH_FREE=true

# Desarrollo (seed + pitch privado)
SEED_ADMIN_KEY=dev-seed-key
SEED_OWNER_ID=tu-user-uuid-de-supabase
PITCH_ALLOWED_USER_IDS=tu-user-uuid-de-supabase
```

### 3. Base de datos Supabase

En **Supabase → SQL Editor**, ejecuta el schema base (pasos 1–10 del README histórico) y luego el rollout de producción:

```bash
# Orden recomendado (ver supabase/production-rollout.sql):
# 11 → 13 → 14 → 15 → 20 → 21 → 22 → 16 → 17 → 18 → 19 → 12
```

Verifica con `supabase/verify-production-readiness.sql`.

Scripts clave del flujo actual:

1. `supabase/schema.sql` … (base)
2. `supabase/production-rollout.sql` — contacto tutor, jornadas, gobernanza, avisos automáticos, logros
3. `supabase/privacy-rls-hardening.sql` — al final

### 4. Auth en Supabase

En **Authentication → URL Configuration**:

- Site URL: `http://localhost:3000` (dev) o `https://mificha.mx` (prod)
- Redirect URLs: `http://localhost:3000/**` y `https://mificha.mx/**`

Desactiva **Confirm email** en desarrollo si quieres signup inmediato.

### 5. Ejecutar en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 6. Datos de prueba (solo desarrollo)

Con el servidor corriendo y `SEED_OWNER_ID` configurado (UUID de tu usuario en Supabase):

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "x-seed-admin-key: dev-seed-key"
```

Crea la academia **Academia Norteños Querétaro** con 5 jugadores, 1 temporada y 2 partidos.

## Checklist de lanzamiento (prod)

Ejecuta **`supabase/production-rollout.sql`** (orden 11→…→12) y verifica con `verify-production-readiness.sql` antes de pláticas con academias.

En la app, valida este flujo con tu academia real:

1. Configuración → perfil completo + landing pública
2. Plantel → importar Excel o manual (+ contacto del tutor)
3. Partidos → elegir jornada oficial MiFicha
4. Ver calendario en `/a/tu-slug` y `/explorar`
5. Partidos → capturar convocados + minutos (acta oficial primero)
6. Plantel → tutores → enviar link / avisos automáticos
7. Reportes → preview (email requiere Resend con dominio verificado)

Pitch deck privado: `/interno/pitch` · one-pager: `/interno/demo-one-pager` · playbook: `/interno/lanzamiento`

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing con 3 accesos |
| `/padres` | Acceso padres (link automático, sin cuenta) |
| `/explorar` | Directorio público scouts/visorías |
| `/signup`, `/login` | Auth |
| `/dashboard` | Panel de academia |
| `/dashboard/plantel` | Gestión de jugadores |
| `/dashboard/plantel/tutores` | Avisos automáticos a tutores (link email/WhatsApp) |
| `/dashboard/partidos` | Partidos · convocados y minutos |
| `/dashboard/rendimiento` | Rendimiento y reportes |
| `/dashboard/configuracion` | Configuración de academia |
| `/interno/pitch` | Pitch deck (privado) |
| `/interno/lanzamiento` | Playbook venta + demo |
| `/j/[slug]` | Ficha pública del jugador |
| `/a/[slug]` | Landing pública de academia |

## Deploy

1. Conecta el repo a [Vercel](https://vercel.com)
2. Configura las variables de entorno en el proyecto Vercel
3. Deploy:

```bash
git push origin master
```

Vercel despliega automáticamente en cada push a `master`.

## Estado del proyecto (cierre de sesión)

**Producción:** [mificha.mx](https://mificha.mx) · repo `brisenoamieva-byte/mificha` · branch `master`

### Listo en código y deploy

- Gobernanza: organizador (marcador + acta) · academia (plantel + minutos) · avisos automáticos a tutores
- Centro **Avisos a tutores** (`/dashboard/plantel/tutores`) + APIs `welcome-ficha` y `match-update`
- Pitch, one-pager, playbook y marketing alineados al flujo digital (sin QR imprimibles)
- Insignias se re-evalúan al publicar acta oficial (si la academia capturó minutos antes)
- Gamificación: Passport, logros OG, ranking semanal

### Tú debes hacer manual (una vez)

1. **Supabase SQL** — ejecutar `production-rollout.sql` en orden `11→13→14→15→20→21→22→16→17→18→19→12`
2. Verificar con `supabase/verify-production-readiness.sql` (todas las columnas `true`)
3. **Vercel env:** `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (avisos email) · opcional `TWILIO_*` o `WHATSAPP_*`
4. **Primera academia piloto:** temporada + jornada en `/interno/jornadas` → demo con `/interno/lanzamiento`

### Backlog (no bloquea piloto)

- Ranking por categoría Querétaro en ficha pública
- Barra de progreso de temporada dinámica vs jornadas oficiales
- Re-envío automático de avisos si acta se publica después de la captura (hoy solo insignias)

### Rutas clave para vender

| Uso | Ruta |
|-----|------|
| Presentar | `/interno/pitch` (F) |
| One-pager | `/interno/demo-one-pager` |
| Guión demo | `/interno/lanzamiento` |
| Quién hace qué | `/interno/gobernanza` |
| Operación | `/interno/jornadas` |

### Stripe en producción

- Webhook: `https://mificha.mx/api/stripe/webhook`
- Eventos: `checkout.session.completed`, `invoice.payment_failed`
- Activa **Customer Portal** en Stripe Dashboard

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # ESLint
```

## Licencia

Privado — MiFicha © 2025
