import { FlatList, View, StyleSheet } from "react-native";
import { useChatSocket } from "@/features/chat/useChatSocket";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export function ChatPanel({ streamId }: { streamId: string }) {
  const { messages, sendMessage } = useChatSocket(streamId);

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage message={item} />}
        style={styles.list}
        inverted={false}
      />
      <ChatInput onSend={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: 12,
  },
});
