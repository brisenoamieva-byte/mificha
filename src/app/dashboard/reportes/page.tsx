import { redirect } from "next/navigation";

export default function ReportesPage() {
  redirect("/dashboard/rendimiento?tab=enviar");
}
