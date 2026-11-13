import Image from "next/image";
import type { ReactNode } from "react";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import {
  ageFromBirthDate,
  careerTimelineLines,
  footLabel,
  formatHeightMeters,
  galleryPhotoUrls,
} from "@/lib/agent-materials";
import type { TutorChild, TutorMaterial, TutorSeasonStat } from "@/lib/tutor-family";

type MaterialWithUrl = TutorMaterial & { url: string | null };

function Slide({
  eyebrow,
  children,
  className = "",
}: {
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`agent-deck-slide flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-mf-border bg-white shadow-[0_16px_40px_-28px_rgba(15,45,82,0.35)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-mf-border px-5 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
          {eyebrow || "Presentación"}
        </p>
        <BrandWordmark className="text-mf-gph text-sm" />
      </div>
      <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10">{children}</div>
    </section>
  );
}

export function AgentPresentationDeck({
  child,
  materials,
  seasons = [],
}: {
  child: TutorChild;
  materials: MaterialWithUrl[];
  seasons?: TutorSeasonStat[];
}) {
  const profile = child.profile;
  const photos = galleryPhotoUrls(materials, 2);
  const age = ageFromBirthDate(profile.birth_date);
  const height = formatHeightMeters(profile.height_cm);
  const timeline = careerTimelineLines(seasons, 6);
  const role =
    profile.role_title?.trim() ||
    (profile.position ? `Jugador · ${profile.position}` : "Jugador de fútbol");

  return (
    <div className="agent-deck-print space-y-6">
      <Slide eyebrow="Portada">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose-600">
              {role}
            </p>
            <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.95] tracking-tight text-mf-gph-ink sm:text-5xl">
              {child.player_name}
            </h2>
            <p className="mt-4 text-base text-mf-text-secondary">
              {[profile.position, profile.club, profile.city].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-xl bg-[#0f2d52]">
            {photos[0] ? (
              <Image src={photos[0]} alt="" fill className="object-cover" unoptimized />
            ) : null}
          </div>
        </div>
      </Slide>

      <Slide eyebrow="Perfil">
        <h2 className="text-2xl font-semibold text-mf-gph-ink">Perfil</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Edad", value: age != null ? `${age}` : "—" },
            { label: "Estatura", value: height || "—" },
            {
              label: "Peso",
              value: profile.weight_kg ? `${profile.weight_kg} kg` : "—",
            },
            { label: "Pie hábil", value: footLabel(profile.dominant_foot) || "—" },
            { label: "Posición", value: profile.position || "—" },
            { label: "Club actual", value: profile.club || "—" },
            { label: "Nacionalidad", value: profile.nationality || "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-mf-border px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                {item.label}
              </dt>
              <dd className="mt-1 text-lg font-semibold text-mf-gph-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Slide>

      <Slide eyebrow="Sobre mí">
        <h2 className="text-2xl font-semibold text-mf-gph-ink">Sobre mí</h2>
        {profile.tagline ? (
          <p className="mt-3 text-lg font-semibold text-rose-600">{profile.tagline}</p>
        ) : null}
        <p className="mt-4 max-w-3xl text-base leading-8 text-mf-text-secondary">
          {profile.bio || "Completa la presentación del jugador en la ficha."}
        </p>
      </Slide>

      <Slide eyebrow="Trayectoria">
        <h2 className="text-2xl font-semibold text-mf-gph-ink">Trayectoria en clubes</h2>
        <ul className="mt-6 space-y-3">
          {timeline.length === 0 ? (
            <li className="text-mf-text-muted">Sin temporadas cargadas.</li>
          ) : (
            timeline.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-mf-border-subtle pb-3"
              >
                <span className="font-semibold text-mf-gph-ink">{item.club}</span>
                <span className="text-sm text-mf-text-secondary">{item.stage}</span>
              </li>
            ))
          )}
        </ul>
      </Slide>

      {profile.callups?.length ? (
        <Slide eyebrow="Selección">
          <h2 className="text-2xl font-semibold text-mf-gph-ink">Selección / convocatorias</h2>
          <ul className="mt-6 space-y-3">
            {profile.callups.map((row, index) => (
              <li key={`${row.level}-${index}`} className="border-b border-mf-border-subtle pb-3">
                <p className="font-semibold uppercase text-mf-gph-ink">{row.level}</p>
                <p className="mt-1 text-sm text-mf-text-secondary">{row.detail}</p>
              </li>
            ))}
          </ul>
        </Slide>
      ) : null}

      {profile.achievements?.length ? (
        <Slide eyebrow="Logros">
          <h2 className="text-2xl font-semibold text-mf-gph-ink">Logros deportivos</h2>
          <ul className="mt-6 space-y-3">
            {profile.achievements.map((row, index) => (
              <li
                key={`${row.title}-${index}`}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-mf-border-subtle pb-3"
              >
                <span className="font-semibold text-mf-gph-ink">{row.title}</span>
                <span className="text-sm text-mf-text-secondary">{row.detail}</span>
              </li>
            ))}
          </ul>
        </Slide>
      ) : null}

      <Slide eyebrow="Contacto" className="bg-[#0a1f3d] text-white">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-300">
            Lista para el siguiente reto
          </p>
          <h2 className="mt-3 text-3xl font-bold uppercase tracking-tight">Hablemos</h2>
          <ul className="mx-auto mt-8 max-w-md space-y-2 text-base text-white/85">
            {child.guardian_phone ? <li>{child.guardian_phone}</li> : null}
            {profile.contact_email ? <li>{profile.contact_email}</li> : null}
            {profile.instagram ? <li>@{profile.instagram}</li> : null}
            {profile.city ? <li>{profile.city}</li> : null}
          </ul>
        </div>
      </Slide>
    </div>
  );
}
