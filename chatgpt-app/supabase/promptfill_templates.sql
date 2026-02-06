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

create table if not exists public.promptfill_template_versions (
  owner_id text not null,
  template_id text not null,
  version_id text not null,
  version_number bigint not null,
  name text not null,
  template text not null,
  variables jsonb not null default '[]'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz,
  snapshot_at timestamptz not null default now(),
  primary key (owner_id, template_id, version_id)
);

create index if not exists promptfill_template_versions_owner_template_version_idx
  on public.promptfill_template_versions (owner_id, template_id, version_number desc);

alter table public.promptfill_templates enable row level security;
alter table public.promptfill_template_versions enable row level security;

drop policy if exists promptfill_templates_service_role_all on public.promptfill_templates;
create policy promptfill_templates_service_role_all
  on public.promptfill_templates
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists promptfill_template_versions_service_role_all on public.promptfill_template_versions;
create policy promptfill_template_versions_service_role_all
  on public.promptfill_template_versions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
