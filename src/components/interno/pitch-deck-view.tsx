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
import { BRAND_LOGO } from "@/lib/brand";
import { cn } from "@/lib/utils";

function SlideContent({ slide }: { slide: PitchSlide }) {
  const isCover = slide.variant === "cover";
  const isCta = slide.variant === "cta";

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-center px-8 py-12 sm:px-14 lg:px-20",
        isCover && "items-center text-center",
        isCta && "items-center text-center",
      )}
    >
      {slide.kicker ? (
        <p className="mf-marketing-eyebrow text-white/60">{slide.kicker}</p>
      ) : null}

      <h2
        className={cn(
          "mt-4 font-semibold tracking-[-0.03em] text-white",
          isCover ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight",
          isCta && "max-w-3xl",
        )}
      >
        {slide.title}
      </h2>

      {slide.subtitle ? (
        <p
          className={cn(
            "mt-5 text-lg leading-8 text-white/75",
            isCover ? "max-w-2xl" : "max-w-3xl",
            !isCover && !isCta && "mt-4 text-base sm:text-lg",
          )}
        >
          {slide.subtitle}
        </p>
      ) : null}

      {slide.bullets && slide.bullets.length > 0 ? (
        <ul
          className={cn(
            "mt-8 space-y-4",
            isCta ? "max-w-xl text-left" : "max-w-3xl",
          )}
        >
          {slide.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex gap-3 text-base leading-7 text-white/85 sm:text-lg sm:leading-8"
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
            "mt-10 grid gap-6",
            slide.stats.length === 3 ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3",
            isCover || isCta ? "max-w-2xl" : "max-w-3xl",
          )}
        >
          {slide.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur-sm"
            >
              <dt className="text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-2 text-xs font-medium uppercase tracking-wide text-white/55">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {slide.highlight ? (
        <p
          className={cn(
            "mt-10 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-medium text-white/90",
            isCover && "mt-8",
          )}
        >
          {slide.highlight}
        </p>
      ) : null}
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
            <Image
              src={BRAND_LOGO}
              alt="MiFicha"
              width={665}
              height={173}
              className="h-7 w-auto brightness-0 invert"
              priority
            />
            <span className="hidden text-xs font-medium uppercase tracking-widest text-white/40 sm:inline">
              Pitch · uso interno
            </span>
          </div>
          <div className="flex items-center gap-2">
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
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(27,79,140,0.35),transparent)]"
          aria-hidden
        />

        <div className="relative flex-1 overflow-auto">
          <SlideContent slide={slide} />
        </div>

        <footer className="border-t border-white/10 bg-[#0a1628]/95 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {PITCH_SLIDES.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-8 bg-white" : "w-2 bg-white/25 hover:bg-white/40",
                  )}
                  aria-label={`Ir a diapositiva ${i + 1}`}
                />
              ))}
              <span className="ml-3 text-sm tabular-nums text-white/45">
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
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="Salir de presentación"
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
