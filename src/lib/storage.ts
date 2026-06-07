import { supabase } from "@/lib/supabase";

export async function uploadPlayerPhoto(academyId: string, file: File) {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${academyId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("player-photos")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPlayerVideo(academyId: string, file: File) {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("El video debe pesar máximo 50 MB.");
  }

  const extension = file.name.split(".").pop() ?? "mp4";
  const path = `${academyId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("player-videos")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("player-videos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAcademyLogo(academyId: string, file: File) {
  const extension = file.name.split(".").pop() ?? "png";
  const path = `${academyId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("academy-logos")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("academy-logos").getPublicUrl(path);
  return data.publicUrl;
}
