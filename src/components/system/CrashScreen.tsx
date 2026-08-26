import { ScrollView, Text, View, StyleSheet } from "react-native";

interface CrashScreenProps {
  label: string;
  error: Error;
}

/**
 * Shown instead of letting the app silently terminate on an uncaught error —
 * a diagnostic aid for this build only. Screenshot this and send it back.
 */
export function CrashScreen({ label, error }: CrashScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{label} error</Text>
        <Text style={styles.message}>{error.message}</Text>
        {error.stack ? <Text style={styles.stack}>{error.stack}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2B0B0B",
    paddingTop: 60,
  },
  content: {
    padding: 16,
  },
  title: {
    color: "#FF6B6B",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  message: {
    color: "#FFD5D5",
    fontSize: 15,
    marginBottom: 16,
  },
  stack: {
    color: "#FFAAAA",
    fontSize: 11,
    fontFamily: "monospace",
  },
});
