import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors, spacing } from "@/constants/theme";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/useAuth";

export default function ProfileScreen() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Avatar uri={currentUser?.avatarUrl} size={80} />
      <Text style={styles.name}>{currentUser?.displayName ?? "Guest"}</Text>
      <Text style={styles.username}>@{currentUser?.username ?? "unknown"}</Text>
      <Button label="Log out" variant="secondary" onPress={handleLogout} />
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
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  username: {
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
});
