import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export async function GET({ request }) {
  // 1. Verificamos que Vercel tenga permiso para ejecutar esto
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response('Acceso denegado', { status: 401 });
  }

  try {
    // 2. Consultamos la Tasa BCV oficial
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    const data = await res.json();
    
    if (!data || !data.promedio) {
      throw new Error('No se pudo obtener la tasa de DolarAPI');
    }

    // 3. Conectamos a Supabase con privilegios administrativos
    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.SUPABASE_SERVICE_KEY
    );

    // 4. Guardamos la nueva tasa
    const { error } = await supabase
      .from('configuracion')
      .upsert({ 
        clave: 'tasa_dolar', 
        valor: String(data.promedio), 
        updated_at: new Date() 
      }, { onConflict: 'clave' });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, tasa: data.promedio }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}