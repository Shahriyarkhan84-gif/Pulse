import { Image, View, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

interface AvatarProps {
  uri?: string;
  size?: number;
}

export function Avatar({ uri, size = 40 }: AvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (!uri) {
    return <View style={[styles.placeholder, dimension]} />;
  }

  return <Image source={{ uri }} style={dimension} />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surface,
  },
});
