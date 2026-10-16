-- ========================================================
-- PUPI BIKE KIDS - SCHEMA MAESTRO DE BASE DE DATOS
-- ========================================================

-- 1. TABLA: CONFIGURACIÓN GENERAL (Tasa del dólar)
CREATE TABLE IF NOT EXISTS public.configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA: ALUMNOS (Fichas de atletas y tutores)
CREATE TABLE IF NOT EXISTS public.alumnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cedula TEXT,
  telefono TEXT,
  email TEXT NOT NULL,
  fecha_nacimiento DATE,
  direccion TEXT,
  nivel TEXT DEFAULT 'PRINCIPIANTE',
  tipo_sangre TEXT,
  condicion_especial TEXT DEFAULT 'NINGUNA',
  foto_url TEXT,
  tipos_bici JSONB DEFAULT '[]'::jsonb,
  estatus TEXT DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: PAGOS (Recibos, mensualidades y capture)
CREATE TABLE IF NOT EXISTS public.pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
  metodo_pago TEXT NOT NULL,
  referencia TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  mes_correspondiente TEXT NOT NULL,
  tasa_historica NUMERIC(10,2),
  monto_bs NUMERIC(15,2),
  comprobante_url TEXT,
  estado TEXT DEFAULT 'revision',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: LEADS EVENTOS (Captación de clientes y suscriptores)
CREATE TABLE IF NOT EXISTS public.leads_eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: INSCRIPCIONES CAMBIBARA RACE
CREATE TABLE IF NOT EXISTS public.inscripciones_cambibara (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  cedula TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  genero TEXT NOT NULL,
  categoria TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  estado TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  metodo_pago TEXT NOT NULL,
  referencia TEXT NOT NULL,
  comprobante_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. POLÍTICAS DE ALMACENAMIENTO (STORAGE BUCKETS)
DROP POLICY IF EXISTS "Permitir lectura publica de comprobantes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida solo a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir borrado solo a administradores" ON storage.objects;

CREATE POLICY "Permitir lectura publica de comprobantes"
ON storage.objects FOR SELECT
USING (bucket_id = 'comprobantes-pagos');

CREATE POLICY "Permitir subida solo a usuarios autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comprobantes-pagos');

CREATE POLICY "Permitir borrado solo a administradores"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comprobantes-pagos' 
  AND auth.jwt() ->> 'email' IN ('pathdawann@gmail.com', 'pupibikekids27@gmail.com')
);