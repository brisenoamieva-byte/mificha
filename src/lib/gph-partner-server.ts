import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAppBaseUrl } from "@/lib/academy-members-server";
import { emailLooksLikeGphEvaluator } from "@/lib/gph-access";
import { slugify } from "@/lib/slugify";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function isGphEvaluatorUser(
  admin: SupabaseClient,
  userId: string,
  email?: string | null,
): Promise<boolean> {
  if (emailLooksLikeGphEvaluator(email)) return true;

  const { data, error } = await admin
    .from("gph_evaluators")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.message.includes("gph_evaluators")) return false;
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function listGphAcademies(admin: SupabaseClient) {
  const { data, error } = await admin
    .from("academies")
    .select("id, name, slug, city, state")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function uniqueAcademySlug(admin: SupabaseClient, base: string) {
  const root = slugify(base) || "academia-gph";
  let slug = root;
  for (let i = 0; i < 20; i++) {
    const { data } = await admin.from("academies").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${root}-${i + 2}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export interface ProvisionGphPartnerInput {
  email: string;
  fullName?: string;
  academyName?: string;
  city?: string;
  grantedBy?: string | null;
}

export async function provisionGphPartner(input: ProvisionGphPartnerInput) {
  const admin = createSupabaseAdminClient();
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName?.trim() || "Gustavo Reyes";
  const academyName = input.academyName?.trim() || "Academia GPH";
  const city = input.city?.trim() || "Querétaro";

  if (!email || !email.includes("@")) {
    throw new Error("El correo de Gustavo es obligatorio.");
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle();

  let user = existingProfile
    ? (await admin.auth.admin.getUserById(existingProfile.id)).data.user
    : null;

  if (!user) {
    const created = await admin.auth.admin.createUser({
      email,
      password: randomBytes(24).toString("base64url"),
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "academy_admin",
      },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "No se pudo crear la cuenta.");
    }
    user = created.data.user;
  }

  await admin.from("profiles").upsert(
    {
      id: user.id,
      email,
      full_name: fullName,
      role: "academy_admin",
    },
    { onConflict: "id" },
  );

  const { data: owned } = await admin
    .from("academies")
    .select("id, name, slug, billing_exempt")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  let academy = owned?.[0] ?? null;

  if (!academy) {
    const slug = await uniqueAcademySlug(admin, academyName);
    const baseAcademy = {
      name: academyName,
      slug,
      owner_id: user.id,
      city,
      state: "Querétaro",
      description: "Academia GPH. Diagnósticos y plantel propio.",
      is_public: false,
      plan_status: "pro" as const,
      primary_color: "#f54200",
    };

    let inserted = await admin
      .from("academies")
      .insert({ ...baseAcademy, billing_exempt: true, is_discoverable: false })
      .select("id, name, slug, billing_exempt")
      .single();

    if (inserted.error) {
      inserted = await admin
        .from("academies")
        .insert(baseAcademy)
        .select("id, name, slug")
        .single();
    }

    if (inserted.error || !inserted.data) {
      const message = inserted.error?.message ?? "No se pudo crear la academia.";
      if (message.includes("billing_exempt") || message.includes("gph_evaluators")) {
        throw new Error(
          "Falta el SQL de socio GPH. Ejecuta supabase/gph-evaluators.sql en Supabase.",
        );
      }
      throw new Error(message);
    }
    academy = inserted.data;
  } else {
    await admin
      .from("academies")
      .update({ billing_exempt: true, plan_status: "pro" })
      .eq("id", academy.id);
  }

  const granted = await admin.from("gph_evaluators").upsert(
    {
      user_id: user.id,
      email,
      full_name: fullName,
      granted_by: input.grantedBy ?? null,
    },
    { onConflict: "user_id" },
  );

  if (granted.error) {
    if (granted.error.message.includes("gph_evaluators")) {
      throw new Error(
        "Falta el SQL de socio GPH. Ejecuta supabase/gph-evaluators.sql en Supabase.",
      );
    }
    throw new Error(granted.error.message);
  }

  const link = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${getAppBaseUrl()}/fut/recuperar/nueva`,
    },
  });

  if (link.error) {
    throw new Error(link.error.message);
  }

  const actionLink =
    link.data.properties?.action_link ??
    (link.data as { action_link?: string }).action_link ??
    null;

  return {
    user_id: user.id,
    email,
    full_name: fullName,
    academy,
    action_link: actionLink,
    login_url: `${getAppBaseUrl()}/fut/login`,
  };
}
