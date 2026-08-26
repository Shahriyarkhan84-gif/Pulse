import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { colors, spacing } from "@/constants/theme";

export default function ChannelScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();

  return (
    <View style={styles.container}>
      <Avatar size={80} />
      <Text style={styles.username}>@{username}</Text>
      <FollowButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  username: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
});
