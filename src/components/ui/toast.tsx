"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export function AppToaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg",
          title: "text-sm font-semibold",
          description: "text-sm text-slate-600",
          success: "border-green-200 bg-green-50 text-green-900",
          error: "border-red-200 bg-red-50 text-red-900",
        },
      }}
    />
  );
}

export function showSuccessToast(message: string) {
  toast.success(message);
}

export function showErrorToast(message: string) {
  toast.error(message);
}

export { toast };
