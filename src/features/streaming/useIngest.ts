import { useCallback, useState } from "react";
import type { BroadcastCredentials } from "@/types/stream";
import { startStream, stopStream } from "./streamApi";

export function useIngest() {
  const [credentials, setCredentials] = useState<BroadcastCredentials | null>(null);

  const goLive = useCallback(async (title: string, category: string) => {
    const creds = await startStream(title, category);
    setCredentials(creds);
  }, []);

  const endLive = useCallback(async () => {
    if (credentials) await stopStream(credentials.streamId);
    setCredentials(null);
  }, [credentials]);

  return { isLive: credentials !== null, credentials, goLive, endLive };
}
