import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FAMILY_PRODUCTS,
  PARTNERSHIP_EFFECTIVE_ON,
  type FamilyOrderRow,
} from "@/lib/gph-commerce";
import { listFamilyOrders } from "@/lib/family-orders";
import type { DiagnosisKind } from "@/lib/player-diagnosis";

export interface LedgerDiagnosis {
  id: string;
  evaluatedAt: string;
  kind: DiagnosisKind;
  evaluatorName: string;
  playerName: string;
  billable: boolean;
  collected: boolean;
  mifichaShareMxn: number;
  gphShareMxn: number;
}

export interface PartnershipLedger {
  cutoff: string;
  orders: FamilyOrderRow[];
  diagnoses: LedgerDiagnosis[];
  collected: {
    total: number;
    mificha: number;
    gph: number;
    diagnosisCount: number;
    membershipCount: number;
  };
  pendingDiagnoses: {
    count: number;
    mificha: number;
    gph: number;
  };
}

function dayOf(value: string | null | undefined) {
  return (value ?? "").slice(0, 10);
}

function norm(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function namesMatch(left: string, right: string) {
  const a = norm(left);
  const b = norm(right);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.length >= 8 && b.length >= 8 && (a.includes(b) || b.includes(a));
}

function inPartnership(value: string | null | undefined) {
  const day = dayOf(value);
  return Boolean(day) && day >= PARTNERSHIP_EFFECTIVE_ON;
}

export async function loadPartnershipLedger(admin: SupabaseClient): Promise<PartnershipLedger> {
  const allOrders = await listFamilyOrders(admin);
  const orders = allOrders.filter((row) =>
    inPartnership(row.status === "paid" ? row.paid_at ?? row.created_at : row.created_at),
  );
  const paid = orders.filter((row) => row.status === "paid");
  const diagnosisProduct = FAMILY_PRODUCTS.diagnosis;

  const diagnoses = await listDiagnosesSince(admin, paid);

  const collected = {
    total: paid.reduce((sum, row) => sum + row.amount_mxn, 0),
    mificha: paid.reduce((sum, row) => sum + row.mificha_share_mxn, 0),
    gph: paid.reduce((sum, row) => sum + row.gph_share_mxn, 0),
    diagnosisCount: paid.filter((row) => row.sku === "diagnosis").length,
    membershipCount: paid.filter((row) => row.sku === "membership").length,
  };
  const pending = diagnoses.filter((row) => row.billable && !row.collected);

  return {
    cutoff: PARTNERSHIP_EFFECTIVE_ON,
    orders,
    diagnoses,
    collected,
    pendingDiagnoses: {
      count: pending.length,
      mificha: pending.length * diagnosisProduct.mifichaShareMxn,
      gph: pending.length * diagnosisProduct.gphShareMxn,
    },
  };
}

async function listDiagnosesSince(admin: SupabaseClient, paid: FamilyOrderRow[]) {
  const { data, error } = await admin
    .from("player_diagnoses")
    .select("id, player_id, kind, evaluated_at, evaluator_name")
    .gte("evaluated_at", PARTNERSHIP_EFFECTIVE_ON)
    .order("evaluated_at", { ascending: false })
    .limit(400);

  if (error || !data) return [];

  const playerIds = [...new Set(data.map((row) => String(row.player_id)))];
  const names = new Map<string, string>();
  if (playerIds.length > 0) {
    const { data: players } = await admin
      .from("players")
      .select("id, first_name, last_name")
      .in("id", playerIds);
    for (const player of players ?? []) {
      names.set(
        String(player.id),
        `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim(),
      );
    }
  }

  const unusedPaid = paid.filter((row) => row.sku === "diagnosis");
  const used = new Set<string>();

  return data.map((row) => {
    const kind = (row.kind as DiagnosisKind) ?? "inicial";
    const billable = kind === "inicial";
    const playerName = names.get(String(row.player_id)) || "Jugador";
    const match = billable
      ? unusedPaid.find((order) => !used.has(order.id) && namesMatch(playerName, order.player_name ?? ""))
      : undefined;
    if (match) used.add(match.id);
    return {
      id: String(row.id),
      evaluatedAt: dayOf(String(row.evaluated_at)),
      kind,
      evaluatorName: String(row.evaluator_name ?? ""),
      playerName,
      billable,
      collected: Boolean(match),
      mifichaShareMxn: billable ? FAMILY_PRODUCTS.diagnosis.mifichaShareMxn : 0,
      gphShareMxn: billable ? FAMILY_PRODUCTS.diagnosis.gphShareMxn : 0,
    } satisfies LedgerDiagnosis;
  });
}
