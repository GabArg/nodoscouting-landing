-- Execute ONLY in the separate Supabase project "NodoScouting Pilotos".
-- Each HMAC-hashed IP can attempt up to five verified submissions per UTC hour.
create table if not exists public.pilot_rate_limits (
  ip_hash text not null check (length(ip_hash)=64),
  window_start timestamptz not null,
  attempts integer not null default 0 check (attempts > 0),
  primary key (ip_hash, window_start)
);
alter table public.pilot_rate_limits enable row level security;
revoke all on public.pilot_rate_limits from public, anon, authenticated;
revoke all on public.pilot_rate_limits from service_role;

create or replace function public.pilot_check_rate_limit(p_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  if p_key is null or p_key !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid rate limit key';
  end if;
  insert into public.pilot_rate_limits (ip_hash,window_start,attempts)
  values (p_key,date_trunc('hour',now()),1)
  on conflict (ip_hash,window_start) do update
    set attempts = public.pilot_rate_limits.attempts + 1
  returning attempts into n;
  return n <= 5;
end;
$$;
revoke all on function public.pilot_check_rate_limit(text) from public, anon, authenticated;
grant execute on function public.pilot_check_rate_limit(text) to service_role;

-- Optional cleanup (manually/scheduled), to minimize retained abuse metadata:
-- delete from public.pilot_rate_limits where window_start < now() - interval '2 days';
