import { uploadPlayerVideo } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { PlayerVideo } from "@/types/database";

export const PLAYER_VIDEO_TITLE_PRESETS = [
  "Highlight general",
  "Goles",
  "Asistencias",
  "Habilidad / regate",
  "Entrenamiento",
  "Partido completo",
] as const;

export async function fetchPlayerVideos(playerId: string) {
  const { data, error } = await supabase
    .from("player_videos")
    .select("*")
    .eq("player_id", playerId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PlayerVideo[];
}

export async function addPlayerVideo(input: {
  academyId: string;
  playerId: string;
  title: string;
  file: File;
  sortOrder?: number;
}) {
  const videoUrl = await uploadPlayerVideo(input.academyId, input.file);

  const { data, error } = await supabase
    .from("player_videos")
    .insert({
      academy_id: input.academyId,
      player_id: input.playerId,
      title: input.title.trim() || "Highlight",
      video_url: videoUrl,
      sort_order: input.sortOrder ?? 0,
    })
    .select("*")
    .single();

  if (error) throw error;

  const { data: playerRow } = await supabase
    .from("players")
    .select("video_url")
    .eq("id", input.playerId)
    .maybeSingle();

  if (!playerRow?.video_url) {
    await supabase
      .from("players")
      .update({ video_url: videoUrl })
      .eq("id", input.playerId);
  }

  return data as PlayerVideo;
}

export async function deletePlayerVideo(videoId: string) {
  const { error } = await supabase.from("player_videos").delete().eq("id", videoId);
  if (error) throw error;
}

export function playerHasPromoVideo(player: {
  video_url: string | null;
  promo_video_count?: number;
}) {
  return Boolean(player.video_url?.trim()) || (player.promo_video_count ?? 0) > 0;
}
