import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing } from "@/constants/theme";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/useAuth";
import { updateAvatar } from "@/features/auth/authApi";
import { uploadImage } from "@/features/uploads/uploadApi";

export default function ProfileScreen() {
  const { currentUser, logout, refreshProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleChangeAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !currentUser) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadImage("avatar", result.assets[0].uri);
      await updateAvatar(currentUser.id, publicUrl);
      await refreshProfile();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Avatar uri={currentUser?.avatarUrl} size={80} />
      <Text style={styles.name}>{currentUser?.displayName ?? "Guest"}</Text>
      <Text style={styles.username}>@{currentUser?.username ?? "unknown"}</Text>
      <Button
        label={isUploading ? "Uploading..." : "Change avatar"}
        variant="secondary"
        onPress={handleChangeAvatar}
        disabled={isUploading}
      />
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
