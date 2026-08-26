import { StyleSheet, View } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { colors } from "@/constants/theme";

/**
 * Viewer-side playback uses HLS, not the WHIP/WebRTC path used for broadcasting —
 * HLS scales to many viewers via CDN edge caching, which a WebRTC mesh can't.
 */
export function StreamPlayer({ playbackUrl }: { playbackUrl: string }) {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: playbackUrl }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        useNativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 9 / 16,
    backgroundColor: colors.background,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
