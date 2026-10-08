# Formulario piloto (sin tocar el motor deportivo)

La landing guarda solicitudes a través de una función de Vercel en `/api/pilot`, que inserta en un proyecto **Supabase independiente**. No hay credenciales en el navegador ni acceso público a la tabla.

## Antes de publicar
1. Crear un proyecto Supabase separado y ejecutar `supabase/pilot_applications.sql` desde su SQL Editor.
2. En **Vercel > proyecto de landing > Settings > Environment Variables**, configurar:
   - `PILOT_SUPABASE_URL`: URL del proyecto nuevo.
   - `PILOT_SUPABASE_SERVICE_ROLE_KEY`: clave secreta del proyecto nuevo (solo servidor). **Nunca compartirla por chat, GitHub ni ponerla en el HTML**.
3. Hacer un deployment **Preview** desde la rama del pull request y realizar un envío de prueba con datos ficticios. Confirmar que se guardó una fila y que aparece el mensaje de éxito.
4. Opcional: configurar `RESEND_API_KEY`, `PILOT_NOTIFY_EMAIL` y `PILOT_FROM_EMAIL` (remitente de dominio verificado en Resend) para notificación de nuevas solicitudes.
5. Revisar política de privacidad/retención y protección anti-abuso (ej. Turnstile + límite de solicitudes por IP en infraestructura). La comprobación honeypot incluida es básica y **no reemplaza** protección anti-bots ni limitación de tasa.
6. Tras probar, publicar el PR. Si las variables no están configuradas, el formulario devuelve error claro y **no simula éxito**.

## Privacidad
Se recopilan nombre, email, función, respuestas, institución opcional y consentimiento. Acceso restringido; atender solicitudes de eliminación y definir un plazo de conservación. No usar datos de postulantes para entrenar modelos ni compartirlos con clubes sin consentimiento específico.
