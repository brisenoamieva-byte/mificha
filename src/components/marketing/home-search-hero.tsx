import Link from "next/link";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { HomePlayerSearch } from "@/components/marketing/home-player-search";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";

interface HomeSearchHeroProps {
  playerCount: number;
}

export function HomeSearchHero({ playerCount }: HomeSearchHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-mf-border bg-[#0a1f3d]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_15%_0%,rgba(52,211,153,0.18),transparent_55%),radial-gradient(ellipse_70%_60%_at_90%_20%,rgba(27,79,140,0.55),transparent_50%),linear-gradient(180deg,rgba(10,31,61,0.2),rgba(10,31,61,0.95))]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
          Buscador · {CURRENT_SEASON_LABEL}
        </p>
        <h1 className="mt-3 text-[2.15rem] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[2.75rem]">
          <BrandWordmark className="text-white" />
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-white/90 sm:text-xl">
          Encuentra jugadores de futbol
        </p>
        <p className="mt-2 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
          Filtra por posición y ciudad. Vista básica gratis; ficha completa con membresía
          persona (gratis por tiempo limitado).
          {playerCount > 0 ? (
            <>
              {" "}
              <span className="tabular-nums text-white/90">{playerCount}</span> en
              directorio.
            </>
          ) : null}
        </p>

        <div className="mt-8">
          <HomePlayerSearch />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
          <Link href="/fut/explorar#directorio" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Ver directorio completo
          </Link>
          <span className="hidden text-white/30 sm:inline" aria-hidden>
            ·
          </span>
          <Link href="/fut/entrar" className="hover:text-white">
            Publicar ficha
          </Link>
          <span className="hidden text-white/30 sm:inline" aria-hidden>
            ·
          </span>
          <Link href="/fut/explorar#pro" className="hover:text-white">
            Membresía · gratis ahora
          </Link>
        </div>
      </div>
    </section>
  );
}
