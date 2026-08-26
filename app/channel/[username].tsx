import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { Button } from "@/components/ui/Button";
import { LiveBadge } from "@/components/stream/LiveBadge";
import { SupportButtons } from "@/components/channel/SupportButtons";
import { colors, spacing } from "@/constants/theme";
import { getProfileByUsername } from "@/features/discovery/discoveryApi";
import { follow, unfollow, isFollowing } from "@/features/social/followApi";
import { useAuth } from "@/features/auth/useAuth";
import type { User } from "@/types/user";

export default function ChannelScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<(User & { liveStreamId?: string }) | null>(null);
  const [alreadyFollowing, setAlreadyFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProfileByUsername(username).then(async (result) => {
      setProfile(result);
      if (result && currentUser) {
        setAlreadyFollowing(await isFollowing(currentUser.id, result.id));
      }
      setIsLoading(false);
    });
  }, [username, currentUser]);

  if (isLoading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Avatar uri={profile.avatarUrl} size={80} />
      <Text style={styles.username}>@{profile.username}</Text>
      {profile.isLive && <LiveBadge />}

      {currentUser && currentUser.id !== profile.id && (
        <FollowButton
          initiallyFollowing={alreadyFollowing}
          onToggle={(next) => (next ? follow(currentUser.id, profile.id) : unfollow(currentUser.id, profile.id))}
        />
      )}

      {profile.isLive && profile.liveStreamId && (
        <Button label="Watch now" onPress={() => router.push(`/stream/${profile.liveStreamId}`)} />
      )}

      {currentUser && currentUser.id !== profile.id && <SupportButtons streamerId={profile.id} />}
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
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
});
