"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { PITCH_SLIDES, type PitchSlide } from "@/lib/pitch-deck-content";
import {
  MARKETING_MEDIA,
  marketingPhotoStyle,
  type MarketingImageMeta,
} from "@/lib/marketing-assets";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";

function PitchBrandMark({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <div className="inline-flex shrink-0 rounded-lg bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5">
      <BrandLogo size={size} />
    </div>
  );
}

function PitchSlidePhoto({
  meta,
  priority = false,
  overlay = "split",
  className,
}: {
  meta: MarketingImageMeta;
  priority?: boolean;
  overlay?: "split" | "cover" | "cta" | "banner";
  className?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={marketingPhotoStyle(meta)}
    >
      <Image
        src={meta.src}
        alt={meta.alt}
        fill
        priority={priority}
        className="marketing-cover-photo"
        sizes={
          overlay === "banner"
            ? "100vw"
            : overlay === "cover" || overlay === "cta"
              ? "100vw"
              : "(max-width: 1024px) 100vw, 50vw"
        }
      />
      {overlay === "split" ? (
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/35 to-transparent lg:from-[#0a1628]/90 lg:via-[#0a1628]/20"
          aria-hidden
        />
      ) : null}
      {overlay === "cover" ? (
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/75 to-[#0a1628]/45"
          aria-hidden
        />
      ) : null}
      {overlay === "cta" ? (
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/88 to-[#0a1628]/55 lg:to-[#0a1628]/70"
          aria-hidden
        />
      ) : null}
      {overlay === "banner" ? (
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/40 to-transparent"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function SlideContent({
  slide,
  className,
  presenting = false,
}: {
  slide: PitchSlide;
  className?: string;
  presenting?: boolean;
}) {
  const isCover = slide.variant === "cover";
  const isCta = slide.variant === "cta";
  const isSplit = slide.variant === "split";

  return (
    <div
      className={cn(
        "flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-12",
        isCover && "relative z-10 items-center text-center",
        isCta && "relative z-10 items-center text-center",
        isSplit && "min-h-0",
        className,
      )}
    >
      {slide.kicker ? (
        <p className="mf-marketing-eyebrow text-white/60">{slide.kicker}</p>
      ) : null}

      <h2
        className={cn(
          "mt-4 font-semibold tracking-[-0.03em] text-white",
          isCover
            ? "text-4xl sm:text-5xl lg:text-6xl"
            : "text-2xl sm:text-3xl lg:text-[2.35rem] leading-tight",
          isCta && "max-w-3xl",
          isSplit && "max-w-xl",
        )}
      >
        {slide.title}
      </h2>

      {slide.subtitle ? (
        <p
          className={cn(
            "mt-4 text-base leading-7 text-white/75 sm:text-lg sm:leading-8",
            isCover ? "max-w-2xl" : "max-w-2xl",
            isSplit && "max-w-lg",
          )}
        >
          {slide.subtitle}
        </p>
      ) : null}

      {slide.bullets && slide.bullets.length > 0 ? (
        <ul
          className={cn(
            "mt-6 space-y-3 sm:mt-8 sm:space-y-4",
            isCta ? "max-w-xl text-left" : isSplit ? "max-w-lg" : "max-w-3xl",
          )}
        >
          {slide.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex gap-3 text-sm leading-7 text-white/85 sm:text-base sm:leading-8"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {slide.stats && slide.stats.length > 0 ? (
        <dl
          className={cn(
            "mt-8 grid gap-4 sm:mt-10 sm:gap-6",
            slide.stats.length === 3 ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3",
            isCover || isCta ? "max-w-2xl" : "max-w-lg",
          )}
        >
          {slide.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center backdrop-blur-sm sm:px-4 sm:py-5"
            >
              <dt className="text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl lg:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-white/55 sm:mt-2 sm:text-xs">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {slide.highlight ? (
        <p
          className={cn(
            "mt-8 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-medium text-white/90 sm:mt-10",
            isCover && "mt-8",
          )}
        >
          {slide.highlight}
        </p>
      ) : null}

      {slide.speakerNote && !presenting ? (
        <p className="mt-6 max-w-2xl rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-left text-sm leading-6 text-amber-100/90">
          <span className="font-semibold text-amber-200">Nota al presentar: </span>
          {slide.speakerNote}
        </p>
      ) : null}
    </div>
  );
}

function PitchSlideFrame({
  slide,
  priority = false,
  presenting = false,
}: {
  slide: PitchSlide;
  priority?: boolean;
  presenting?: boolean;
}) {
  const meta = slide.imageKey ? MARKETING_MEDIA[slide.imageKey] : null;

  if (slide.variant === "cover" && meta) {
    return (
      <div className="relative flex min-h-[min(100%,720px)] flex-1 flex-col">
        <PitchSlidePhoto
          meta={meta}
          priority={priority}
          overlay="cover"
          className="absolute inset-0"
        />
        <div className="relative flex flex-1 flex-col justify-center">
          <SlideContent slide={slide} presenting={presenting} />
          <div className="relative z-10 flex justify-center pb-8">
            <PitchBrandMark size="md" />
          </div>
        </div>
      </div>
    );
  }

  if (slide.variant === "cta" && meta) {
    return (
      <div className="relative flex min-h-[min(100%,720px)] flex-1 flex-col">
        <PitchSlidePhoto
          meta={meta}
          priority={priority}
          overlay="cta"
          className="absolute inset-0"
        />
        <div className="relative flex flex-1 items-center justify-center overflow-auto">
          <SlideContent slide={slide} className="w-full max-w-4xl" presenting={presenting} />
        </div>
      </div>
    );
  }

  if (slide.variant === "split" && meta) {
    return (
      <div className="grid min-h-[min(100%,720px)] flex-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="relative z-10 flex min-h-0 flex-col justify-center overflow-auto bg-[#0a1628] lg:bg-transparent">
          <SlideContent slide={slide} presenting={presenting} />
        </div>

        <PitchSlidePhoto
          meta={meta}
          priority={priority}
          overlay="split"
          className="relative min-h-[200px] sm:min-h-[260px] lg:min-h-0 lg:h-full"
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-auto">
      {meta ? (
        <PitchSlidePhoto
          meta={meta}
          priority={priority}
          overlay="banner"
          className="relative h-44 shrink-0 sm:h-52 lg:hidden"
        />
      ) : null}
      <SlideContent slide={slide} className="flex-1" presenting={presenting} />
    </div>
  );
}

export function PitchDeckView() {
  const [index, setIndex] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const slide = PITCH_SLIDES[index];
  const total = PITCH_SLIDES.length;

  const goNext = useCallback(() => {
    setIndex((current) => Math.min(current + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "Escape") {
        setPresenting(false);
      }
      if (event.key === "f" || event.key === "F") {
        setPresenting((value) => !value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  useEffect(() => {
    if (!presenting) return;
    const el = document.documentElement;
    void el.requestFullscreen?.().catch(() => undefined);
    return () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen?.().catch(() => undefined);
      }
    };
  }, [presenting]);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-[#0a1628]",
        presenting && "fixed inset-0 z-[100] min-h-0",
      )}
    >
      {!presenting ? (
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <PitchBrandMark />
            <span className="hidden text-xs font-medium uppercase tracking-widest text-white/40 sm:inline">
              Pitch · uso interno
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/interno/lanzamiento"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/10"
            >
              Guión demo
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <a
              href="https://www.mificha.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Sitio</span>
            </a>
          </div>
        </header>
      ) : null}

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(27,79,140,0.28),transparent)]"
          aria-hidden
        />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <PitchSlideFrame slide={slide} priority={index === 0} presenting={presenting} />
        </div>

        <footer className="shrink-0 border-t border-white/10 bg-[#0a1628]/95 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PITCH_SLIDES.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-2 shrink-0 rounded-full transition-all",
                    i === index ? "w-8 bg-white" : "w-2 bg-white/25 hover:bg-white/40",
                  )}
                  aria-label={`Ir a diapositiva ${i + 1}: ${item.title}`}
                  title={item.title}
                />
              ))}
              <span className="ml-3 shrink-0 text-sm tabular-nums text-white/45">
                {index + 1} / {total}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={index === 0}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={index === total - 1}
                className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a1628] disabled:opacity-30"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPresenting((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white"
              >
                {presenting ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    Salir
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    Presentar
                  </>
                )}
              </button>
            </div>
          </div>
          {!presenting ? (
            <p className="mx-auto mt-3 max-w-6xl text-xs text-white/35">
              Atajos: ← → navegar · F pantalla completa · Esc salir
            </p>
          ) : null}
        </footer>
      </main>

      {presenting ? (
        <button
          type="button"
          onClick={() => setPresenting(false)}
          className="absolute right-4 top-4 z-[110] rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="Salir de presentación"
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
