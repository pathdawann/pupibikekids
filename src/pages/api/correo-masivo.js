import nodemailer from 'nodemailer';
import { supabaseServer } from '../../lib/supabase-server.js';
import { esUsuarioAutorizado } from '../../utils/seguridad.js';

export const prerender = false;

export async function POST(context) {
  try {
    // 1. Verificación de Seguridad (Autenticación + Autorización)
    const supabase = supabaseServer(context);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !esUsuarioAutorizado(user.email)) {
      return new Response(JSON.stringify({ error: 'Acceso denegado. Se requiere nivel de administrador.' }), { status: 403 });
    }

    const body = await context.request.json();
    const { subject, message, bccList, attachment } = body;

    if (!bccList || bccList.length === 0) {
      return new Response(JSON.stringify({ error: 'No hay destinatarios' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.EMAIL_USER,
        pass: import.meta.env.EMAIL_PASS
      }
    });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #09090b; color: #ffffff; border-radius: 10px; overflow: hidden; border: 2px solid #a3e635;">
        <div style="background-color: #000000; padding: 20px; text-align: center; border-bottom: 4px solid #a3e635;">
          <h1 style="margin: 0; color: #ffffff; font-style: italic; font-weight: 900; font-size: 28px;">PUPIBIKE <span style="color: #a3e635;">KIDS</span></h1>
        </div>
        <div style="padding: 30px; background-color: #18181b;">
          <h2 style="color: #a3e635; font-style: italic; text-transform: uppercase; margin-top: 0;">Novedades de la Academia</h2>
          <div style="font-size: 16px; line-height: 1.6; color: #e4e4e7; white-space: pre-wrap; margin-top: 20px;">${message}</div>
        </div>
        <div style="background-color: #000000; padding: 15px; text-align: center; border-top: 1px solid #27272a;">
          <p style="margin: 0; color: #71717a; font-size: 12px;">El equipo de Pupi Bike Kids 🚲</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Academia PupiBike Kids" <${import.meta.env.EMAIL_USER}>`,
      to: import.meta.env.EMAIL_USER, 
      bcc: bccList, 
      replyTo: "pupibikeweb@gmail.com",
      subject: subject || "Novedades de Pupi Bike Kids",
      html: htmlBody
    };

    if (attachment) {
      mailOptions.attachments = [{
        filename: attachment.filename,
        content: attachment.content,
        encoding: 'base64'
      }];
    }

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Error en envío masivo:", error);
    return new Response(JSON.stringify({ error: 'Error enviando correo' }), { status: 500 });
  }
}