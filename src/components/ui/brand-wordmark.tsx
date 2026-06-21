import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const BRAND_SPLIT = /(MiFicha)/g;

interface BrandWordmarkProps {
  className?: string;
}

/** Marca tipográfica: Mi (normal) + Ficha (negrita) · color de marca por defecto. */
export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span className={cn("inline text-mf-brand", className)} aria-label="MiFicha">
      <span className="font-normal">Mi</span>
      <span className="font-bold">Ficha</span>
    </span>
  );
}

interface WithBrandNameProps {
  children: string;
  className?: string;
}

/** Sustituye cada «MiFicha» en un texto por la marca tipográfica. */
export function WithBrandName({ children, className }: WithBrandNameProps) {
  const parts = children.split(BRAND_SPLIT);

  if (parts.length === 1) {
    return <>{children}</>;
  }

  return (
    <>
      {parts.map((part, index) =>
        part === "MiFicha" ? (
          <BrandWordmark key={`brand-${index}`} className={className} />
        ) : (
          <Fragment key={`text-${index}`}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Marca tipográfica para imágenes OG (ImageResponse). */
export function OgBrandWordmark({
  style,
  tone = "inherit",
}: {
  style?: CSSProperties;
  /** brand = #1B4F8C · inherit = color del contenedor (p. ej. blanco en OG oscuro) */
  tone?: "brand" | "inherit";
}) {
  return (
    <span
      style={{
        display: "inline",
        ...(tone === "brand" ? { color: "#1B4F8C" } : null),
        ...style,
      }}
    >
      <span style={{ fontWeight: 400 }}>Mi</span>
      <span style={{ fontWeight: 700 }}>Ficha</span>
    </span>
  );
}

export function containsBrandName(text: string): boolean {
  return text.includes("MiFicha");
}

export function renderWithBrandName(text: string, className?: string): ReactNode {
  if (!containsBrandName(text)) {
    return text;
  }

  return <WithBrandName className={className}>{text}</WithBrandName>;
}
