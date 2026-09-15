-- Daily Planner schema. Run once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

do $$ begin
  create type card_status as enum ('todo', 'in_progress', 'done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type card_priority as enum ('high', 'normal', 'low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_kind as enum ('change', 'note');
exception when duplicate_object then null; end $$;

create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  link text,
  section_id uuid not null references sections(id) on delete cascade,
  status card_status not null default 'todo',
  priority card_priority not null default 'normal',
  position integer not null default 0,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards(id) on delete cascade,
  text text not null,
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists card_people (
  card_id uuid not null references cards(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (card_id, person_id)
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards(id) on delete cascade,
  kind activity_kind not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists cards_status_position_idx on cards (status, position);
create index if not exists checklist_items_card_idx on checklist_items (card_id, position);
create index if not exists activities_card_idx on activities (card_id, created_at desc);

create or replace function set_cards_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cards_set_updated_at on cards;
create trigger cards_set_updated_at
before update on cards
for each row execute function set_cards_updated_at();

create or replace function delete_section_with_move(section_id uuid, target_section_id uuid)
returns void as $$
begin
  if section_id = target_section_id then
    raise exception 'target section must differ from the deleted section';
  end if;
  update cards set section_id = target_section_id where cards.section_id = delete_section_with_move.section_id;
  delete from sections where id = delete_section_with_move.section_id;
end;
$$ language plpgsql;
