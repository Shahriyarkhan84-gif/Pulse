import { AccessToken, LiveKitAPI } from "livekit-server-sdk";

/**
 * The one place that talks to the media server. LiveKit's client SDKs
 * publish/subscribe over WebRTC directly against a LiveKit SFU (Selective
 * Forwarding Unit), so there's no separate ingest-protocol step (no
 * RTMP/WHIP) — a room is just created, and short-lived signed tokens grant
 * publish or subscribe rights to it.
 *
 * LiveKit's SFU fans out media efficiently to a large number of viewers
 * without the sender doing extra work per-viewer. For audiences beyond what
 * a single SFU deployment handles well, add LiveKit Egress here to also
 * output HLS and switch big rooms to that on the viewer side — this file
 * is the only one that would need to change.
 */

const host = requireEnv("LIVEKIT_URL"); // e.g. wss://your-project.livekit.cloud
const apiKey = requireEnv("LIVEKIT_API_KEY");
const apiSecret = requireEnv("LIVEKIT_API_SECRET");

const livekit = new LiveKitAPI({ host, apiKey, secret: apiSecret });

interface BroadcastCredentials {
  streamId: string;
  livekitUrl: string;
  publishToken: string;
}

interface ViewerCredentials {
  livekitUrl: string;
  viewToken: string;
}

export async function createRoom(hostIdentity: string, title: string): Promise<BroadcastCredentials> {
  const streamId = `stream-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

  await livekit.room.createRoom({
    name: streamId,
    emptyTimeout: 5 * 60, // seconds; room is torn down if the host never connects
    maxParticipants: 5000,
  });

  const token = new AccessToken(apiKey, apiSecret, { identity: hostIdentity, name: title });
  token.addGrant({ room: streamId, roomJoin: true, canPublish: true, canSubscribe: false });

  return { streamId, livekitUrl: host, publishToken: await token.toJwt() };
}

export async function createViewerToken(streamId: string, viewerIdentity: string): Promise<ViewerCredentials> {
  const token = new AccessToken(apiKey, apiSecret, { identity: viewerIdentity });
  token.addGrant({ room: streamId, roomJoin: true, canPublish: false, canSubscribe: true });

  return { livekitUrl: host, viewToken: await token.toJwt() };
}

export async function endRoom(streamId: string): Promise<void> {
  await livekit.room.deleteRoom(streamId);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
