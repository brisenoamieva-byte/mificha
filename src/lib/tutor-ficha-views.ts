import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildVisitorKey,
  getProfileViewDedupSince,
  type AcademyProfileViewStats,
  EMPTY_PROFILE_VIEW_STATS,
} from "@/lib/profile-view-tracking";

const OPS_BUCKET = "mificha-ops";
const VIEWS = "families/tutor-ficha-views.json";

export interface TutorFichaViewRow {
  id: string;
  child_id: string;
  visitor_key: string;
  viewed_at: string;
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readViews(admin: SupabaseClient): Promise<TutorFichaViewRow[]> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(VIEWS);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as TutorFichaViewRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeViews(admin: SupabaseClient, rows: TutorFichaViewRow[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows)], { type: "application/json" });
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(VIEWS, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

export async function recordTutorFichaView(
  admin: SupabaseClient,
  childId: string,
  request: Request,
  tokenHint: string,
): Promise<{ recorded: boolean; deduped?: boolean }> {
  const visitorKey = buildVisitorKey(request, `tutor:${tokenHint}`);
  const dedupSince = getProfileViewDedupSince();
  const rows = await readViews(admin);

  const recent = rows.find(
    (row) =>
      row.child_id === childId &&
      row.visitor_key === visitorKey &&
      row.viewed_at >= dedupSince,
  );
  if (recent) return { recorded: false, deduped: true };

  rows.push({
    id: randomUUID(),
    child_id: childId,
    visitor_key: visitorKey,
    viewed_at: new Date().toISOString(),
  });

  // Keep file bounded for the pilot.
  const trimmed = rows.length > 5000 ? rows.slice(rows.length - 5000) : rows;
  await writeViews(admin, trimmed);
  return { recorded: true };
}

export async function getTutorFichaViewStats(
  admin: SupabaseClient,
  childId: string,
): Promise<AcademyProfileViewStats> {
  const rows = await readViews(admin);
  const mine = rows.filter((row) => row.child_id === childId);
  if (mine.length === 0) return EMPTY_PROFILE_VIEW_STATS;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const unique = new Set(mine.map((row) => row.visitor_key));

  return {
    total_views: mine.length,
    unique_visitors: unique.size,
    views_last_7_days: mine.filter((row) => row.viewed_at >= weekAgo).length,
  };
}
