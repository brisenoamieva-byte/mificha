import Image from "next/image";
import type { ReactNode } from "react";
import type { MarketingImageMeta } from "@/lib/marketing-assets";
import { marketingPhotoStyle } from "@/lib/marketing-assets";
import { cn } from "@/lib/utils";

interface MarketingHeroVisualProps {
  meta: MarketingImageMeta;
  aside?: ReactNode;
  priority?: boolean;
  className?: string;
}

export function MarketingHeroVisual({
  meta,
  aside,
  priority = false,
  className,
}: MarketingHeroVisualProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[440px] lg:max-w-none", className)}>
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-[0_20px_50px_-20px_rgba(15,45,82,0.35)] ring-1 ring-black/10 sm:aspect-[5/3] lg:aspect-[16/10]"
        style={marketingPhotoStyle(meta)}
      >
        <Image
          src={meta.src}
          alt={meta.alt}
          fill
          priority={priority}
          className="marketing-cover-photo"
          sizes="(max-width: 1024px) 100vw, 42vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0f2d52]/75 via-[#0f2d52]/15 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10 lg:hidden"
          aria-hidden
        />
      </div>
      {aside ? (
        <div className="relative z-10 mt-5 px-1 sm:px-2 lg:-mt-[4.5rem] lg:px-4 xl:-mt-20">
          {aside}
        </div>
      ) : null}
    </div>
  );
}

interface MarketingCardPhotoProps {
  meta: MarketingImageMeta;
  className?: string;
  aspectClassName?: string;
}

export function MarketingCardPhoto({
  meta,
  className,
  aspectClassName = "aspect-[16/10]",
}: MarketingCardPhotoProps) {
  return (
    <div
      className={cn("relative overflow-hidden", aspectClassName, className)}
      style={marketingPhotoStyle(meta)}
    >
      <Image
        src={meta.src}
        alt={meta.alt}
        fill
        className="marketing-cover-photo transition duration-500 group-hover:scale-[1.02]"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent"
        aria-hidden
      />
    </div>
  );
}

interface MarketingBackgroundPhotoProps {
  meta: MarketingImageMeta;
  priority?: boolean;
  className?: string;
}

export function MarketingBackgroundPhoto({
  meta,
  priority = false,
  className,
}: MarketingBackgroundPhotoProps) {
  return (
    <div className={cn("absolute inset-0", className)} style={marketingPhotoStyle(meta)}>
      <Image
        src={meta.src}
        alt={meta.alt}
        fill
        priority={priority}
        className="marketing-cover-photo"
        sizes="100vw"
        aria-hidden={!meta.alt}
      />
    </div>
  );
}
