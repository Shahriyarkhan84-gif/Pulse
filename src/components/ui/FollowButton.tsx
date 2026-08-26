import { useState } from "react";
import { Button } from "./Button";

interface FollowButtonProps {
  initiallyFollowing?: boolean;
  onToggle?: (following: boolean) => void;
}

export function FollowButton({ initiallyFollowing = false, onToggle }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initiallyFollowing);

  const handlePress = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    onToggle?.(next);
  };

  return (
    <Button
      label={isFollowing ? "Following" : "Follow"}
      variant={isFollowing ? "secondary" : "primary"}
      onPress={handlePress}
    />
  );
}
