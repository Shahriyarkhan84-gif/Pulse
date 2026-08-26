-- Profiles mirror auth.users 1:1 — auth.users itself is managed by Supabase
-- Auth and shouldn't be queried directly from app code.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Populates a profile row the moment someone signs up, reading the
-- username/display name passed as signUp() metadata.
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create type stream_status as enum ('live', 'ended');

create table streams (
  id text primary key, -- matches the LiveKit room name
  host_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  category text not null default 'general',
  thumbnail_url text,
  status stream_status not null default 'live',
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create index streams_live_idx on streams (started_at desc) where status = 'live';

create table follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references profiles(id) on delete cascade,
  streamer_id uuid not null references profiles(id) on delete cascade,
  stripe_subscription_id text unique not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table tips (
  id uuid primary key default gen_random_uuid(),
  tipper_id uuid not null references profiles(id) on delete cascade,
  streamer_id uuid not null references profiles(id) on delete cascade,
  amount_cents integer not null,
  stripe_payment_intent_id text unique not null,
  created_at timestamptz not null default now()
);

-- RLS: profiles/streams/follows are public read (it's a public streaming
-- app); writes only ever happen through the backend (service role) or as
-- the row's own owner.
alter table profiles enable row level security;
alter table streams enable row level security;
alter table follows enable row level security;
alter table subscriptions enable row level security;
alter table tips enable row level security;

create policy "Profiles are publicly readable" on profiles for select using (true);
create policy "Users update their own profile" on profiles for update using (auth.uid() = id);

create policy "Streams are publicly readable" on streams for select using (true);

create policy "Follows are publicly readable" on follows for select using (true);
create policy "Users manage their own follows" on follows for insert with check (auth.uid() = follower_id);
create policy "Users remove their own follows" on follows for delete using (auth.uid() = follower_id);

create policy "Users read their own subscriptions" on subscriptions
  for select using (auth.uid() = subscriber_id or auth.uid() = streamer_id);

create policy "Users read their own tips" on tips
  for select using (auth.uid() = tipper_id or auth.uid() = streamer_id);
