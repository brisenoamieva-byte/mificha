"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND_ICON, BRAND_LOGO } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Full lockup includes wordmark in the asset. Icon-only shows the shield. */
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: "sm" | "md" | "lg";
  /** Invert colors for dark backgrounds (e.g. academy landing footer). */
  variant?: "default" | "onDark";
}

const sizeClasses = {
  sm: { full: "h-7", icon: "h-7 w-7" },
  md: { full: "h-8", icon: "h-8 w-8" },
  lg: { full: "h-10", icon: "h-10 w-10" },
} as const;

export function BrandLogo({
  className,
  showWordmark = true,
  size = "md",
  variant = "default",
}: BrandLogoProps) {
  const sizes = sizeClasses[size];
  const imageClassName = cn(
    showWordmark ? cn(sizes.full, "w-auto") : sizes.icon,
    variant === "onDark" && "brightness-0 invert opacity-95",
  );

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={showWordmark ? BRAND_LOGO : BRAND_ICON}
        alt="MiFicha"
        width={showWordmark ? 665 : 173}
        height={173}
        className={imageClassName}
        priority
      />
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
