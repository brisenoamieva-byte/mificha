import type { Metadata } from "next";
import { ResetPasswordScreen } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Nueva contraseña | MiFicha",
};

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
