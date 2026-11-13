import Link from "next/link";
import { Lock, Search } from "lucide-react";
import { PersonaMembershipCta } from "@/components/pay/persona-membership-cta";
import {
  PERSONA_MEMBERSHIP_FREE_PROMO,
  personaMembershipPublicCopy,
} from "@/lib/persona-membership";
import {
  SCOUT_PRODUCT,
  type ExploreAccess,
} from "@/lib/scout-product";

export function ExplorePaywallBanner({ access }: { access: ExploreAccess }) {
  const copy = personaMembershipPublicCopy();

  if (access.unlocked) {
    const label =
      access.reason === "scout_sub"
        ? "Acceso completo · membresía persona"
        : access.reason === "admin"
          ? "Acceso completo · superadmin / staff"
          : access.reason === "owner"
            ? "Acceso completo · tu ficha"
            : "Acceso completo";
    return (
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        {label}. Puedes abrir fichas con fotos, videos, contacto y detalle.{" "}
        <Link href="/fut/tutor" className="font-semibold underline">
          Ir a mis fichas
        </Link>
      </div>
    );
  }

  return (
    <aside
      id="pro"
      className="mb-8 scroll-mt-24 overflow-hidden rounded-2xl border border-mf-border bg-white"
    >
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="px-5 py-6 sm:px-6">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            <Search className="h-3.5 w-3.5" aria-hidden />
            Membresía persona
          </p>
          <h2 className="mt-2 text-xl font-semibold text-mf-gph-ink">
            {SCOUT_PRODUCT.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            {SCOUT_PRODUCT.summary}
          </p>
          <ul className="mt-4 space-y-1.5 text-sm leading-6 text-mf-text-secondary">
            {SCOUT_PRODUCT.includes.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-mf-text-muted">
            Lo principal de tu cuenta es{" "}
            <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
              Mis fichas
            </Link>
            : ahí creas y descargas el PDF de tus jugadores. Esta membresía desbloquea el
            detalle de terceros en Explorar.
          </p>
        </div>
        <div className="border-t border-mf-border bg-mf-canvas px-5 py-6 sm:px-6 lg:border-l lg:border-t-0">
          {PERSONA_MEMBERSHIP_FREE_PROMO ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
                {copy.badge}
              </p>
              <p className="mt-2 text-3xl font-semibold text-mf-gph-ink">Gratis</p>
              <p className="mt-1 text-sm text-mf-text-secondary">
                Después {SCOUT_PRODUCT.priceLabel} {SCOUT_PRODUCT.currency}{" "}
                {SCOUT_PRODUCT.period}.
              </p>
            </>
          ) : (
            <p className="text-3xl font-semibold text-mf-gph-ink">
              {SCOUT_PRODUCT.priceLabel}
              <span className="ml-1 text-base font-medium text-mf-text-muted">
                {SCOUT_PRODUCT.currency} {SCOUT_PRODUCT.period}
              </span>
            </p>
          )}
          <p className="mt-2 text-sm text-mf-text-secondary">
            Incluye publicar fichas y desbloquear detalle, fotos y contacto de terceros.
          </p>
          <PersonaMembershipCta
            className="mt-5"
            nextPath="/fut/explorar"
            loggedIn={Boolean(access.userId)}
          />
          <p className="mt-3 text-xs text-mf-text-muted">
            ¿Solo quieres ver tus jugadores?{" "}
            <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
              Ir a Mis fichas
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}

export function FichaLockedTeaser({
  name,
  position,
  category,
  place,
  code,
  loginHref,
  returnPath,
  loggedIn = false,
}: {
  name: string;
  position?: string | null;
  category?: string | null;
  place?: string | null;
  code?: string | null;
  /** Entrar y volver a esta ficha/kit. */
  loginHref?: string | null;
  /** Tras activar membresía, volver aquí (no a Explorar). */
  returnPath?: string | null;
  /** Sesión activa: no pedir Entrar ni «necesitas cuenta». */
  loggedIn?: boolean;
}) {
  const copy = personaMembershipPublicCopy();
  const afterActivate = returnPath || "/fut/tutor";
  const enterHref =
    loginHref || `/fut/login?next=${encodeURIComponent(afterActivate)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-mf-border bg-white">
      <div className="bg-gradient-to-br from-[#0a1f3d] via-[#123d68] to-[#0f2d52] px-5 py-8 text-white sm:px-7">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Vista básica
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h1>
        <p className="mt-2 text-sm text-white/75">
          {[position, category, place].filter(Boolean).join(" · ") || "Jugador en MiFicha"}
        </p>
        {code ? (
          <p className="mt-3 font-mono text-sm font-semibold text-emerald-300">{code}</p>
        ) : null}
      </div>
      <div className="space-y-4 px-5 py-6 sm:px-7">
        <div className="rounded-xl border border-mf-border bg-mf-canvas px-4 py-3 text-sm leading-6 text-mf-text-secondary">
          <p className="font-semibold text-mf-gph-ink">¿Es tu jugador?</p>
          <p className="mt-1">
            En{" "}
            <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
              Mis fichas
            </Link>{" "}
            la editas y descargas el PDF. El kit completo de <strong>tus</strong> jugadores
            se abre con la misma cuenta (sin pagar Explorar).
          </p>
        </div>
        <p className="text-sm leading-7 text-mf-text-secondary">
          {loggedIn ? (
            <>
              Para ver la ficha completa o el kit de <strong>otro</strong> jugador, activa la
              membresía persona
              {PERSONA_MEMBERSHIP_FREE_PROMO
                ? ` (${copy.short})`
                : ` (${SCOUT_PRODUCT.priceLabel} ${SCOUT_PRODUCT.currency}/año)`}
              .
            </>
          ) : (
            <>
              Si quieres ver la ficha completa de <strong>otro</strong> jugador (fotos,
              contacto, kit), entra con tu cuenta o activa la membresía persona
              {PERSONA_MEMBERSHIP_FREE_PROMO
                ? ` (${copy.short})`
                : ` (${SCOUT_PRODUCT.priceLabel} ${SCOUT_PRODUCT.currency}/año)`}
              .
            </>
          )}
        </p>
        <div className="flex flex-wrap items-start gap-2">
          <Link href="/fut/tutor" className="mf-btn-gph">
            Mis fichas
          </Link>
          {loggedIn ? null : (
            <Link href={enterHref} className="mf-btn-gph-ghost">
              Entrar
            </Link>
          )}
          <PersonaMembershipCta
            variant="ghost"
            nextPath={afterActivate}
            loggedIn={loggedIn}
          />
        </div>
      </div>
    </div>
  );
}
