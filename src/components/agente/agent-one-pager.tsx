import Image from "next/image";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import {
  ageFromBirthDate,
  careerTimelineLines,
  digitalFichaPath,
  footLabel,
  formatBirthDisplay,
  formatHeightMeters,
  galleryPhotoUrls,
  resolveHighlightsUrl,
} from "@/lib/agent-materials";
import type { TutorChild, TutorMaterial, TutorSeasonStat } from "@/lib/tutor-family";

type MaterialWithUrl = TutorMaterial & { url: string | null };

function waHref(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const e164 =
    digits.startsWith("52") || digits.startsWith("54") || digits.startsWith("507")
      ? digits
      : `52${digits}`;
  return `https://wa.me/${e164}`;
}

export function AgentOnePager({
  child,
  materials,
  seasons = [],
  absoluteFichaUrl,
}: {
  child: TutorChild;
  materials: MaterialWithUrl[];
  seasons?: TutorSeasonStat[];
  absoluteFichaUrl?: string;
}) {
  const profile = child.profile;
  const age = ageFromBirthDate(profile.birth_date);
  const birthLabel = formatBirthDisplay(profile.birth_date);
  const photos = galleryPhotoUrls(materials, 2);
  const timeline = careerTimelineLines(seasons, 8);
  const fichaUrl = absoluteFichaUrl ?? digitalFichaPath(child);
  const height = formatHeightMeters(profile.height_cm);
  const weight =
    profile.weight_kg != null && profile.weight_kg > 0
      ? `${profile.weight_kg} kg`
      : null;
  const highlights = resolveHighlightsUrl(profile.youtube_url, materials);
  const transfermarkt = profile.transfermarkt_url?.trim() || null;
  const contactPhone = child.guardian_phone?.trim() || null;
  const contactHref = waHref(contactPhone);
  const role =
    profile.role_title?.trim() ||
    (profile.position ? `Jugador · ${profile.position}` : "Jugador de fútbol");
  const chips = profile.highlight_chips?.length
    ? profile.highlight_chips
    : timeline.slice(0, 4).map((item) => item.stage);

  const datos = [
    { label: "Edad", value: age != null ? `${age} años` : "—" },
    { label: "Fecha de nacimiento", value: birthLabel || "—" },
    { label: "Nacionalidad", value: profile.nationality || "—" },
    {
      label: "Estatura · peso",
      value: [height, weight].filter(Boolean).join(" · ") || "—",
    },
    { label: "Pie hábil", value: footLabel(profile.dominant_foot) || "—" },
    { label: "Posición", value: profile.position || "—" },
    { label: "Club actual", value: profile.club || "—" },
  ] as const;

  return (
    <article className="agent-one-pager-print overflow-hidden rounded-2xl border border-mf-border bg-white shadow-[0_20px_50px_-28px_rgba(15,45,82,0.35)]">
      {/* Header tipo hoja de vida */}
      <header className="grid gap-0 bg-[#0a1f3d] text-white lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="flex flex-col justify-end px-5 py-6 sm:px-7 sm:py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Hoja de vida · <BrandWordmark className="text-white" />
          </p>
          <h1 className="mt-3 text-[2rem] font-bold uppercase leading-[0.95] tracking-tight sm:text-[2.45rem]">
            {child.player_name}
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-rose-400">
            {role}
          </p>
          <p className="mt-1 text-sm text-white/75">
            {[profile.position, profile.club || profile.city].filter(Boolean).join("  ·  ") ||
              "Perfil de jugador"}
          </p>
          {child.public_code ? (
            <p className="mt-4 font-mono text-xs font-semibold text-emerald-300">
              {child.public_code}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/10">
          {[0, 1].map((index) => (
            <div key={index} className="relative min-h-[160px] bg-[#123d68] sm:min-h-[220px]">
              {photos[index] ? (
                <Image
                  src={photos[index]}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="220px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center px-3 text-center text-xs text-white/50">
                  {index === 0 ? "Foto portada" : "Segunda foto"}
                </div>
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Chips / hitos */}
      {chips.length > 0 ? (
        <div className="grid gap-px border-b border-white/10 bg-[#0a1f3d] sm:grid-cols-2 lg:grid-cols-4">
          {chips.slice(0, 4).map((chip) => (
            <div key={chip} className="bg-[#123d68] px-4 py-3 text-center">
              <p className="text-xs font-semibold leading-5 text-white">{chip}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* Columna datos / contacto */}
        <aside className="border-b border-mf-border bg-[#f3f5f8] px-5 py-5 lg:border-b-0 lg:border-r sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600">
            Datos
          </p>
          <dl className="mt-3 space-y-2.5">
            {datos.map((item) => (
              <div key={item.label}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                  {item.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-mf-gph-ink">{item.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600">
            Contacto
          </p>
          <ul className="mt-3 space-y-2 text-sm text-mf-gph-ink">
            <li>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                WhatsApp
              </span>
              <div className="mt-0.5 font-semibold">
                {contactPhone ? (
                  <a href={contactHref ?? undefined} className="hover:underline">
                    {contactPhone}
                  </a>
                ) : (
                  "—"
                )}
              </div>
            </li>
            <li>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                Correo
              </span>
              <div className="mt-0.5 font-semibold break-all">
                {profile.contact_email || "—"}
              </div>
            </li>
            <li>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                Instagram
              </span>
              <div className="mt-0.5 font-semibold">
                {profile.instagram ? `@${profile.instagram}` : "—"}
              </div>
            </li>
            <li>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                Ubicación
              </span>
              <div className="mt-0.5 font-semibold">{profile.city || "—"}</div>
            </li>
          </ul>

          {profile.tagline ? (
            <div className="mt-6 border-t border-mf-border pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600">
                En una frase
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-mf-gph-ink">
                {profile.tagline}
              </p>
            </div>
          ) : null}
        </aside>

        {/* Columna narrativa */}
        <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600">
              Sobre mí
            </p>
            <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
              {profile.bio ||
                "Escribe el perfil: trayectoria, estilo de juego y mentalidad."}
            </p>
          </section>

          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600">
              Trayectoria en clubes
            </p>
            {timeline.length === 0 ? (
              <p className="mt-2 text-sm text-mf-text-muted">
                Agrega temporadas (club + años) en la ficha.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {timeline.map((item) => (
                  <li
                    key={item.id}
                    className="grid gap-1 border-b border-mf-border-subtle pb-2 text-sm sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]"
                  >
                    <span className="font-semibold text-mf-gph-ink">
                      {item.stage}
                      {item.stats ? ` · ${item.stats}` : ""}
                    </span>
                    <span className="text-mf-text-secondary">{item.club}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {profile.callups?.length ? (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600">
                Selección / convocatorias
              </p>
              <ul className="mt-3 space-y-2">
                {profile.callups.map((row, index) => (
                  <li
                    key={`${row.level}-${index}`}
                    className="grid gap-1 border-b border-mf-border-subtle pb-2 text-sm sm:grid-cols-[7rem_minmax(0,1fr)]"
                  >
                    <span className="font-semibold uppercase text-mf-gph-ink">{row.level}</span>
                    <span className="text-mf-text-secondary">{row.detail}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {profile.achievements?.length ? (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600">
                Logros deportivos
              </p>
              <ul className="mt-3 space-y-2">
                {profile.achievements.map((row, index) => (
                  <li
                    key={`${row.title}-${index}`}
                    className="grid gap-1 border-b border-mf-border-subtle pb-2 text-sm sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]"
                  >
                    <span className="font-semibold text-mf-gph-ink">{row.title}</span>
                    <span className="text-mf-text-secondary">{row.detail}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="grid gap-2 border-t border-mf-border pt-4 sm:grid-cols-3">
            <LinkChip label="YouTube" href={highlights} />
            <LinkChip label="Transfermarkt" href={transfermarkt} />
            <LinkChip label="Ficha MiFicha" href={fichaUrl} />
          </section>
        </div>
      </div>
    </article>
  );
}

function LinkChip({ label, href }: { label: string; href: string | null }) {
  if (!href) {
    return (
      <div className="rounded-xl border border-dashed border-mf-border px-3 py-2.5 text-xs text-mf-text-muted">
        {label}
      </div>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-mf-border bg-mf-canvas px-3 py-2.5 text-xs font-semibold text-mf-gph-ink hover:border-mf-gph/40"
    >
      {label}
      <span className="mt-1 block truncate font-medium text-mf-text-secondary">{href}</span>
    </a>
  );
}
