# MiFicha

**Dominio:** [mificha.mx](https://mificha.mx)

Plataforma para academias de fútbol en México. Cada jugador tiene una ficha técnica digital verificada que los padres pueden compartir con clubes, scouts y familiares.

## Stack

- **Next.js 14+** (App Router)
- **Supabase** (Auth, Postgres, Storage, RLS)
- **Tailwind CSS**
- **Stripe** (suscripciones)
- **Resend** (reportes por email)
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

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=MiFicha <onboarding@resend.dev>

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

En **Supabase → SQL Editor**, ejecuta en este orden:

1. `supabase/schema.sql`
2. `supabase/fix-auth.sql`
3. `supabase/storage-and-triggers.sql`
4. `supabase/public-profile-rls.sql`
5. `supabase/academy-landing.sql`
6. `supabase/public-weekly-stats-rls.sql` (11 ideal semanal en `/explorar`)
7. `supabase/privacy-minors.sql` (consentimiento parental y directorio)
8. `supabase/privacy-storage-rls.sql` (fotos/videos de jugadores protegidos)
9. `supabase/passport-score-trigger.sql` (Passport Score automático tras partidos)
10. `supabase/academy-league-fields.sql` (enlace a calendario oficial de liga)
11. `supabase/player-guardian-contact.sql` (email del tutor para reportes)
12. `supabase/privacy-rls-hardening.sql` (endurecer privacidad RLS — ejecutar al final)
13. `supabase/match-schedule.sql` (calendario público: fecha, hora, sede)

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

Ejecuta **todos** los scripts SQL en Supabase (pasos 1–13) antes de pláticas con academias.

En la app, valida este flujo con tu academia real:

1. Configuración → perfil completo + landing pública
2. Plantel → importar Excel o manual (+ email tutor)
3. Partidos → **Programar partido** (fecha, hora, sede)
4. Ver calendario en `/a/tu-slug` y `/explorar`
5. Partidos → **Registrar resultado** + stats
6. Plantel → consentimiento + compartir QR/WhatsApp
7. Reportes → preview (email requiere Resend con dominio verificado)

Pitch deck privado: `/interno/pitch` (solo owner).

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing con 3 accesos |
| `/padres` | Acceso padres (link/QR, sin cuenta) |
| `/explorar` | Directorio público scouts/visorías |
| `/signup`, `/login` | Auth |
| `/dashboard` | Panel de academia |
| `/dashboard/plantel` | Gestión de jugadores |
| `/dashboard/partidos` | Partidos y stats |
| `/dashboard/reportes` | Reportes a padres |
| `/dashboard/configuracion` | Configuración de academia |
| `/j/[slug]` | Ficha pública del jugador |
| `/a/[slug]` | Landing pública de academia |

## Deploy

1. Conecta el repo a [Vercel](https://vercel.com)
2. Configura las variables de entorno en el proyecto Vercel
3. Deploy:

```bash
git push origin main
```

Vercel despliega automáticamente en cada push a `main`.

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
