import { registerGlobals } from "@livekit/react-native";

/**
 * Must run once, before any LiveKitRoom connects — wires WebRTC globals
 * (getUserMedia, RTCPeerConnection, ...) into the RN JS runtime.
 *
 * Exposed as a function (rather than a run-on-import side effect) so the
 * caller can wrap it in a try/catch — a native-module linking failure here
 * would otherwise crash the app before React ever renders anything.
 */
export function initLiveKitGlobals() {
  registerGlobals();
}
