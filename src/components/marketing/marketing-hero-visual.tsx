import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarketingHeroVisualProps {
  src: string;
  alt: string;
  aside?: ReactNode;
  priority?: boolean;
  className?: string;
}

export function MarketingHeroVisual({
  src,
  alt,
  aside,
  priority = false,
  className,
}: MarketingHeroVisualProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[440px] lg:max-w-none", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_20px_50px_-20px_rgba(15,45,82,0.35)] ring-1 ring-black/10 lg:aspect-[5/4]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 42vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0f2d52]/55 via-[#0f2d52]/10 to-transparent"
          aria-hidden
        />
      </div>
      {aside ? (
        <div className="relative z-10 -mt-14 px-2 sm:-mt-20 sm:px-4">{aside}</div>
      ) : null}
    </div>
  );
}

interface MarketingCardPhotoProps {
  src: string;
  alt: string;
  className?: string;
}

export function MarketingCardPhoto({ src, alt, className }: MarketingCardPhotoProps) {
  return (
    <div className={cn("relative h-44 overflow-hidden sm:h-48", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent"
        aria-hidden
      />
    </div>
  );
}
