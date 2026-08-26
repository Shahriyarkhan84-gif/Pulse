import { endpoints } from "@/services/api/endpoints";
import { supabase } from "@/services/supabase/client";
import type { User } from "@/types/user";

export async function fetchLiveStreams() {
  const { data } = await endpoints.streams.listLive();
  return data;
}

export async function getProfileByUsername(username: string): Promise<(User & { liveStreamId?: string }) | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const { data: liveStream } = await supabase
    .from("streams")
    .select("id")
    .eq("host_id", profile.id)
    .eq("status", "live")
    .maybeSingle();

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url ?? undefined,
    isLive: liveStream !== null,
    liveStreamId: liveStream?.id,
  };
}
