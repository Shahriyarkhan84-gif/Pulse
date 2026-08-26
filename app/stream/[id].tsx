import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useStream } from "@/features/streaming/useStream";
import { StreamPlayer } from "@/components/stream/StreamPlayer";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ViewerCount } from "@/components/stream/ViewerCount";
import { colors, spacing } from "@/constants/theme";

export default function StreamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stream, isLoading } = useStream(id);

  if (isLoading || !stream) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StreamPlayer serverUrl={stream.livekitUrl} token={stream.viewToken} />
      <View style={styles.info}>
        <Text style={styles.title}>{stream.title}</Text>
        <ViewerCount count={stream.viewerCount} />
      </View>
      <ChatPanel streamId={stream.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
});
