"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND_ICON } from "@/lib/brand";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Muestra escudo + marca tipográfica MiFicha. */
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: "sm" | "md" | "lg";
  /** Escudo claro para fondos oscuros (p. ej. landing de academia). */
  variant?: "default" | "onDark";
}

const iconClasses = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-9 w-9",
} as const;

const iconPixels = {
  sm: 24,
  md: 28,
  lg: 36,
} as const;

const wordmarkClasses = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
} as const;

export function BrandLogo({
  className,
  showWordmark = true,
  wordmarkClassName,
  size = "md",
  variant = "default",
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)} aria-label="MiFicha">
      <Image
        src={BRAND_ICON}
        alt=""
        aria-hidden
        width={iconPixels[size]}
        height={iconPixels[size]}
        className={cn(
          iconClasses[size],
          "shrink-0 object-contain",
          variant === "onDark" && "brightness-0 invert opacity-95",
        )}
        priority
      />
      {showWordmark ? (
        <BrandWordmark
          className={cn(
            wordmarkClasses[size],
            "leading-none",
            variant === "onDark" ? "text-white" : "text-mf-brand",
            wordmarkClassName,
          )}
        />
      ) : null}
    </div>
  );
}

interface BrandLogoLinkProps extends BrandLogoProps {
  href?: string;
}

export function BrandLogoLink({ href = "/", ...props }: BrandLogoLinkProps) {
  return (
    <Link href={href} className="inline-flex">
      <BrandLogo {...props} />
    </Link>
  );
}
