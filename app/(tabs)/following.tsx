import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/constants/theme";

export default function FollowingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Following</Text>
      <Text style={styles.empty}>Channels you follow will show up here when they go live.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  empty: {
    color: colors.textMuted,
  },
});
