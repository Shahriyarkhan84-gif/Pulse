import { apiClient } from "./client";
import type { AuthSession } from "@/types/user";
import type { StreamDetail, StreamSummary, BroadcastCredentials } from "@/types/stream";

export const endpoints = {
  auth: {
    login: (email: string, password: string) =>
      apiClient.post<AuthSession>("/auth/login", { email, password }),
    signup: (email: string, password: string, username: string) =>
      apiClient.post<AuthSession>("/auth/signup", { email, password, username }),
  },
  streams: {
    listLive: () => apiClient.get<StreamSummary[]>("/streams/live"),
    get: (streamId: string) => apiClient.get<StreamDetail>(`/streams/${streamId}`),
    start: (title: string, category: string) =>
      apiClient.post<BroadcastCredentials>("/streams", { title, category }),
    stop: (streamId: string) => apiClient.post(`/streams/${streamId}/stop`),
  },
};
