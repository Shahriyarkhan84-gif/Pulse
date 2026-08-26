/**
 * The only file that should need to change when swapping media-server
 * providers (LiveKit, Mux Real-Time Video, Amazon IVS Real-Time, ...).
 * It is responsible for creating a room/channel and returning the
 * WHIP publish URL (broadcaster) and HLS playback URL (viewers).
 */

interface BroadcastCredentials {
  streamId: string;
  whipUrl: string;
  publishToken: string;
}

export async function createRoom(title: string, category: string): Promise<BroadcastCredentials> {
  // TODO: call the media server's API to provision a room and mint a publish token
  throw new Error("mediaServerClient.createRoom is not implemented — wire up your media server SDK");
}

export async function endRoom(streamId: string): Promise<void> {
  // TODO: call the media server's API to tear down the room
}

export async function getPlaybackUrl(streamId: string): Promise<string> {
  // TODO: resolve the HLS/LL-HLS playback URL for this stream
  throw new Error("mediaServerClient.getPlaybackUrl is not implemented");
}
