import { mediaDevices, RTCPeerConnection } from "react-native-webrtc";
import type { BroadcastCredentials } from "@/types/stream";

/**
 * Publishes the phone's camera/mic to the media server over WHIP.
 * WHIP is a plain HTTP POST carrying an SDP offer, so no signaling
 * server round-trips are needed beyond this one request.
 */
export async function startBroadcast(
  credentials: BroadcastCredentials,
): Promise<{ peerConnection: RTCPeerConnection; localStream: MediaStream }> {
  const localStream = await mediaDevices.getUserMedia({
    audio: true,
    video: { facingMode: "user" },
  });

  const peerConnection = new RTCPeerConnection();
  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

  const offer = await peerConnection.createOffer({});
  await peerConnection.setLocalDescription(offer);

  const response = await fetch(credentials.whipUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/sdp",
      Authorization: `Bearer ${credentials.publishToken}`,
    },
    body: offer.sdp,
  });

  const answerSdp = await response.text();
  await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });

  return { peerConnection, localStream };
}

export function stopBroadcast(peerConnection: RTCPeerConnection, localStream: MediaStream) {
  localStream.getTracks().forEach((track) => track.stop());
  peerConnection.close();
}
