import { GphLogo } from "@/components/ui/gph-logo";
import type { TutorChild, TutorMaterial } from "@/lib/tutor-family";

type MaterialWithUrl = TutorMaterial & { url: string | null };

const FOOT_LABEL = {
  left: "Zurdo",
  right: "Diestro",
  both: "Ambidiestro",
} as const;

function ageFromBirth(iso: string | null) {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const birth = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 80 ? age : null;
}

export function TutorPublicFicha({
  child,
  materials,
}: {
  child: TutorChild;
  materials: MaterialWithUrl[];
}) {
  const profile = child.profile;
  const age = ageFromBirth(profile.birth_date);
  const photos = materials.filter((item) => item.kind === "photo" && item.url);
  const videos = materials.filter((item) => item.kind === "video" && item.url);
  const stories = materials.filter((item) => item.kind === "story");
  const facts = [
    age != null ? `${age} años` : null,
    profile.position,
    profile.dominant_foot ? FOOT_LABEL[profile.dominant_foot] : null,
    profile.height_cm ? `${profile.height_cm} cm` : null,
    profile.club,
    profile.school,
    profile.city,
  ].filter(Boolean);

  return (
    <article className="overflow-hidden rounded-2xl border border-mf-border bg-white shadow-[var(--mf-shadow)]">
      <div className="h-1.5 bg-mf-gph" aria-hidden />
      <div className="border-b border-mf-border px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Ficha del tutor · MiFicha
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-mf-gph-ink">
              {child.player_name}
            </h1>
            {facts.length ? (
              <p className="mt-2 text-sm text-mf-text-secondary">{facts.join(" · ")}</p>
            ) : null}
          </div>
          <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-mf-border">
            <GphLogo size="sm" />
          </div>
        </div>
        {profile.bio ? (
          <p className="mt-5 max-w-2xl text-sm leading-7 text-mf-text-secondary">{profile.bio}</p>
        ) : null}
        {profile.goals ? (
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
            <span className="font-semibold text-mf-gph-ink">Objetivo. </span>
            {profile.goals}
          </p>
        ) : null}
      </div>

      {photos.length ? (
        <section className="border-b border-mf-border px-5 py-5 sm:px-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            Fotos
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {photos.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-xl bg-mf-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url!} alt={item.title} className="h-56 w-full object-cover" />
                {item.title ? (
                  <figcaption className="px-3 py-2 text-xs text-mf-text-secondary">
                    {item.title}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {videos.length ? (
        <section className="border-b border-mf-border px-5 py-5 sm:px-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            Videos
          </p>
          <div className="mt-3 grid gap-3">
            {videos.map((item) => (
              <figure key={item.id}>
                <video
                  src={item.url!}
                  controls
                  playsInline
                  className="max-h-[420px] w-full rounded-xl bg-black"
                />
                {item.title ? (
                  <figcaption className="mt-2 text-xs text-mf-text-secondary">{item.title}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {stories.length ? (
        <section className="px-5 py-5 sm:px-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            Historia
          </p>
          <ul className="mt-3 space-y-4">
            {stories.map((item) => (
              <li key={item.id} className="rounded-xl bg-mf-canvas px-4 py-3">
                <p className="text-sm font-semibold text-mf-gph-ink">{item.title}</p>
                {item.body ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-mf-text-secondary">
                    {item.body}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!photos.length && !videos.length && !stories.length && !profile.bio ? (
        <p className="px-5 py-8 text-center text-sm text-mf-text-muted sm:px-7">
          Esta ficha aún no tiene material publicado.
        </p>
      ) : null}
    </article>
  );
}
