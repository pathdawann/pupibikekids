import { supabase } from '../../lib/supabase.js';
import nodemailer from 'nodemailer';

export async function GET({ request }) {
  // 1. Protección de seguridad
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response('No autorizado', { status: 401 });
  }

  const fechaActual = new Date();
  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesActualStr = `${mesesNombres[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;

  // 2. Extraer alumnos activos y pagos aprobados del mes
  const { data: alumnos } = await supabase.from('alumnos').select('*').neq('estatus', 'inactivo');
  const { data: pagos } = await supabase.from('pagos').select('*').eq('mes_correspondiente', mesActualStr).eq('estado', 'aprobado');

  // 3. Cruzar datos para encontrar morosos
  const morosos = alumnos.filter(alumno => !pagos.find(p => p.alumno_id === alumno.id));
  const emailsDestino = morosos.map(a => a.email).filter(Boolean);

  if (emailsDestino.length === 0) return new Response('Todos al día, no hay nada que probar', { status: 200 });

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
  try {
    await transporter.sendMail({
      from: '"Sistema PupiBike (Modo Prueba)" <pathdawann@gmail.com>',
      to: import.meta.env.EMAIL_USER, // El correo te llegará a ti misma
      subject: `[PRUEBA] Recordatorios a enviar - ${mesActualStr} 🚴‍♂️`,
      text: `Hola Patricia,\n\nEl sistema automatizado está funcionando correctamente en MODO PRUEBA.\n\nSi esto fuera un envío real, los siguientes ${emailsDestino.length} alumnos habrían recibido el recordatorio de cobro:\n\n${listaNombres}\n\n¡La conexión con Nodemailer está configurada con éxito!`
    });

    return new Response(`Modo prueba: Reporte enviado a ti misma con ${emailsDestino.length} pendientes.`, { status: 200 });
  } catch (error) {
    console.error("Error enviando correos:", error);
    return new Response('Error al enviar correos de prueba', { status: 500 });
  }
}