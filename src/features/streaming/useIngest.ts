import { useCallback, useRef, useState } from "react";
import type { RTCPeerConnection } from "react-native-webrtc";
import { startBroadcast, stopBroadcast } from "@/services/webrtc/webrtcClient";
import { startStream, stopStream } from "./streamApi";

export function useIngest() {
  const [isLive, setIsLive] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);
  const connectionRef = useRef<{ peerConnection: RTCPeerConnection; localStream: MediaStream } | null>(
    null,
  );

  const goLive = useCallback(async (title: string, category: string) => {
    const credentials = await startStream(title, category);
    const connection = await startBroadcast(credentials);
    connectionRef.current = connection;
    setStreamId(credentials.streamId);
    setIsLive(true);
  }, []);

  const endLive = useCallback(async () => {
    if (connectionRef.current) {
      stopBroadcast(connectionRef.current.peerConnection, connectionRef.current.localStream);
      connectionRef.current = null;
    }
    if (streamId) await stopStream(streamId);
    setIsLive(false);
    setStreamId(null);
  }, [streamId]);

  return { isLive, streamId, goLive, endLive };
}
