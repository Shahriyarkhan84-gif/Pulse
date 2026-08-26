import { Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { formatCompactNumber } from "@/utils/formatters";

export function ViewerCount({ count }: { count: number }) {
  return <Text style={styles.text}>{formatCompactNumber(count)} watching</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
