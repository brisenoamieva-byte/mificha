import { redirect } from "next/navigation";

export default function ReportesPage() {
  redirect("/fut/dashboard/rendimiento?tab=enviar");
}
