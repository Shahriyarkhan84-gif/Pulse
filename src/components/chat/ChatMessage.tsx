import { Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  return (
    <Text style={styles.text}>
      <Text style={styles.username}>{message.username}: </Text>
      {message.body}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 4,
  },
  username: {
    color: colors.primary,
    fontWeight: "600",
  },
});
