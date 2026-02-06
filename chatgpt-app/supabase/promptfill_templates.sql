create table if not exists public.promptfill_templates (
  owner_id text not null,
  id text not null,
  name text not null,
  template text not null,
  variables jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);

create index if not exists promptfill_templates_owner_created_idx
  on public.promptfill_templates (owner_id, created_at asc);
