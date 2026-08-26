import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";
import { initLiveKitGlobals } from "@/services/livekit/registerGlobals";
import { reportCrash, onCrash } from "@/services/system/crashReporter";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { CrashScreen } from "@/components/system/CrashScreen";

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

let startupError: Error | null = null;
try {
  initLiveKitGlobals();
} catch (error) {
  startupError = toError(error);
}

// Catches JS errors that happen outside React's render cycle (event
// handlers, timers, native callbacks) — these would otherwise bypass
// ErrorBoundary and terminate the app with no way to see why.
const globalErrorUtils = (global as { ErrorUtils?: { getGlobalHandler?: () => unknown; setGlobalHandler?: (handler: (error: unknown, isFatal?: boolean) => void) => void } }).ErrorUtils;
globalErrorUtils?.setGlobalHandler?.((error) => {
  reportCrash(toError(error));
});

export default function RootLayout() {
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);

  useEffect(() => {
    onCrash(setRuntimeError);
  }, []);

  if (startupError) {
    return <CrashScreen label="Startup" error={startupError} />;
  }
  if (runtimeError) {
    return <CrashScreen label="Runtime" error={runtimeError} />;
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="stream/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="channel/[username]" options={{ title: "" }} />
      </Stack>
    </ErrorBoundary>
  );
}
