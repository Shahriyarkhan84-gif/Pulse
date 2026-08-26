import type { User } from "./user";

export type StreamStatus = "idle" | "starting" | "live" | "ended";

export interface StreamSummary {
  id: string;
  title: string;
  category: string;
  thumbnailUrl?: string;
  viewerCount: number;
  status: StreamStatus;
  host: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
}

export interface StreamDetail extends StreamSummary {
  playbackUrl: string; // HLS/LL-HLS URL, viewer side
  startedAt?: string;
}

export interface BroadcastCredentials {
  streamId: string;
  whipUrl: string; // WHIP publish endpoint, broadcaster side
  publishToken: string;
}
