import { View, StyleSheet } from "react-native";
import { Button } from "@/components/ui/Button";
import { spacing } from "@/constants/theme";

interface BroadcastControlsProps {
  isLive: boolean;
  onGoLive: () => void;
  onEndLive: () => void;
}

export function BroadcastControls({ isLive, onGoLive, onEndLive }: BroadcastControlsProps) {
  return (
    <View style={styles.row}>
      {isLive ? (
        <Button label="End Stream" variant="secondary" onPress={onEndLive} />
      ) : (
        <Button label="Go Live" onPress={onGoLive} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: spacing.md,
  },
});
