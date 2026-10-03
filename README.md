# NodoScouting · Landing institucional

Sitio estático independiente: no conecta con Supabase, no incorpora formularios ni cookies, no modifica la app.

## Publicación con Vercel

1. Descomprimí este ZIP (el contenido debe mantener `index.html` y la carpeta `assets/`).
2. Creá un repositorio **nuevo** en GitHub, por ejemplo `nodoscouting-landing`, y subí `index.html` y `assets/` a la raíz. No lo mezcles con el repositorio de producción de la app.
3. En [vercel.com/new](https://vercel.com/new), importá ese repositorio como un proyecto **nuevo**. Framework preset: `Other`; build command: vacío; output directory: vacío / raíz del proyecto. Publicá y verificá primero el dominio provisional `*.vercel.app`.
4. En el nuevo proyecto Vercel, abrí Settings → Domains y agregá `nodoscouting.com` y `www.nodoscouting.com`. Vercel indicará los valores DNS vigentes que hay que usar.
5. En Cloudflare → DNS, **agregá únicamente** los registros A/CNAME que Vercel muestre para la web. No modifiques los MX, TXT de SPF, DKIM, DMARC ni el TXT de verificación Zoho. Si el CNAME web usa Cloudflare Proxy, seguí las indicaciones de Vercel de verificación/SSL y probá DNS-only si la validación lo requiere.
6. Configurá el dominio principal en Vercel y redireccioná `www` al dominio raíz (o viceversa, según prefieras).
7. Probá sitio en escritorio y móvil; abrí los botones de correo; confirmá que Zoho siga enviando y recibiendo.

## Contenido
- Logo original del usuario, recortado sobre fondo oscuro.
- Mensajes de producto en **desarrollo y validación** (sin promesas de disponibilidad ni testimonios ficticios).
- Correo de contacto `guido@nodoscouting.com` mediante enlace mailto, sin recolectar datos en web.

## Antes de publicar
- Revisá el texto institucional y la denominación de marca.
- Confirmá que el correo funciona, y si más adelante conectás otros servicios de email, mantené la autenticación DNS coordinada.
