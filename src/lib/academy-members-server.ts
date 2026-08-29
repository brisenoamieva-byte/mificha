import { createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canAccessPitchDeck, getPitchAllowedUserIds } from "@/lib/pitch-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Academy, Profile } from "@/types/database";

export type AcademyAccessRole = "owner" | "staff";

export function createInviteToken() {
  return randomBytes(24).toString("base64url");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export function buildInviteUrl(token: string) {
  return `${getAppBaseUrl()}/fut/unirse/${token}`;
}

export interface AcademyAccess {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  accessRole: AcademyAccessRole;
}

export async function requireAcademyAccess(
  _supabase: SupabaseClient,
  userId: string,
  academyId: string,
): Promise<AcademyAccess> {
  const admin = createSupabaseAdminClient();
  const { data: academy, error } = await admin
    .from("academies")
    .select("id, owner_id, name, slug, logo_url")
    .eq("id", academyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!academy) throw new Error("No autorizado.");

  if (academy.owner_id === userId) {
    return { ...(academy as Omit<AcademyAccess, "accessRole">), accessRole: "owner" };
  }

  const { data: member } = await admin
    .from("academy_members")
    .select("id")
    .eq("academy_id", academyId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (!member) throw new Error("No autorizado.");

  return { ...(academy as Omit<AcademyAccess, "accessRole">), accessRole: "staff" };
}

export interface AcademyMemberRow {
  id: string;
  academy_id: string;
  user_id: string | null;
  invited_email: string;
  invited_name: string | null;
  role: string;
  status: "pending" | "active" | "revoked";
  invite_expires_at: string | null;
  created_at: string;
  accepted_at: string | null;
}

export async function listAcademyMembers(admin: SupabaseClient, academyId: string) {
  const { data, error } = await admin
    .from("academy_members")
    .select(
      "id, academy_id, user_id, invited_email, invited_name, role, status, invite_expires_at, created_at, accepted_at",
    )
    .eq("academy_id", academyId)
    .neq("status", "revoked")
    .order("created_at", { ascending: true });

  if (error) {
    if (error.message.includes("academy_members")) {
      throw new Error(
        "Falta la tabla de equipo. Ejecuta supabase/academy-members.sql en Supabase.",
      );
    }
    throw new Error(error.message);
  }

  return (data ?? []) as AcademyMemberRow[];
}

export async function inviteAcademyMember(
  admin: SupabaseClient,
  input: {
    academyId: string;
    invitedBy: string;
    email: string;
    name: string;
  },
) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || null;
  if (!email) throw new Error("El correo es obligatorio.");

  const { data: academy } = await admin
    .from("academies")
    .select("id, name, owner_id")
    .eq("id", input.academyId)
    .maybeSingle();

  if (!academy) throw new Error("Academia no encontrada.");
  if (academy.owner_id !== input.invitedBy) {
    throw new Error("Solo el dueño puede invitar al equipo.");
  }

  const { data: ownerProfile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", academy.owner_id)
    .maybeSingle();

  if (ownerProfile?.email?.trim().toLowerCase() === email) {
    throw new Error("Ese correo ya es el dueño de la academia.");
  }

  await admin
    .from("academy_members")
    .delete()
    .eq("academy_id", input.academyId)
    .eq("status", "pending")
    .ilike("invited_email", email);

  const token = createInviteToken();
  const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("academy_members")
    .insert({
      academy_id: input.academyId,
      invited_email: email,
      invited_name: name,
      role: "staff",
      status: "pending",
      invite_token_hash: hashInviteToken(token),
      invite_expires_at: expires,
      invited_by: input.invitedBy,
    })
    .select(
      "id, academy_id, user_id, invited_email, invited_name, role, status, invite_expires_at, created_at, accepted_at",
    )
    .single();

  if (error) throw new Error(error.message);

  return {
    member: data as AcademyMemberRow,
    inviteUrl: buildInviteUrl(token),
    academyName: academy.name as string,
  };
}

export async function findInviteByToken(admin: SupabaseClient, token: string) {
  const { data, error } = await admin
    .from("academy_members")
    .select("id, academy_id, invited_email, invited_name, status, invite_expires_at")
    .eq("invite_token_hash", hashInviteToken(token.trim()))
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: academy } = await admin
    .from("academies")
    .select("name")
    .eq("id", data.academy_id)
    .maybeSingle();

  return {
    id: data.id as string,
    academy_id: data.academy_id as string,
    invited_email: data.invited_email as string,
    invited_name: data.invited_name as string | null,
    status: data.status as AcademyMemberRow["status"],
    invite_expires_at: data.invite_expires_at as string | null,
    academy_name: (academy?.name as string | undefined) ?? "MiFicha",
  };
}

export async function acceptInviteForUser(
  admin: SupabaseClient,
  userId: string,
  email: string,
  token?: string,
) {
  const normalized = email.trim().toLowerCase();
  let memberId: string | null = null;

  if (token) {
    const invite = await findInviteByToken(admin, token);
    if (!invite) throw new Error("La invitación no es válida.");
    if (invite.status === "revoked") throw new Error("Esta invitación fue cancelada.");
    if (
      invite.invite_expires_at &&
      new Date(invite.invite_expires_at).getTime() < Date.now()
    ) {
      throw new Error("La invitación expiró. Pide un link nuevo.");
    }
    memberId = invite.id;
  } else {
    const { data } = await admin
      .from("academy_members")
      .select("id, invite_expires_at, status")
      .eq("status", "pending")
      .ilike("invited_email", normalized)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    if (
      data.invite_expires_at &&
      new Date(data.invite_expires_at as string).getTime() < Date.now()
    ) {
      throw new Error("La invitación expiró. Pide un link nuevo.");
    }
    memberId = data.id as string;
  }

  const { data, error } = await admin
    .from("academy_members")
    .update({
      user_id: userId,
      status: "active",
      accepted_at: new Date().toISOString(),
      invite_token_hash: null,
    })
    .eq("id", memberId)
    .select("academy_id")
    .single();

  if (error) throw new Error(error.message);
  return data as { academy_id: string };
}

export async function revokeAcademyMember(
  admin: SupabaseClient,
  academyId: string,
  memberId: string,
  ownerId: string,
) {
  const { data: academy } = await admin
    .from("academies")
    .select("owner_id")
    .eq("id", academyId)
    .maybeSingle();

  if (!academy || academy.owner_id !== ownerId) {
    throw new Error("Solo el dueño puede quitar al equipo.");
  }

  const { error } = await admin
    .from("academy_members")
    .update({ status: "revoked", invite_token_hash: null })
    .eq("id", memberId)
    .eq("academy_id", academyId);

  if (error) throw new Error(error.message);
}

export interface DashboardAcademySession {
  profile: Profile | null;
  academy: Academy | null;
  role: AcademyAccessRole | null;
}

async function firstAcademyForOwner(admin: SupabaseClient, ownerId: string) {
  const { data, error } = await admin
    .from("academies")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  return (data?.[0] as Academy | undefined) ?? null;
}

/** Sesión de panel: evita RLS (42P17 academies ↔ academy_members). */
export async function loadDashboardAcademySession(
  userId: string,
  email?: string | null,
): Promise<DashboardAcademySession> {
  const admin = createSupabaseAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);

  let academy = await firstAcademyForOwner(admin, userId);
  let role: AcademyAccessRole | null = academy ? "owner" : null;

  if (!academy && canAccessPitchDeck(userId, email)) {
    const fallbackOwnerId = getPitchAllowedUserIds().find((id) => id !== userId);
    if (fallbackOwnerId) {
      const fallbackAcademy = await firstAcademyForOwner(admin, fallbackOwnerId);
      if (fallbackAcademy) {
        await admin.from("academies").update({ owner_id: userId }).eq("id", fallbackAcademy.id);
        academy = { ...fallbackAcademy, owner_id: userId };
        role = "owner";
      }
    }
  }

  if (!academy) {
    const { data: membership, error: memberError } = await admin
      .from("academy_members")
      .select("academy_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (memberError && !memberError.message.includes("academy_members")) {
      throw new Error(memberError.message);
    }

    if (membership?.academy_id) {
      const { data: staffAcademy, error: staffError } = await admin
        .from("academies")
        .select("*")
        .eq("id", membership.academy_id as string)
        .maybeSingle();

      if (staffError) throw new Error(staffError.message);
      if (staffAcademy) {
        academy = staffAcademy as Academy;
        role = "staff";
      }
    }
  }

  return {
    profile: (profile as Profile | null) ?? null,
    academy,
    role,
  };
}
