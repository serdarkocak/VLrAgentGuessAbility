-- Mevcut Supabase'de çalıştırın (tablolar zaten varsa)
alter table rooms add column if not exists battle_scores jsonb not null default '{}';
alter table rooms add column if not exists current_question jsonb;
alter table rooms add column if not exists last_activity_at timestamptz default now();

update rooms set last_activity_at = coalesce(last_activity_at, created_at);

create index if not exists rooms_last_activity_idx on rooms (last_activity_at);

drop policy if exists "rooms_delete" on rooms;
create policy "rooms_delete" on rooms for delete using (true);
