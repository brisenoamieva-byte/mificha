"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Award, ShieldCheck } from "lucide-react";
import {
  prepareShowcaseAcademies,
  type ShowcaseAcademy,
} from "@/lib/participating-academies";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ParticipatingAcademiesStripProps {
  currentAcademyId: string;
  className?: string;
}

export function ParticipatingAcademiesStrip({
  currentAcademyId,
  className,
}: ParticipatingAcademiesStripProps) {
  const [academies, setAcademies] = useState<ShowcaseAcademy[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { data } = await supabase
        .from("academies")
        .select("id,name,slug,city,state,logo_url,is_certified")
        .eq("is_public", true)
        .neq("id", currentAcademyId)
        .order("name", { ascending: true });

      if (!cancelled && data) {
        setAcademies(prepareShowcaseAcademies(data));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentAcademyId]);

  if (academies.length === 0) return null;

  const loop = [...academies, ...academies];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-mf-brand/15 bg-gradient-to-r from-[#0a1f3d] via-mf-brand-dark to-[#123d68] p-5 text-white sm:p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_2px,transparent_2px,transparent_12px)]" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-accent-bright">
            Red MiFicha
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em]">
            {academies.length} academias verificadas ya compiten contigo
          </h3>
          <p className="mt-1 text-sm text-white/65">
            Tus rivales ya tienen ficha digital — tu plantel también puede destacar.
          </p>
        </div>
        <Link
          href="/explorar"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-mf-accent-bright hover:text-white"
        >
          Ver directorio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mf-marquee-mask relative mt-5 overflow-hidden">
        <div className="mf-marquee-track flex w-max items-center gap-4">
          {loop.map((academy, index) => (
            <Link
              key={`${academy.id}-${index}`}
              href={`/a/${academy.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 transition hover:border-mf-accent/35 hover:bg-white/[0.1]"
            >
              <div className="relative">
                {academy.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={academy.logo_url}
                    alt={academy.name}
                    className="h-11 w-11 rounded-xl border border-white/70 bg-white object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xs font-bold">
                    {academy.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#0f2d52] bg-mf-accent text-[#0f2d52]">
                  {academy.is_certified ? (
                    <Award className="h-3 w-3" />
                  ) : (
                    <ShieldCheck className="h-3 w-3" />
                  )}
                </span>
              </div>
              <span className="max-w-[8rem] truncate text-sm font-medium text-white">
                {academy.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
