import { GphLogo } from "@/components/ui/gph-logo";
import { TutorPerformanceBridge } from "@/components/tutor/tutor-performance-bridge";
import type { TutorLinkedPerformance } from "@/lib/tutor-linked-performance";
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export function TutorPublicFicha({
  child,
  materials,
  compact = false,
  performance = null,
}: {
  child: TutorChild;
  materials: MaterialWithUrl[];
  compact?: boolean;
  performance?: TutorLinkedPerformance | null;
}) {
  const profile = child.profile;
  const age = ageFromBirth(profile.birth_date);
  const photos = materials.filter((item) => item.kind === "photo" && item.url);
  const videos = materials.filter((item) => item.kind === "video" && item.url);
  const stories = materials.filter((item) => item.kind === "story");
  const coverPhoto =
    photos.find((item) => item.is_cover) ?? photos[0] ?? null;
  const cover = coverPhoto?.url ?? null;
  const featuredVideo =
    videos.find((item) => item.is_featured) ?? videos[0] ?? null;
  const galleryPhotos = photos.filter((item) => item.id !== coverPhoto?.id);
  const extraVideos = videos.filter((item) => item.id !== featuredVideo?.id);
  const position = profile.position || "Posición por definir";

  return (
    <div className="space-y-4">
      <article className="overflow-hidden rounded-2xl border border-mf-border bg-white shadow-[0_24px_60px_-28px_rgba(15,45,82,0.45)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1f3d] via-[#123d68] to-[#0f2d52] px-5 py-6 text-white sm:px-7 sm:py-7">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(52,211,153,0.22),transparent_35%),repeating-linear-gradient(-45deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_2px,transparent_2px,transparent_12px)]"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mf-accent-bright">
                Ficha del jugador · MiFicha
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {child.player_name}
              </h1>
              {child.public_code ? (
                <p className="mt-2 font-mono text-sm font-semibold tracking-wide text-mf-accent-bright">
                  {child.public_code}
                </p>
              ) : null}
              <p className="mt-2 text-base font-semibold text-white">
                {position}
                {age != null ? ` · ${age} años` : ""}
              </p>
              <p className="mt-1 text-sm font-medium text-white/75">
                {[profile.club || profile.school, profile.city].filter(Boolean).join(" · ") ||
                  "Club y ciudad por definir"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3">
              <div className="rounded-md bg-white px-2 py-1.5">
                <GphLogo size="sm" />
              </div>
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  className="h-24 w-24 rounded-2xl border-2 border-white/30 object-cover shadow-lg sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-white/25 bg-white/5 text-xs font-semibold uppercase tracking-wide text-white/50 sm:h-28 sm:w-28">
                  Sin foto
                </div>
              )}
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              label="Pie"
              value={profile.dominant_foot ? FOOT_LABEL[profile.dominant_foot] : "—"}
            />
            <Stat label="Estatura" value={profile.height_cm ? `${profile.height_cm} cm` : "—"} />
            <Stat label="Club" value={profile.club || "—"} />
            <Stat label="Ciudad" value={profile.city || "—"} />
          </div>
        </div>

        {featuredVideo?.url ? (
          <section className="border-b border-mf-border px-5 py-5 sm:px-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
              Video destacado
            </p>
            <video
              src={featuredVideo.url}
              controls
              playsInline
              preload="metadata"
              className="mt-3 max-h-[420px] w-full rounded-xl bg-black"
            />
            {featuredVideo.title ? (
              <p className="mt-2 text-sm text-mf-text-secondary">{featuredVideo.title}</p>
            ) : null}
          </section>
        ) : null}

        {profile.bio || profile.goals ? (
          <div className="border-b border-mf-border px-5 py-5 sm:px-7">
            {profile.bio ? (
              <p className="text-sm leading-7 text-mf-text-secondary">{profile.bio}</p>
            ) : null}
            {profile.goals ? (
              <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
                <span className="font-semibold text-mf-gph-ink">Objetivo. </span>
                {profile.goals}
              </p>
            ) : null}
          </div>
        ) : null}

        {!compact && galleryPhotos.length ? (
          <section className="border-b border-mf-border px-5 py-5 sm:px-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
              Galería
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {galleryPhotos.map((item) => (
                <figure key={item.id} className="overflow-hidden rounded-xl bg-mf-canvas">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url!} alt={item.title} className="h-48 w-full object-cover" />
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {!compact && extraVideos.length ? (
          <section className="border-b border-mf-border px-5 py-5 sm:px-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
              Más videos
            </p>
            <div className="mt-3 grid gap-3">
              {extraVideos.map((item) => (
                <video
                  key={item.id}
                  src={item.url!}
                  controls
                  playsInline
                  className="max-h-[360px] w-full rounded-xl bg-black"
                />
              ))}
            </div>
          </section>
        ) : null}

        {!compact && stories.length ? (
          <section className="px-5 py-5 sm:px-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
              Notas del tutor
            </p>
            <ul className="mt-3 space-y-3">
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
            {compact
              ? "Completa los pasos de la derecha para armar esta ficha."
              : "El tutor aún está armando esta ficha."}
          </p>
        ) : null}
      </article>

      {performance ? <TutorPerformanceBridge performance={performance} /> : null}
    </div>
  );
}
