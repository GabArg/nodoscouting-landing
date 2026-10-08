// Vercel serverless function. Store credentials only in Vercel environment variables.
const MAX_BODY = 7000;
const allowed = {
  rol: ['Director técnico','Ayudante de campo','Analista de rendimiento','Scout','Integrante de cuerpo técnico','Otro'],
  prioridad: ['Sistema y estructura táctica','Fase ofensiva','Fase defensiva','Transiciones y pelota parada','Depende del rival'],
  partidos: ['1 a 3','4 o 5','6 a 10','Depende del contexto'],
  formato: ['Resumen ejecutivo','Informe detallado con gráficos','Datos y observaciones editables','Combinación de formatos'],
  demora: ['Buscar y organizar datos','Revisar partidos y detectar patrones','Comparar equipos o jugadores','Redactar y presentar informes','Coordinar el trabajo del equipo'],
};
function str(v,max){return typeof v==='string' ? v.trim().slice(0,max) : '';}
function fail(res,code,message){return res.status(code).json({ok:false,message});}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Allow','POST');
  if(req.method!=='POST')return fail(res,405,'Método no permitido.');
  const size=Number(req.headers['content-length']||0);
  if(size>MAX_BODY)return fail(res,413,'Solicitud demasiado extensa.');
  const origin=req.headers.origin;
  const hostname=req.headers.host;
  if(origin){try{if(new URL(origin).host!==hostname)return fail(res,403,'Origen no permitido.');}catch{return fail(res,403,'Origen no permitido.');}}
  const data=req.body && typeof req.body==='object' ? req.body : {};
  if(data.website) return res.status(200).json({ok:true});
  // Cloudflare Turnstile must be verified server-side before accepting any application.
  if(!process.env.TURNSTILE_SECRET_KEY)return fail(res,503,'Formulario temporalmente no disponible.');
  const token=str(data.turnstileToken,2048);
  if(!token)return fail(res,400,'Completá la verificación de seguridad.');
  try {
    const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({secret:process.env.TURNSTILE_SECRET_KEY,response:token}),
      signal:AbortSignal.timeout(5000)
    });
    const result=await verification.json();
    if(!result.success)return fail(res,403,'No pudimos validar la verificación de seguridad. Intentá nuevamente.');
  } catch {return fail(res,503,'No pudimos completar la verificación de seguridad.');}
  const name=str(data.nombre,100), email=str(data.email,180).toLowerCase();
  const club=str(data.institucion,120), necesidad=str(data.necesidad,1000);
  if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return fail(res,400,'Revisá el nombre y el email.');
  for(const [k,options] of Object.entries(allowed)){if(!options.includes(data[k]))return fail(res,400,'Completá todas las respuestas obligatorias.');}
  if(data.consentimiento!==true)return fail(res,400,'Necesitamos tu consentimiento para procesar la solicitud.');
  if(!process.env.PILOT_SUPABASE_URL || !process.env.PILOT_SUPABASE_SERVICE_ROLE_KEY)return fail(res,503,'El formulario todavía no está habilitado. Probá más tarde.');
  const payload={nombre:name,email,rol:data.rol,institucion:club||null,prioridad:data.prioridad,partidos:data.partidos,formato:data.formato,demora:data.demora,necesidad:necesidad||null,origen:'landing',consentimiento_at:new Date().toISOString()};
  try{
    const response=await fetch(process.env.PILOT_SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/pilot_applications',{
      method:'POST',headers:{'apikey':process.env.PILOT_SUPABASE_SERVICE_ROLE_KEY,'Authorization':'Bearer '+process.env.PILOT_SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(payload),signal:AbortSignal.timeout(8000)
    });
    if(!response.ok){console.error('Pilot insert failed',response.status);return fail(res,503,'No pudimos registrar la solicitud. Intentá de nuevo.');}
    // Optional server-side email notification (Resend). Failure never invalidates saved applications.
    if(process.env.RESEND_API_KEY && process.env.PILOT_NOTIFY_EMAIL && process.env.PILOT_FROM_EMAIL){
      try{const notifyResponse=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.PILOT_FROM_EMAIL,to:[process.env.PILOT_NOTIFY_EMAIL],subject:'Nueva postulación NodoScouting: '+name,text:'Nueva solicitud registrada en la base de postulaciones.\nNombre: '+name+'\nEmail: '+email+'\nFunción: '+data.rol+'\nInstitución: '+club}) ,signal:AbortSignal.timeout(5000)});if(!notifyResponse.ok)console.error('Pilot notification rejected',notifyResponse.status);}
      catch(err){console.error('Pilot notification failure',err?.name);}
    }
    return res.status(201).json({ok:true,message:'¡Gracias! Recibimos tu solicitud. Te contactaremos para conversar sobre el piloto.'});
  }catch(e){console.error('Pilot submission failed',e?.name);return fail(res,503,'Hubo un problema de conexión. Intentá nuevamente.');}
}
