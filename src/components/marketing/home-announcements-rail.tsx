import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  getActiveHomeAnnouncements,
  type HomeAnnouncement,
  type HomeAnnouncementTone,
} from "@/lib/home-announcements";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<
  HomeAnnouncementTone,
  { chip: string; mark: string }
> = {
  brand: {
    chip: "border-white/15 bg-white/10 text-white hover:border-mf-accent/50 hover:bg-white/[0.14]",
    mark: "bg-mf-accent text-mf-brand-dark",
  },
  gph: {
    chip: "border-mf-gph/35 bg-mf-gph/15 text-white hover:border-mf-gph-hot/60 hover:bg-mf-gph/22",
    mark: "bg-mf-gph text-white",
  },
  event: {
    chip: "border-amber-300/35 bg-amber-300/10 text-white hover:border-amber-200/55 hover:bg-amber-300/16",
    mark: "bg-amber-300 text-mf-brand-dark",
  },
  pilot: {
    chip: "border-mf-accent/35 bg-mf-accent/10 text-white hover:border-mf-accent/55 hover:bg-mf-accent/16",
    mark: "bg-mf-accent text-mf-brand-dark",
  },
};

function AnnouncementChip({ item }: { item: HomeAnnouncement }) {
  const tone = TONE_STYLES[item.tone];

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2 pr-3.5 transition",
        tone.chip,
      )}
    >
      <span
        className={cn(
          "rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
          tone.mark,
        )}
      >
        {item.eyebrow}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight tracking-tight">
          {item.title}
        </span>
        {item.detail ? (
          <span className="mt-0.5 block text-xs text-white/65">{item.detail}</span>
        ) : null}
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/45 transition group-hover:text-white" />
    </Link>
  );
}

export function HomeAnnouncementsRail({
  className,
}: {
  className?: string;
}) {
  const items = getActiveHomeAnnouncements();
  if (items.length === 0) return null;

  // Duplicar para el loop continuo; si hay pocos, repetir el set.
  const base =
    items.length >= 4 ? items : [...items, ...items, ...items].slice(0, 6);
  const loop = [...base, ...base];

  return (
    <section
      aria-label="Anuncios especiales"
      className={cn(
        "border-b border-white/10 bg-mf-brand-dark text-white",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-stretch gap-3 px-0 sm:px-4 lg:px-6">
        <div className="hidden shrink-0 items-center border-r border-white/10 px-4 py-3 sm:flex">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mf-accent">
            En vivo
          </p>
        </div>

        <div className="mf-marquee-mask mf-announce-mask min-w-0 flex-1 overflow-hidden py-3">
          <div className="mf-marquee-track mf-announce-track flex w-max items-center gap-3 px-4 sm:px-0">
            {loop.map((item, index) => (
              <AnnouncementChip key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
