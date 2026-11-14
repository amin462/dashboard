-- Yala tourist survey dashboard — run once in Supabase SQL Editor
create extension if not exists pgcrypto;

create table if not exists public.survey_responses (
  id            uuid primary key default gen_random_uuid(),
  source        text not null check (source in ('google_form','csv','seed')),
  form_response_id text,                 -- FormResponse.getId() (google_form only)
  submitted_at  timestamptz not null,    -- Google Form timestamp (seconds precision)
  scr01 text, scr02 text, con01 text,    -- 'ใช่'/'ไม่ใช่', 'ยินยอม'/'ไม่ยินยอม'
  sur01 text, sur02 text, sur03 text, sur04 text,   -- required (raw answer text; free text = "other")
  sur05 text, sur06 text, sur07 text,
  sur08 text,                            -- checkbox answers joined with ', ' (Google Sheets format)
  sur09 text, sur10 text, sur11 text,
  is_complete boolean generated always as
    (scr01 = 'ใช่' and scr02 = 'ใช่' and con01 = 'ยินยอม'
     and sur01 is not null and sur02 is not null and sur03 is not null and sur04 is not null) stored,
  dedupe_key    text not null unique,    -- set by trigger below; blocks duplicates from Form + CSV
  imported_at   timestamptz not null default now()
);

create or replace function public.survey_dedupe_key() returns trigger language plpgsql as $$
begin
  new.dedupe_key := md5(concat_ws('|',
    floor(extract(epoch from new.submitted_at))::bigint,
    new.scr01, new.scr02, new.con01, new.sur01, new.sur02, new.sur03, new.sur04, new.sur05,
    new.sur06, new.sur07, new.sur08, new.sur09, new.sur10, new.sur11));
  return new;
end $$;

drop trigger if exists trg_survey_dedupe on public.survey_responses;
create trigger trg_survey_dedupe before insert or update on public.survey_responses
  for each row execute function public.survey_dedupe_key();

create index if not exists survey_responses_submitted_at_idx on public.survey_responses (submitted_at);

-- Import log (EXP-02/03: show what was imported, duplicates, errors)
create table if not exists public.import_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  file_name text,
  total_rows int not null default 0,
  inserted int not null default 0,
  duplicates int not null default 0,
  errors int not null default 0,
  note text,
  created_at timestamptz not null default now()
);

-- Non-secret research project: anon may read; writes only via service role (server / Apps Script)
alter table public.survey_responses enable row level security;
alter table public.import_logs enable row level security;
drop policy if exists "anon read responses" on public.survey_responses;
create policy "anon read responses" on public.survey_responses for select using (true);
drop policy if exists "anon read logs" on public.import_logs;
create policy "anon read logs" on public.import_logs for select using (true);
