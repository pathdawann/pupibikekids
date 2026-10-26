import nodemailer from 'nodemailer';

export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { email, nombre, apellido, categoria, referencia } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Falta el correo' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.EMAIL_USER,
        pass: import.meta.env.EMAIL_PASS
      }
    });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #09090b; color: #ffffff; border-radius: 10px; overflow: hidden; border: 2px solid #22d3ee;">
        <div style="background-color: #000000; padding: 20px; text-align: center; border-bottom: 4px solid #a3e635;">
          <h1 style="margin: 0; color: #ffffff; font-style: italic; font-weight: 900; font-size: 28px;">PUPI<span style="color: #22d3ee;">RACE</span></h1>
          <p style="margin: 5px 0 0; color: #a3e635; font-weight: bold; font-style: italic;">7ma Edición - Estilo Playero 🏖️</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #22d3ee; font-style: italic; text-transform: uppercase;">¡HOLA, ${nombre}!</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #e4e4e7;">
            Tu registro para la competencia ha sido recibido con éxito en nuestro sistema y está en proceso de verificación administrativa por parte de nuestro equipo.
          </p>
          
          <div style="background-color: #18181b; padding: 20px; border-left: 4px solid #db2777; margin: 25px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #db2777; font-style: italic; text-transform: uppercase; font-size: 14px;">Detalles de Inscripción</h3>
            <p style="margin: 8px 0; font-size: 15px;"><strong>Atleta:</strong> ${nombre} ${apellido}</p>
            <p style="margin: 8px 0; font-size: 15px;"><strong>Categoría:</strong> ${categoria}</p>
            <p style="margin: 8px 0; font-size: 15px;"><strong>Referencia de Pago:</strong> <span style="font-family: monospace; color: #a3e635;">${referencia}</span></p>
          </div>

          <p style="font-size: 16px; color: #e4e4e7;">
            <strong>📅 Fecha del evento:</strong> Domingo 6 de Diciembre<br>
            <strong>📍 Sede:</strong> Nos vemos en la Playa
          </p>
          <p style="font-size: 16px; color: #e4e4e7; margin-top: 20px;">¡Prepárate para darlo todo en la pista y crear grandes historias!</p>
        </div>
        <div style="background-color: #000000; padding: 15px; text-align: center; border-top: 1px solid #27272a;">
          <p style="margin: 0; color: #71717a; font-size: 12px;">El equipo de Pupi Bike Kids 🚲</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Academia PupiBike Kids" <${import.meta.env.EMAIL_USER}>`,
      to: email,
      replyTo: "pupibikeweb@gmail.com",
      subject: "¡Inscripción Exitosa! - Pupi Race 7ma Edición 🏖️🏆",
      html: htmlBody
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Error en API de correo:", error);
    return new Response(JSON.stringify({ error: 'Error enviando correo' }), { status: 500 });
  }
}