import { supabase } from '../../lib/supabase.js';
import nodemailer from 'nodemailer';

export const config = {
  // Asegura que este endpoint no intente renderizarse estáticamente
  prerender: false 
};

export async function GET({ request }) {
  // 1. Protección de seguridad
//  const authHeader = request.headers.get('authorization');
//  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
//    return new Response(JSON.stringify({ error: 'No autorizado' }), { 
//      status: 401,
//      headers: { 'Content-Type': 'application/json' }
//    });
//  }

  const fechaActual = new Date();
  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesActualStr = `${mesesNombres[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;

  try {
    // 2. Extraer alumnos activos y pagos aprobados del mes
    const { data: alumnos, error: errorAlumnos } = await supabase.from('alumnos').select('*').neq('estatus', 'inactivo');
    if (errorAlumnos) throw errorAlumnos;

    const { data: pagos, error: errorPagos } = await supabase.from('pagos').select('*').eq('mes_correspondiente', mesActualStr).eq('estado', 'aprobado');
    if (errorPagos) throw errorPagos;

    // 3. Cruzar datos para encontrar morosos
    const morosos = alumnos.filter(alumno => !pagos.find(p => p.alumno_id === alumno.id));
    const emailsDestino = morosos.map(a => a.email).filter(Boolean);

    if (emailsDestino.length === 0) {
      return new Response(JSON.stringify({ message: 'Todos al día, no hay nada que probar' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // --- MODO PRUEBA: Creamos una lista de nombres para que tú la veas ---
    const listaNombres = morosos.map(a => `- ${a.nombre} (${a.email})`).join('\n');

    // 4. Configurar Nodemailer con tu cuenta de Pathdawann
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.EMAIL_USER,
        pass: import.meta.env.EMAIL_PASS
      }
    });

    // 5. Enviar el correo de PRUEBA solo a ti misma
    await transporter.sendMail({
      from: '"Sistema PupiBike (Modo Prueba)" <pathdawann@gmail.com>',
      to: import.meta.env.EMAIL_USER, // El correo te llegará a ti misma
      subject: `[PRUEBA] Recordatorios a enviar - ${mesActualStr} 🚴‍♂️`,
      text: `Hola Patricia,\n\nEl sistema automatizado está funcionando correctamente en MODO PRUEBA.\n\nSi esto fuera un envío real, los siguientes ${emailsDestino.length} alumnos habrían recibido el recordatorio de cobro:\n\n${listaNombres}\n\n¡La conexión con Nodemailer está configurada con éxito!`
    });

    return new Response(JSON.stringify({ message: `Modo prueba: Reporte enviado a ti misma con ${emailsDestino.length} pendientes.` }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error en cron-recordatorios:", error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor', details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}