import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export const prerender = false; 

export async function GET({ request }) {
  // 1. SEGURIDAD COMENTADA (Temporalmente para hacer la prueba)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
  //   return new Response(JSON.stringify({ error: 'No autorizado' }), { 
  //     status: 401,
  //     headers: { 'Content-Type': 'application/json' }
  //   });
  // }

  // 2. CONEXIÓN CON LLAVE MAESTRA (Salta el escudo de seguridad)
  const supabaseAdmin = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_KEY
  );

  const fechaActual = new Date();
  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesActualStr = `${mesesNombres[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;

  try {
    // Usamos supabaseAdmin para traer a TODOS los alumnos sin bloqueos
    const { data: alumnosDB, error: errorAlumnos } = await supabaseAdmin.from('alumnos').select('*');
    if (errorAlumnos) throw errorAlumnos;
    
    // Filtramos los inactivos manualmente
    const alumnos = alumnosDB.filter(a => (a.estatus || 'activo').toLowerCase() !== 'inactivo');

    const { data: pagos, error: errorPagos } = await supabaseAdmin.from('pagos').select('*').eq('mes_correspondiente', mesActualStr).eq('estado', 'aprobado');
    if (errorPagos) throw errorPagos;

    // Cruzar datos para encontrar morosos
    const morosos = alumnos.filter(alumno => !pagos.find(p => p.alumno_id === alumno.id));
    const emailsDestino = morosos.map(a => (a.email || '').trim()).filter(Boolean);

    if (emailsDestino.length === 0) {
      return new Response(JSON.stringify({ message: 'Todos al día, no hay nada que probar' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const listaNombres = morosos.map(a => `- ${a.nombre} (${a.email || 'Sin correo'})`).join('\n');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.EMAIL_USER,
        pass: import.meta.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: '"Sistema PupiBike (Modo Prueba)" <pathdawann@gmail.com>',
      to: import.meta.env.EMAIL_USER, 
      subject: `[PRUEBA] Recordatorios a enviar - ${mesActualStr} 🚴‍♂️`,
      text: `Hola Patricia,\n\nEl sistema automatizado está funcionando correctamente en MODO PRUEBA.\n\nLos siguientes ${emailsDestino.length} alumnos habrían recibido el recordatorio de cobro:\n\n${listaNombres}`
    });

    return new Response(JSON.stringify({ message: `Modo prueba: Reporte enviado a ti misma con ${emailsDestino.length} pendientes.` }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error en cron:", error);
    return new Response(JSON.stringify({ error: 'Error interno', details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}