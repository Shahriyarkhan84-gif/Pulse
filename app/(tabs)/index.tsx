import { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import type { StreamSummary } from "@/types/stream";
import { fetchLiveStreams } from "@/features/discovery/discoveryApi";
import { StreamCard } from "@/components/stream/StreamCard";
import { colors, spacing } from "@/constants/theme";

export default function DiscoverScreen() {
  const [streams, setStreams] = useState<StreamSummary[]>([]);

  useEffect(() => {
    fetchLiveStreams().then(setStreams).catch(() => setStreams([]));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Live now</Text>
      <FlatList
        data={streams}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <StreamCard stream={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
});
