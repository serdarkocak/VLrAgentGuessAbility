-- VlrGuessAgentAbility — Supabase SQL Editor'de çalıştırın
-- Mevcut tabloları siler ve yeniden oluşturur (veri kaybı olur).

drop table if exists rooms cascade;
drop table if exists scores cascade;

-- Sıralama tablosu (klasik / zamanlı / günlük modlar)
create table scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  mode text not null,
  difficulty text not null,
  score int not null,
  correct int not null,
  total int not null,
  created_at timestamptz default now()
);

alter table scores enable row level security;

create policy "scores_select" on scores for select using (true);
create policy "scores_insert" on scores for insert with check (true);

-- Kapışma modu odaları
create table rooms (
  code text primary key,
  host_name text not null,
  status text not null default 'waiting',
  question_keys jsonb not null default '[]',
  current_index int not null default 0,
  total_rounds int not null default 10,
  battle_scores jsonb not null default '{}',
  current_question jsonb,
  last_activity_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists rooms_last_activity_idx on rooms (last_activity_at);

alter table rooms enable row level security;

create policy "rooms_select" on rooms for select using (true);
create policy "rooms_insert" on rooms for insert with check (true);
create policy "rooms_update" on rooms for update using (true);
create policy "rooms_delete" on rooms for delete using (true);
