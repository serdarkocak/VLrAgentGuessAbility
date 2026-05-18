-- Kapışma modu — Supabase SQL Editor'de çalıştır
-- Realtime: Dashboard → Database → Replication → rooms tablosunu etkinleştir

create table if not exists rooms (
  code text primary key,
  host_name text not null,
  status text not null default 'waiting',
  question_keys jsonb not null default '[]',
  current_index int not null default 0,
  total_rounds int not null default 10,
  created_at timestamptz default now()
);

alter table rooms enable row level security;

drop policy if exists "rooms_select" on rooms;
drop policy if exists "rooms_insert" on rooms;
drop policy if exists "rooms_update" on rooms;

create policy "rooms_select" on rooms for select using (true);
create policy "rooms_insert" on rooms for insert with check (true);
create policy "rooms_update" on rooms for update using (true);
