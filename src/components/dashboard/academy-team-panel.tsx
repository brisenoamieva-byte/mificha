"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, UserPlus } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

interface MemberRow {
  id: string;
  invited_email: string;
  invited_name: string | null;
  status: "pending" | "active" | "revoked";
}

async function authedFetch(input: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sesión expirada.");
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "No se pudo completar.");
  return payload;
}

export function AcademyTeamPanel() {
  const { academy, accessRole } = useDashboard();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [name, setName] = useState("Gustavo Reyes");
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!academy || accessRole !== "owner") return;
    setLoading(true);
    try {
      const payload = await authedFetch(
        `/fut/api/academy/members?academy_id=${encodeURIComponent(academy.id)}`,
      );
      setMembers((payload.members as MemberRow[]) ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se cargó el equipo.");
    } finally {
      setLoading(false);
    }
  }, [academy, accessRole]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!academy || accessRole !== "owner") return null;

  async function invite() {
    if (!academy) return;
    setSaving(true);
    setInviteUrl(null);
    try {
      const payload = await authedFetch("/fut/api/academy/members", {
        method: "POST",
        body: JSON.stringify({
          academy_id: academy.id,
          email,
          name,
        }),
      });
      const url = typeof payload.invite_url === "string" ? payload.invite_url : null;
      setInviteUrl(url);
      setEmail("");
      toast.success("Invitación lista. Copia el link y envíaselo a Gustavo.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo invitar.");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    toast.success("Link copiado.");
  }

  async function revoke(memberId: string) {
    if (!academy) return;
    try {
      await authedFetch(
        `/fut/api/academy/members?academy_id=${encodeURIComponent(academy.id)}&member_id=${encodeURIComponent(memberId)}`,
        { method: "DELETE" },
      );
      toast.success("Acceso revocado.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo revocar.");
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Equipo</h2>
      <p className="mt-1 text-sm text-slate-600">
        Invita a tu socio para que entre, llene diagnósticos y vea las fichas del
        plantel. No puede cambiar la ficha de la academia ni la facturación.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mf-input"
          placeholder="Nombre"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mf-input"
          placeholder="correo@del-socio.com"
        />
        <button
          type="button"
          disabled={saving || !email.trim()}
          onClick={() => void invite()}
          className="mf-btn-primary"
        >
          <UserPlus className="h-4 w-4" />
          {saving ? "Invitando…" : "Invitar"}
        </button>
      </div>

      {inviteUrl ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-mf-brand-soft px-3 py-3 text-sm">
          <p className="min-w-0 flex-1 truncate text-mf-brand">{inviteUrl}</p>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex items-center gap-1 font-semibold text-mf-brand"
          >
            <Copy className="h-4 w-4" />
            Copiar link
          </button>
        </div>
      ) : null}

      <ul className="mt-5 divide-y divide-slate-100">
        {loading ? (
          <li className="py-3 text-sm text-slate-500">Cargando equipo…</li>
        ) : members.length === 0 ? (
          <li className="py-3 text-sm text-slate-500">
            Nadie invitado todavía. Empieza con Gustavo Reyes.
          </li>
        ) : (
          members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {member.invited_name || member.invited_email}
                </p>
                <p className="text-slate-500">
                  {member.invited_email} ·{" "}
                  {member.status === "active" ? "Activo" : "Pendiente de unirse"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void revoke(member.id)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Quitar
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
