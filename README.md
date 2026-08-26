# Pulse — Live Streaming App

A mobile live-streaming app (iOS + Android), built with **React Native + Expo Router** on the
client and a small **Node backend** for auth, chat, and stream signaling. This is not a website —
there is no browser rendering path; every screen below ships as a native app screen.

## Why this shape

Live streaming has three concerns that don't belong in one blob, so the structure separates them:

1. **Broadcasting** (a phone's camera → the internet) — WebRTC/WHIP ingest, not RTMP, because
   RTMP encoders on mobile are heavier and Apple/Android camera capture pipes into WebRTC natively.
2. **Playback** (the internet → thousands of viewers) — HLS/LL-HLS, because WebRTC doesn't scale
   to large viewer counts without an SFU mesh; the ingest server transcodes WHIP → HLS.
3. **Chat/presence** — a separate WebSocket gateway, because chat fan-out (many-to-many, low
   payload) has completely different scaling characteristics than media.

```
┌─────────────┐  WHIP/WebRTC   ┌───────────────┐   HLS/LL-HLS   ┌─────────────┐
│  Broadcaster │ ─────────────▶│  Media Server  │──────────────▶│   Viewers    │
│  (Pulse app) │                │ (ingest+trans- │                │ (Pulse app) │
└─────────────┘                │   code, e.g.   │                └─────────────┘
                                │ LiveKit/Mux/IVS)│
                                └───────────────┘

┌─────────────┐   WebSocket    ┌───────────────┐   WebSocket    ┌─────────────┐
│ Any app user │◀──────────────│ Chat Gateway   │──────────────▶│ Any app user │
└─────────────┘                └───────────────┘                └─────────────┘

┌─────────────┐      REST      ┌───────────────┐
│  App client  │◀──────────────│  API (auth,    │
│              │───────────────▶│  users, streams│
└─────────────┘                │  metadata)     │
                                └───────────────┘
```

The client never talks to a raw media server SDK directly except through `src/services/webrtc`
and the player component — everything else (screens, chat, discovery) treats a stream as data.

## Directory structure

```
Pulse/
├── app/                        # Expo Router — file-based navigation = the app's screens
│   ├── _layout.tsx             # Root providers (auth, theme, query client)
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
│   │   ├── stream/             # Player, stream cards, live badge, viewer count
│   │   ├── chat/                # Chat panel, message row, composer
│   │   ├── broadcast/           # Camera preview, go-live controls
│   │   └── ui/                  # Buttons, avatars, generic primitives
│   │
│   ├── features/                # One folder per domain: hooks + API calls + local state
│   │   ├── auth/
│   │   ├── streaming/           # start/stop/join a stream, ingest URL fetch
│   │   ├── chat/                # socket-backed chat hook
│   │   └── discovery/           # live feed, categories, search
│   │
│   ├── services/                 # Thin wrappers around external systems
│   │   ├── api/                 # REST client (axios) + typed endpoints
│   │   ├── sockets/              # WebSocket client for chat/presence
│   │   ├── webrtc/               # WHIP publish client for broadcasting
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
        ├── services/ingest/       # Talks to the media server (LiveKit/Mux/IVS) API
        └── middleware/
```

## Suggested media server

This scaffold assumes a managed or self-hosted media server that speaks WHIP-in / HLS-out
(e.g. **LiveKit**, **Mux Real-Time Video**, or **Amazon IVS Real-Time**). `server/src/services/ingest`
is the one place that would need a real SDK call to create a room/channel and return:
- a WHIP publish URL + token to the broadcaster (`go-live.tsx`)
- an HLS playback URL to viewers (`stream/[id].tsx`)

Swapping media-server providers only touches that one file plus `src/services/webrtc/webrtcClient.ts`.

## Getting started

```bash
npm install
npx expo start        # run the client (scan QR with Expo Go, or run on a simulator)

cd server
npm install
npm run dev            # run the backend (auth + chat + stream metadata)
```

Copy `.env.example` to `.env` in both the root and `server/`, and fill in your media-server
credentials before testing real broadcasts.
