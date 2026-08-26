import { View, StyleSheet } from "react-native";
import { Button } from "@/components/ui/Button";
import { spacing } from "@/constants/theme";
import { subscribeToStreamer, tipStreamer } from "@/features/billing/billingApi";

const TIP_AMOUNTS_CENTS = [100, 500, 1000];

export function SupportButtons({ streamerId }: { streamerId: string }) {
  return (
    <View style={styles.row}>
      <Button label="Subscribe" onPress={() => subscribeToStreamer(streamerId)} />
      {TIP_AMOUNTS_CENTS.map((amount) => (
        <Button
          key={amount}
          label={`Tip $${amount / 100}`}
          variant="secondary"
          onPress={() => tipStreamer(streamerId, amount)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
