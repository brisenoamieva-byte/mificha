import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcademyLanding } from "@/components/public/academy-landing";
import {
  fetchPublicAcademyBySlug,
  getPublicAcademyDescription,
} from "@/lib/public-academy";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchPublicAcademyBySlug(slug);

  if (!data) {
    return {
      title: "Academia no disponible | MiFicha",
    };
  }

  const description = getPublicAcademyDescription(data.academy);

  return {
    title: `${data.academy.name} | Academia de Fútbol | MiFicha`,
    description,
    openGraph: {
      title: `${data.academy.name} | Academia de Fútbol | MiFicha`,
      description,
      images: data.academy.logo_url ? [data.academy.logo_url] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.academy.name} | Academia de Fútbol | MiFicha`,
      description,
      images: data.academy.logo_url ? [data.academy.logo_url] : undefined,
    },
  };
}

export default async function AcademyPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchPublicAcademyBySlug(slug);

  if (!data) {
    notFound();
  }

  return <AcademyLanding data={data} />;
}
