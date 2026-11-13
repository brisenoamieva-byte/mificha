import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcademyLanding } from "@/components/public/academy-landing";
import {
  getDemoAcademyPublicData,
  isDemoAcademySlug,
} from "@/lib/explore-demo-data";
import {
  fetchPublicAcademyBySlug,
  getPublicAcademyDescription,
} from "@/lib/public-academy";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function academyShareImages(data: {
  academy: { cover_url?: string | null; logo_url?: string | null };
}) {
  const images = [data.academy.cover_url, data.academy.logo_url].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  return images.length > 0 ? images : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const data = isDemoAcademySlug(slug)
    ? getDemoAcademyPublicData()
    : await fetchPublicAcademyBySlug(slug);

  if (!data) {
    return {
      title: "Academia no disponible | MiFicha",
    };
  }

  const description = getPublicAcademyDescription(data.academy);
  const images = academyShareImages(data);

  return {
    title: `${data.academy.name} | Academia de Fútbol | MiFicha`,
    description,
    openGraph: {
      title: `${data.academy.name} | Academia de Fútbol | MiFicha`,
      description,
      images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.academy.name} | Academia de Fútbol | MiFicha`,
      description,
      images,
    },
  };
}

export default async function AcademyPublicPage({ params }: PageProps) {
  const { slug } = await params;

  const data = isDemoAcademySlug(slug)
    ? getDemoAcademyPublicData()
    : await fetchPublicAcademyBySlug(slug);

  if (!data) {
    notFound();
  }

  return <AcademyLanding data={data} />;
}
