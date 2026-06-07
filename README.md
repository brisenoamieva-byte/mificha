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

# Desarrollo (seed)
SEED_ADMIN_KEY=dev-seed-key
SEED_OWNER_ID=tu-user-uuid-de-supabase
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
