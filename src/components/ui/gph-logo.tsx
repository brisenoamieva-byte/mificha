import Image from "next/image";
import { BRAND_ICON } from "@/lib/brand";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import {
  GPH_ALLIANCE,
  GPH_LOGO,
  GPH_LOGO_HEIGHT,
  GPH_LOGO_WIDTH,
} from "@/lib/gph-alliance";
import { cn } from "@/lib/utils";

/** Misma altura de marca para GPH (logo completo) y MiFicha (escudo + wordmark). */
const SIZE = {
  sm: { mark: 36, wordmark: "text-lg" },
  md: { mark: 44, wordmark: "text-xl" },
  lg: { mark: 52, wordmark: "text-2xl" },
} as const;

type LockupSize = keyof typeof SIZE;

interface GphLogoProps {
  className?: string;
  size?: LockupSize;
}

export function GphLogo({ className, size = "md" }: GphLogoProps) {
  const height = SIZE[size].mark;
  const width = Math.round((GPH_LOGO_WIDTH / GPH_LOGO_HEIGHT) * height);
  return (
    <img
      src={GPH_LOGO}
      alt="GPH Group Performance Hub"
      width={width}
      height={height}
      className={cn("shrink-0 object-contain object-left", className)}
      style={{ height, width: "auto", maxWidth: "100%" }}
    />
  );
}

interface AllianceLockupProps {
  className?: string;
  size?: LockupSize;
  /** Muestra la leyenda «GPH · MiFicha». */
  showCaption?: boolean;
}

export function AllianceLockup({
  className,
  size = "md",
  showCaption = false,
}: AllianceLockupProps) {
  const { mark, wordmark } = SIZE[size];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-2.5">
        <GphLogo size={size} />
        <span
          className="inline-flex shrink-0 items-center gap-2"
          aria-label="MiFicha"
          style={{ height: mark }}
        >
          <Image
            src={BRAND_ICON}
            alt=""
            aria-hidden
            width={mark}
            height={mark}
            className="shrink-0 object-contain"
            style={{ width: mark, height: mark }}
          />
          <BrandWordmark className={cn("leading-none", wordmark)} />
        </span>
      </div>
      {showCaption ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-text-muted">
          {GPH_ALLIANCE.shortLabel}
        </p>
      ) : null}
    </div>
  );
}
