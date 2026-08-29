import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

function hashParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

function searchParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URL(window.location.href).searchParams;
}

export function stripAuthParamsFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const keys = [
    "code",
    "token_hash",
    "token",
    "type",
    "error",
    "error_code",
    "error_description",
  ];
  const hadQuery = keys.some((key) => url.searchParams.has(key));
  const hadHash = Boolean(url.hash);
  if (!hadQuery && !hadHash) return;
  keys.forEach((key) => url.searchParams.delete(key));
  url.hash = "";
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
}

function hasAuthCallbackParams() {
  const search = searchParams();
  const hash = hashParams();
  return Boolean(
    search.get("code") ||
      search.get("token_hash") ||
      search.get("token") ||
      search.get("error") ||
      hash.get("access_token") ||
      hash.get("refresh_token") ||
      hash.get("type") ||
      hash.get("error"),
  );
}

/** Intercambia code / token_hash / hash de Supabase por sesión de recuperación. */
export async function consumeAuthRedirect() {
  if (typeof window === "undefined") return false;
  if (!hasAuthCallbackParams()) return false;

  try {
    const search = searchParams();
    const hash = hashParams();
    const error = search.get("error") ?? hash.get("error");
    if (error) return false;

    const code = search.get("code");
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (!exchangeError) {
        stripAuthParamsFromUrl();
        return true;
      }
    }

    const tokenHash = search.get("token_hash") ?? hash.get("token_hash");
    const type = (search.get("type") ?? hash.get("type")) as EmailOtpType | null;
    if (tokenHash && (type === "recovery" || type === "magiclink" || type === "email")) {
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type === "email" ? "email" : "recovery",
      });
      if (!otpError) {
        stripAuthParamsFromUrl();
        return true;
      }
    }

    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (!sessionError) {
        stripAuthParamsFromUrl();
        return true;
      }
    }

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      stripAuthParamsFromUrl();
      return true;
    }

    return false;
  } catch (error) {
    console.error("consumeAuthRedirect", error);
    return false;
  }
}
