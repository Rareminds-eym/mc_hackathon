create table public.level_4 (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  module integer not null,
  level integer not null default 4,
  score integer not null default 0,
  time integer not null default 0,
  cases jsonb not null,
  is_completed boolean not null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint level_4_pkey primary key (id),
  constraint level_4_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists level_4_user_id_index on public.level_4 using btree (user_id) TABLESPACE pg_default;

create index IF not exists level_4_module_index on public.level_4 using btree (module) TABLESPACE pg_default;

create trigger update_level_4_updated_at BEFORE
update on level_4 for EACH row
execute FUNCTION update_updated_at_column ();