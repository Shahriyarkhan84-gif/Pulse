import { Pressable, Text, StyleSheet, type PressableProps } from "react-native";
import { colors, spacing } from "@/constants/theme";

interface ButtonProps extends PressableProps {
  label: string;
  variant?: "primary" | "secondary";
}

export function Button({ label, variant = "primary", style, ...props }: ButtonProps) {
  return (
    <Pressable
      style={[styles.base, variant === "secondary" && styles.secondary, style as object]}
      {...props}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.text,
    fontWeight: "600",
  },
});
