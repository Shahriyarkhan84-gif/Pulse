import { endpoints } from "@/services/api/endpoints";

export async function getStream(streamId: string) {
  const { data } = await endpoints.streams.get(streamId);
  return data;
}

export async function startStream(title: string, category: string) {
  const { data } = await endpoints.streams.start(title, category);
  return data;
}

export async function stopStream(streamId: string) {
  await endpoints.streams.stop(streamId);
}
