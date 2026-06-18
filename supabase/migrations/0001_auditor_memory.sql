create extension if not exists pgcrypto;

create table if not exists repo_profile (
  id uuid primary key default gen_random_uuid(),
  repo_key text not null unique,
  repo_name text not null,
  target text not null,
  profile jsonb not null default '{}'::jsonb,
  confidence numeric(4, 3) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists previous_findings (
  id uuid primary key default gen_random_uuid(),
  repo_key text not null,
  finding_key text not null,
  payload jsonb not null default '{}'::jsonb,
  severity text not null,
  confidence numeric(4, 3) not null default 0,
  status text not null default 'open',
  evidence text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists accepted_fixes (
  id uuid primary key default gen_random_uuid(),
  repo_key text not null,
  finding_key text not null,
  pr_number integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists rejected_fixes (
  id uuid primary key default gen_random_uuid(),
  repo_key text not null,
  finding_key text not null,
  rejection_reason text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists known_false_positives (
  id uuid primary key default gen_random_uuid(),
  repo_key text not null,
  fingerprint text not null,
  rationale text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists approved_skills (
  id uuid primary key default gen_random_uuid(),
  skill_name text not null,
  version text not null,
  status text not null default 'approved',
  manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (skill_name, version)
);

create table if not exists proposed_skills (
  id uuid primary key default gen_random_uuid(),
  skill_name text not null,
  version text not null,
  status text not null default 'proposed',
  manifest jsonb not null default '{}'::jsonb,
  sandbox_result jsonb not null default '{}'::jsonb,
  pull_request_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (skill_name, version)
);

create table if not exists skill_test_results (
  id uuid primary key default gen_random_uuid(),
  skill_name text not null,
  version text not null,
  fixture_name text not null,
  passed boolean not null default false,
  findings integer not null default 0,
  false_positives integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists scanner_versions (
  id uuid primary key default gen_random_uuid(),
  scanner_name text not null,
  version text not null,
  manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (scanner_name, version)
);

create table if not exists tool_failures (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null,
  failure_kind text not null,
  details text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists audit_actions (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  target text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_previous_findings_repo_key on previous_findings (repo_key);
create index if not exists idx_previous_findings_severity on previous_findings (severity);
create index if not exists idx_rejected_fixes_repo_key on rejected_fixes (repo_key);
create index if not exists idx_tool_failures_tool_name on tool_failures (tool_name);
create index if not exists idx_skill_test_results_skill_name on skill_test_results (skill_name, version);

alter table repo_profile enable row level security;
alter table previous_findings enable row level security;
alter table accepted_fixes enable row level security;
alter table rejected_fixes enable row level security;
alter table known_false_positives enable row level security;
alter table approved_skills enable row level security;
alter table proposed_skills enable row level security;
alter table skill_test_results enable row level security;
alter table scanner_versions enable row level security;
alter table tool_failures enable row level security;
alter table audit_actions enable row level security;

create policy "service role manages repo_profile"
  on repo_profile for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages previous_findings"
  on previous_findings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages accepted_fixes"
  on accepted_fixes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages rejected_fixes"
  on rejected_fixes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages known_false_positives"
  on known_false_positives for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages approved_skills"
  on approved_skills for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages proposed_skills"
  on proposed_skills for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages skill_test_results"
  on skill_test_results for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages scanner_versions"
  on scanner_versions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages tool_failures"
  on tool_failures for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages audit_actions"
  on audit_actions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
