import { getAudienceById } from "@/lib/audience-value-props";
import { BrandWordmark } from "@/components/ui/brand-wordmark";

interface AudienceBenefitsSectionProps {
  audienceId: "padres" | "jugadores" | "scout" | "academia" | "organizador";
  title?: string;
  className?: string;
}

export function AudienceBenefitsSection({
  audienceId,
  title,
  className,
}: AudienceBenefitsSectionProps) {
  const audience = getAudienceById(audienceId);
  if (!audience) return null;

  const resolvedTitle =
    title === undefined || title === "Por qué MiFicha" ? (
      <>
        Por qué <BrandWordmark />?
      </>
    ) : (
      title
    );

  return (
    <section className={className}>
      <p className="mf-marketing-eyebrow">{resolvedTitle}</p>
      <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-mf-text sm:text-2xl">
        {audience.headline}
      </h2>
      <ul className="mt-5 space-y-3">
        {audience.reasons.map((reason) => (
          <li
            key={reason}
            className="flex gap-3 text-sm leading-7 text-mf-text-secondary sm:text-base"
          >
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mf-brand" />
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
