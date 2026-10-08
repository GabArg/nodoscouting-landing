-- NodoScouting Pilotos: ejecutar en el proyecto gratuito, no en la base deportiva.
-- Primero eliminar ÚNICAMENTE los registros ficticios desde Table Editor.
-- Validar que no haya correos reales duplicados antes de ejecutar este script.
select lower(trim(email)) as email, count(*) as cantidad
from public.pilot_applications
group by lower(trim(email))
having count(*) > 1;

-- Evita múltiples postulaciones del mismo correo, incluso con diferente capitalización.
create unique index if not exists pilot_applications_email_unique
on public.pilot_applications (lower(trim(email)));

-- Mantener RLS y acceso exclusivo del servidor; sin grants a anon/authenticated.
alter table public.pilot_applications enable row level security;
