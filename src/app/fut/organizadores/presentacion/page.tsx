import type { Metadata } from "next";
import { OrganizerPitchPublic } from "@/components/marketing/organizer-pitch-public";

export const metadata: Metadata = {
  title: "Presentación para organizadores | MiFicha",
  description:
    "Presentación corta de MiFicha para organizadores de torneo: calendario, acta y fichas.",
};

export default function OrganizadoresPresentacionPage() {
  return <OrganizerPitchPublic />;
}
