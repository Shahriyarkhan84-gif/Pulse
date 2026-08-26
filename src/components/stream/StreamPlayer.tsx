import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  AudioSession,
  LiveKitRoom,
  useTracks,
  VideoTrack,
  isTrackReference,
} from "@livekit/react-native";
import { Track } from "livekit-client";
import { colors } from "@/constants/theme";

interface StreamPlayerProps {
  serverUrl: string;
  token: string;
  /** true for the broadcaster's own camera preview, false for a viewer watching the host */
  publish?: boolean;
}

/**
 * Renders a LiveKit room's camera track. Used both for viewer playback
 * (subscribe-only token) and for the broadcaster's live self-preview
 * (publish token) — same track-rendering logic either way.
 */
export function StreamPlayer({ serverUrl, token, publish = false }: StreamPlayerProps) {
  useEffect(() => {
    AudioSession.startAudioSession();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  return (
    <View style={styles.container}>
      <LiveKitRoom serverUrl={serverUrl} token={token} connect audio={publish} video={publish}>
        <CameraTrackView />
      </LiveKitRoom>
    </View>
  );
}

function CameraTrackView() {
  const tracks = useTracks([Track.Source.Camera]);
  const cameraTrack = tracks.find(isTrackReference);

  if (!cameraTrack) {
    return <View style={styles.placeholder} />;
  }

  return <VideoTrack trackRef={cameraTrack} style={styles.video} />;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 9 / 16,
    backgroundColor: colors.background,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surface,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
