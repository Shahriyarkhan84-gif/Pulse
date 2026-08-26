import { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { CameraPreview } from "@/components/broadcast/CameraPreview";
import { BroadcastControls } from "@/components/broadcast/BroadcastControls";
import { StreamPlayer } from "@/components/stream/StreamPlayer";
import { useIngest } from "@/features/streaming/useIngest";

export default function GoLiveScreen() {
  const { isLive, credentials, goLive, endLive } = useIngest();
  const [title, setTitle] = useState("");

  return (
    <View style={styles.container}>
      {isLive && credentials ? (
        <StreamPlayer serverUrl={credentials.livekitUrl} token={credentials.publishToken} publish />
      ) : (
        <>
          <CameraPreview />
          <TextInput
            style={styles.input}
            placeholder="What are you streaming?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </>
      )}
      <BroadcastControls
        isLive={isLive}
        onGoLive={() => goLive(title || "Untitled stream", "general")}
        onEndLive={endLive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 8,
  },
});
