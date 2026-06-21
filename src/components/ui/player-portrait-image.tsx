import Image from "next/image";
import { cn } from "@/lib/utils";

interface PlayerPortraitImageProps {
  src: string;
  alt: string;
  className?: string;
  objectPosition?: string;
  sizes?: string;
  priority?: boolean;
}

/** Retrato optimizado: next/image en assets locales, img nativo en URLs remotas (Supabase, etc.). */
export function PlayerPortraitImage({
  src,
  alt,
  className,
  objectPosition = "50% 18%",
  sizes = "(max-width: 640px) 50vw, 320px",
  priority = false,
}: PlayerPortraitImageProps) {
  const isLocalAsset = src.startsWith("/");

  if (isLocalAsset) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={cn("object-cover", className)}
        style={{ objectPosition }}
        sizes={sizes}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      style={{ objectPosition }}
    />
  );
}

interface PlayerPortraitThumbProps {
  src: string;
  alt: string;
  className?: string;
  objectPosition?: string;
  sizes?: string;
}

export function PlayerPortraitThumb({
  src,
  alt,
  className,
  objectPosition = "50% 20%",
  sizes = "40px",
}: PlayerPortraitThumbProps) {
  const isLocalAsset = src.startsWith("/");

  if (isLocalAsset) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        style={{ objectPosition }}
        sizes={sizes}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      style={{ objectPosition }}
    />
  );
}
