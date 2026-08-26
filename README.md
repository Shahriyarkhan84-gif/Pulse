# Pulse — Live Streaming App

A mobile live-streaming app (iOS + Android), built with **React Native + Expo Router** on the
client and a small **Node backend** for chat and stream signaling. This is not a website — there
is no browser rendering path; every screen below ships as a native app screen.

Four external services do the heavy lifting, each doing exactly one job:

- **[LiveKit](https://livekit.io)** — the WebRTC SFU that carries broadcast/playback video.
- **[Supabase](https://supabase.com)** — auth (email/password) and Postgres (profiles, streams,
  follows, subscriptions, tips). The client talks to Supabase Auth directly; the backend only
  verifies tokens and does privileged writes with the service-role key.
- **[Cloudflare R2](https://developers.cloudflare.com/r2/)** — S3-compatible object storage for
  avatars/thumbnails. The backend hands out short-lived presigned upload URLs; file bytes go
  straight from the app to R2, never through the backend.
- **[Stripe](https://stripe.com)** — Checkout-hosted subscriptions and tips.

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
┌─────────────┐      REST      ┌───────────────┐   service role  ┌─────────────┐
│  App client  │◀──────────────│  API (streams, │────────────────▶│  Supabase   │
│              │───────────────▶│  uploads,     │                 │ (Postgres)  │
└──────┬──────┘                │  billing)     │◀────verify JWT──└─────────────┘
       │                       └───────────────┘
       │ direct                        │
       ▼                                ▼
┌─────────────┐                ┌───────────────┐
│  Supabase    │                │ Stripe / R2   │
│  Auth (JWT)  │                │ (billing/media)│
└─────────────┘                └───────────────┘

┌─────────────┐   WebSocket    ┌───────────────┐   WebSocket    ┌─────────────┐
│ Any app user │◀──────────────│ Chat Gateway   │──────────────▶│ Any app user │
└─────────────┘                └───────────────┘                └─────────────┘
```

Auth is deliberately *not* proxied through the backend: the app signs up/logs in against Supabase
Auth directly and gets back a JWT it holds itself. Every backend route that needs to know who's
calling (`requireAuth`) just verifies that same JWT against Supabase — the backend never issues or
stores credentials of its own.

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
│   │   ├── auth/                # Supabase sign-up/login/session, profile fetch
│   │   ├── streaming/           # start/stop a broadcast, fetch a stream to watch
│   │   ├── chat/                # socket-backed chat hook
│   │   ├── discovery/           # live feed, categories, search, channel lookup
│   │   ├── social/              # follow/unfollow (direct Supabase table access)
│   │   ├── uploads/              # presigned upload → R2
│   │   └── billing/              # Stripe Checkout (subscribe/tip) via in-app browser
│   │
│   ├── services/                 # Thin wrappers around external systems
│   │   ├── api/                 # REST client (axios) + typed endpoints
│   │   ├── sockets/              # WebSocket client for chat/presence
│   │   ├── livekit/              # registerGlobals() — LiveKit's RN WebRTC setup
│   │   ├── supabase/             # Supabase client (auth + Postgres)
│   │   └── push/                 # Expo push notification registration
│   │
│   ├── store/                    # Global app state (zustand)
│   ├── types/                    # Shared TypeScript types (Stream, User, ChatMessage)
│   ├── constants/                 # Theme tokens, env-driven config
│   ├── hooks/                     # Cross-cutting hooks (network status, app state)
│   └── utils/
│
├── assets/                       # Images, fonts
├── supabase/migrations/          # SQL schema: profiles, streams, follows, subscriptions, tips
│
└── server/                       # Minimal backend: LiveKit tokens, uploads, billing, chat gateway
    └── src/
        ├── routes/                # REST: /streams, /uploads, /billing (+ webhook)
        ├── sockets/               # Chat WebSocket gateway (identity via Supabase token)
        ├── services/
        │   ├── ingest/            # livekitClient.ts — rooms + AccessToken minting
        │   ├── supabase/          # admin (service-role) + auth (token verification) clients
        │   ├── storage/           # r2Client.ts — presigned R2 upload URLs
        │   └── billing/           # stripeClient.ts
        └── middleware/            # requireAuth — verifies a Supabase bearer token
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

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration in `supabase/migrations/0001_init.sql` (via the SQL editor, or the Supabase
   CLI: `supabase db push`). It creates `profiles`/`streams`/`follows`/`subscriptions`/`tips` plus
   a trigger that turns a Supabase Auth sign-up into a `profiles` row.
3. Fill in `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (root `.env`) and
   `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (`server/.env`) from your
   project's API settings. The service-role key bypasses row-level security — it stays server-side.

## Cloudflare R2 setup

1. Create a bucket and an R2 API token (Account → R2 → Manage API tokens) with read/write access.
2. Either enable the bucket's public `r2.dev` URL for quick testing, or attach a custom domain —
   either way that's your `R2_PUBLIC_URL`.
3. Fill in `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
   in `server/.env`.

## Stripe setup

1. Create a recurring Price in the Stripe Dashboard for channel subscriptions and set
   `STRIPE_SUBSCRIPTION_PRICE_ID` to its id. Tips use an ad-hoc amount, so they need no Price.
2. Set `STRIPE_SECRET_KEY` in `server/.env`.
3. Forward webhooks to your local server while developing: `stripe listen --forward-to
   localhost:4000/billing/webhook`, and put the CLI's printed signing secret in
   `STRIPE_WEBHOOK_SECRET`. `checkout.session.completed` writes the `subscriptions`/`tips` row;
   `customer.subscription.deleted` marks a subscription canceled.
4. Checkout is a hosted, redirect-based flow — the app opens it with `expo-web-browser` rather
   than embedding Stripe UI, so there's no PCI scope inside the app itself.

## Getting started

```bash
npm install
npx expo prebuild && npx expo run:ios   # custom dev client (see LiveKit setup above)

cd server
npm install
npm run dev            # run the backend (LiveKit tokens, uploads, billing, chat gateway)
```

Copy `.env.example` to `.env` in both the root and `server/`, then work through the LiveKit,
Supabase, R2, and Stripe setup sections above before testing signup → go-live → watch end to end.
