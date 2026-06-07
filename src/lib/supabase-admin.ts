import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type MediaBucket = "player-photos" | "player-videos" | "academy-logos";

let serviceClient: SupabaseClient | null = null;

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase service role environment variables.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getServiceSupabase() {
  if (serviceClient) return serviceClient;

  try {
    serviceClient = createSupabaseAdminClient();
    return serviceClient;
  } catch {
    return null;
  }
}

export function extractStoragePath(publicUrl: string, bucket: MediaBucket): string | null {
  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
    `/storage/v1/object/authenticated/${bucket}/`,
    `/storage/v1/object/${bucket}/`,
  ];

  for (const marker of markers) {
    const index = publicUrl.indexOf(marker);
    if (index === -1) continue;

    return decodeURIComponent(
      publicUrl.slice(index + marker.length).split("?")[0],
    );
  }

  return null;
}

export async function signMediaUrlIfNeeded(
  publicUrl: string | null,
  bucket: MediaBucket,
  expiresInSeconds = 60 * 60,
): Promise<string | null> {
  if (!publicUrl) return null;

  const supabase = getServiceSupabase();
  if (!supabase) return publicUrl;

  const path = extractStoragePath(publicUrl, bucket);
  if (!path) return publicUrl;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return publicUrl;
  }

  return data.signedUrl;
}

export async function signPlayerPhotoUrl(photoUrl: string | null) {
  return signMediaUrlIfNeeded(photoUrl, "player-photos");
}

export async function signPlayerVideoUrl(videoUrl: string | null) {
  return signMediaUrlIfNeeded(videoUrl, "player-videos");
}
