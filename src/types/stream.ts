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
  livekitUrl: string; // wss:// URL of the LiveKit server/cloud project
  viewToken: string; // subscribe-only LiveKit access token, viewer side
  startedAt?: string;
}

export interface BroadcastCredentials {
  streamId: string;
  livekitUrl: string;
  publishToken: string; // publish-enabled LiveKit access token, broadcaster side
}
