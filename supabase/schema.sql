create extension if not exists pgcrypto;

create table if not exists public.wardrobe_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null default 'default',
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

alter table public.wardrobe_snapshots enable row level security;

drop policy if exists "users can read own wardrobe" on public.wardrobe_snapshots;
create policy "users can read own wardrobe"
on public.wardrobe_snapshots
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own wardrobe" on public.wardrobe_snapshots;
create policy "users can insert own wardrobe"
on public.wardrobe_snapshots
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own wardrobe" on public.wardrobe_snapshots;
create policy "users can update own wardrobe"
on public.wardrobe_snapshots
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

