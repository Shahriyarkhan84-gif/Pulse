import { useEffect, useState } from "react";
import type { StreamDetail } from "@/types/stream";
import { getStream } from "./streamApi";

export function useStream(streamId: string) {
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getStream(streamId)
      .then((data) => {
        if (!cancelled) setStream(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [streamId]);

  return { stream, isLoading };
}
