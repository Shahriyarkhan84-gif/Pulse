# Pulse — Live Streaming App

A mobile live-streaming app (iOS + Android), built with **React Native + Expo Router** on the
client and a small **Node backend** for auth, chat, and stream signaling. This is not a website —
there is no browser rendering path; every screen below ships as a native app screen.

Media is powered by **[LiveKit](https://livekit.io)** — an open-source, self-hostable WebRTC SFU
(you can also use LiveKit Cloud). Broadcasting and viewing both connect directly to the same
LiveKit room over WebRTC; the backend's only media-related job is minting short-lived,
scoped access tokens for it.

## Why this shape

Live streaming has three concerns that don't belong in one blob, so the structure separates them:

1. **Broadcasting** (a phone's camera → the internet) and **playback** (the internet → viewers)
   both go straight to LiveKit's SFU (Selective Forwarding Unit) over WebRTC — no RTMP encoding
   step, no protocol translation. The SFU fans a publisher's stream out to every subscriber, so
   the broadcaster's upload cost doesn't grow with the number of viewers, unlike a raw
   peer-to-peer WebRTC mesh.
2. **Access control** is a signed JWT per participant (`livekit-server-sdk`), scoped to one room
   with `canPublish`/`canSubscribe` grants — the backend never proxies media, only tokens.
3. **Chat/presence** runs on its own WebSocket gateway, separate from the media path — chat
   fan-out (many-to-many, low payload) has completely different scaling characteristics than video.

```
┌─────────────┐                                    ┌─────────────┐
│  Broadcaster │──── WebRTC (publish token) ───┐    │   Viewers    │
│  (Pulse app) │                                ▼    │  (Pulse app) │
└─────────────┘                        ┌───────────────┐           │
                                        │   LiveKit SFU  │◀── WebRTC (subscribe token)
                                        └───────────────┘
                                                ▲
                                        room create/delete,
                                        token minting (AccessToken)
                                                │
┌─────────────┐      REST      ┌───────────────┐
│  App client  │◀──────────────│  API (auth,    │
│              │───────────────▶│  streams, →   │
└─────────────┘                │  LiveKit token)│
                                └───────────────┘

┌─────────────┐   WebSocket    ┌───────────────┐   WebSocket    ┌─────────────┐
│ Any app user │◀──────────────│ Chat Gateway   │──────────────▶│ Any app user │
└─────────────┘                └───────────────┘                └─────────────┘
```

The client never talks to the LiveKit SDK directly except through `src/components/stream/StreamPlayer.tsx`
(and the `<LiveKitRoom>`/`useTracks` hooks it wraps) — every other screen treats a stream as plain data.

## Directory structure

```
Pulse/
├── app/                        # Expo Router — file-based navigation = the app's screens
│   ├── _layout.tsx             # Root providers + registers LiveKit's WebRTC globals
│   ├── (auth)/                 # Unauthenticated stack
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                 # Main authenticated tab bar
│   │   ├── index.tsx           # Discover — live-now feed
│   │   ├── following.tsx       # Channels the user follows
│   │   ├── go-live.tsx         # Start a broadcast
│   │   ├── search.tsx
│   │   └── profile.tsx
│   ├── stream/[id].tsx         # Watch a specific live stream
│   └── channel/[username].tsx  # A streamer's public channel page
│
├── src/
│   ├── components/             # Presentational, reusable, no business logic
│   │   ├── stream/             # StreamPlayer (LiveKit video), stream cards, live badge
│   │   ├── chat/                # Chat panel, message row, composer
│   │   ├── broadcast/           # Pre-flight camera preview, go-live controls
│   │   └── ui/                  # Buttons, avatars, generic primitives
│   │
│   ├── features/                # One folder per domain: hooks + API calls + local state
│   │   ├── auth/
│   │   ├── streaming/           # start/stop a broadcast, fetch a stream to watch
│   │   ├── chat/                # socket-backed chat hook
│   │   └── discovery/           # live feed, categories, search
│   │
│   ├── services/                 # Thin wrappers around external systems
│   │   ├── api/                 # REST client (axios) + typed endpoints
│   │   ├── sockets/              # WebSocket client for chat/presence
│   │   ├── livekit/              # registerGlobals() — LiveKit's RN WebRTC setup
│   │   ├── push/                 # Expo push notification registration
│   │   └── storage/               # Secure token storage
│   │
│   ├── store/                    # Global app state (zustand)
│   ├── types/                    # Shared TypeScript types (Stream, User, ChatMessage)
│   ├── constants/                 # Theme tokens, env-driven config
│   ├── hooks/                     # Cross-cutting hooks (network status, app state)
│   └── utils/
│
├── assets/                       # Images, fonts
│
└── server/                       # Minimal backend: auth, stream metadata, chat gateway
    └── src/
        ├── routes/                # REST: /auth, /streams, /users
        ├── sockets/               # Chat WebSocket gateway
        ├── services/ingest/       # livekitClient.ts — rooms + AccessToken minting
        └── middleware/
```

## LiveKit setup

1. Get a LiveKit project — either [LiveKit Cloud](https://cloud.livekit.io) (free tier available)
   or a [self-hosted](https://docs.livekit.io/home/self-hosting/local/) instance.
2. Copy `server/.env.example` to `server/.env` and fill in `LIVEKIT_URL`, `LIVEKIT_API_KEY`,
   `LIVEKIT_API_SECRET` from your project's settings.
3. That's it on the client side — the app never holds LiveKit credentials; it only receives a
   scoped token per session from `POST /streams` (broadcaster) or `GET /streams/:id` (viewer).

`react-native-webrtc` (which LiveKit's RN SDK depends on) ships native modules, so this app needs
a custom dev client — it will **not** run inside Expo Go. Build one with:

```bash
npx expo prebuild
npx expo run:ios      # or: npx expo run:android
```

### Scaling past the SFU

LiveKit's SFU comfortably handles real-time WebRTC fan-out for most live-audience sizes. For
audiences beyond that (tens of thousands+), the standard move is **LiveKit Egress** to also
publish the room as HLS and switch large rooms to HLS on the viewer side — `server/src/services/ingest/livekitClient.ts`
is the only file that would need to grow an `egress` call and a swap of `viewToken` for a
`playbackUrl` in `StreamDetail`.

## Getting started

```bash
npm install
npx expo prebuild && npx expo run:ios   # custom dev client (see LiveKit setup above)

cd server
npm install
npm run dev            # run the backend (auth + chat + LiveKit token minting)
```

Copy `.env.example` to `.env` in both the root and `server/` before testing.
