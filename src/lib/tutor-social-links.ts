import type { TutorChildProfile } from "@/lib/tutor-family";

export type TutorSocialLink = {
  id: "instagram" | "tiktok" | "facebook" | "youtube";
  label: string;
  href: string;
};

function asHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function handleFrom(value: string) {
  return value.trim().replace(/^@/, "");
}

export function buildTutorSocialLinks(
  profile: Pick<
    TutorChildProfile,
    "instagram" | "tiktok" | "facebook" | "youtube_url"
  >,
): TutorSocialLink[] {
  const links: TutorSocialLink[] = [];

  const ig = profile.instagram?.trim();
  if (ig) {
    const href = /^https?:\/\//i.test(ig)
      ? ig
      : `https://instagram.com/${handleFrom(ig)}`;
    links.push({ id: "instagram", label: "Instagram", href });
  }

  const tt = profile.tiktok?.trim();
  if (tt) {
    const href = /^https?:\/\//i.test(tt)
      ? tt
      : `https://tiktok.com/@${handleFrom(tt)}`;
    links.push({ id: "tiktok", label: "TikTok", href });
  }

  const fb = profile.facebook?.trim();
  if (fb) {
    const href = asHttpUrl(
      /^https?:\/\//i.test(fb) || fb.includes("facebook.com")
        ? fb
        : `facebook.com/${handleFrom(fb)}`,
    );
    if (href) links.push({ id: "facebook", label: "Facebook", href });
  }

  const yt = profile.youtube_url?.trim();
  if (yt) {
    const href = asHttpUrl(yt);
    if (href) links.push({ id: "youtube", label: "YouTube", href });
  }

  return links;
}
