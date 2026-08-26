import { useState } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { Button } from "@/components/ui/Button";

export function ChatInput({ onSend }: { onSend: (body: string) => void }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Say something..."
        placeholderTextColor={colors.textMuted}
        onSubmitEditing={handleSend}
      />
      <Button label="Send" onPress={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
