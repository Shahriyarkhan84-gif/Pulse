import { apiClient } from "./client";
import type { StreamDetail, StreamSummary, BroadcastCredentials } from "@/types/stream";

export const endpoints = {
  streams: {
    listLive: () => apiClient.get<StreamSummary[]>("/streams/live"),
    get: (streamId: string) => apiClient.get<StreamDetail>(`/streams/${streamId}`),
    start: (title: string, category: string) =>
      apiClient.post<BroadcastCredentials>("/streams", { title, category }),
    stop: (streamId: string) => apiClient.post(`/streams/${streamId}/stop`),
  },
  uploads: {
    presign: (kind: "avatar" | "thumbnail", contentType: string) =>
      apiClient.post<{ uploadUrl: string; publicUrl: string }>("/uploads/presign", {
        kind,
        contentType,
      }),
  },
  billing: {
    subscribe: (streamerId: string) =>
      apiClient.post<{ checkoutUrl: string }>("/billing/subscribe", { streamerId }),
    tip: (streamerId: string, amountCents: number) =>
      apiClient.post<{ checkoutUrl: string }>("/billing/tip", { streamerId, amountCents }),
  },
};
