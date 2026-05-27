create table if not exists calls (
  id uuid default gen_random_uuid() primary key,
  call_id text unique,
  created_at timestamptz default now(),
  student_name text,
  phone_number text,
  duration_seconds integer,
  status text,
  ended_reason text,
  transcript text,
  recording_url text,
  sentiment text,
  summary text,
  cost numeric,
  raw jsonb
);

alter table calls enable row level security;

create policy "Allow all" on calls for all using (true);
