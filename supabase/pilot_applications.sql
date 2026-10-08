-- Ejecutar en un proyecto Supabase SEPARADO del entorno deportivo de NodoScouting.
create table if not exists public.pilot_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null check (char_length(nombre) between 1 and 100),
  email text not null check (char_length(email) between 3 and 180),
  rol text not null,
  institucion text,
  prioridad text not null,
  partidos text not null,
  formato text not null,
  demora text not null,
  necesidad text,
  origen text not null default 'landing',
  consentimiento_at timestamptz not null,
  estado text not null default 'nuevo' check (estado in ('nuevo','contactado','entrevista','piloto','cerrado'))
);
create index if not exists pilot_applications_created_idx on public.pilot_applications(created_at desc);
alter table public.pilot_applications enable row level security;
-- No se crean políticas públicas. Sólo la función server-side con service role puede insertar.
