-- 1) Create tables only if they don’t exist (idempotent)
create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  file_path text not null,
  file_name text not null,
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  notes text
);

create table if not exists public.draw_events (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  created_at timestamptz not null default now(),
  algorithm text not null,
  params jsonb,
  created_by uuid
);

create table if not exists public.draw_winners (
  id uuid primary key default gen_random_uuid(),
  draw_event_id uuid not null references public.draw_events(id) on delete cascade,
  user_id uuid not null,
  points integer not null,
  entries integer not null,
  prize text not null,
  created_at timestamptz not null default now()
);

-- 2) Indexes (idempotent)
create index if not exists verifications_status_idx on public.verifications(status);
create index if not exists draw_events_period_start_idx on public.draw_events(period_start desc);
create index if not exists draw_winners_event_idx on public.draw_winners(draw_event_id);
create index if not exists draw_winners_user_idx on public.draw_winners(user_id);

-- 3) RLS policies (CREATE OR REPLACE to avoid “already exists” errors)
alter table if exists public.verifications enable row level security;
alter table if exists public.draw_events enable row level security;
alter table if exists public.draw_winners enable row level security;

-- MVP policies (allow authenticated users to read/write; tighten later)
drop policy if exists "verifications_read" on public.verifications;
create policy "verifications_read" on public.verifications
for select to authenticated
using (true);

drop policy if exists "verifications_write" on public.verifications;
create policy "verifications_write" on public.verifications
for insert to authenticated
with check (true);

drop policy if exists "draw_events_read" on public.draw_events;
create policy "draw_events_read" on public.draw_events
for select to authenticated
using (true);

drop policy if exists "draw_events_insert" on public.draw_events;
create policy "draw_events_insert" on public.draw_events
for insert to authenticated
with check (true);

drop policy if exists "draw_winners_read" on public.draw_winners;
create policy "draw_winners_read" on public.draw_winners
for select to authenticated
using (true);

drop policy if exists "draw_winners_insert" on public.draw_winners;
create policy "draw_winners_insert" on public.draw_winners
for insert to authenticated
with check (true);
