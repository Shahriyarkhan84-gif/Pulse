import { endpoints } from "@/services/api/endpoints";

export async function fetchLiveStreams() {
  const { data } = await endpoints.streams.listLive();
  return data;
}
