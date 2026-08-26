import { Image, Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import type { StreamSummary } from "@/types/stream";
import { colors, spacing } from "@/constants/theme";
import { LiveBadge } from "./LiveBadge";
import { ViewerCount } from "./ViewerCount";

export function StreamCard({ stream }: { stream: StreamSummary }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/stream/${stream.id}`)}>
      {stream.thumbnailUrl ? (
        <Image source={{ uri: stream.thumbnailUrl }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
      )}
      <LiveBadge />
      <Text style={styles.title} numberOfLines={1}>
        {stream.title}
      </Text>
      <Text style={styles.host} numberOfLines={1}>
        {stream.host.displayName}
      </Text>
      <ViewerCount count={stream.viewerCount} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    marginRight: spacing.md,
  },
  thumbnail: {
    width: "100%",
    height: 124,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    fontWeight: "600",
  },
  host: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
});
