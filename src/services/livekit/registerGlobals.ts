import { registerGlobals } from "@livekit/react-native";

// Must run once, before any LiveKitRoom connects — wires WebRTC globals
// (getUserMedia, RTCPeerConnection, ...) into the RN JS runtime.
registerGlobals();
