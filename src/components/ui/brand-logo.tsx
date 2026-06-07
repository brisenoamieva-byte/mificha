import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export function BrandLogo({
  className,
  showWordmark = true,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-mf-brand text-xs font-bold tracking-tight text-white">
        MF
      </div>
      {showWordmark ? (
        <span
          className={cn(
            "text-[1.0625rem] font-semibold tracking-[-0.02em] text-mf-text",
            wordmarkClassName,
          )}
        >
          MiFicha
        </span>
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
