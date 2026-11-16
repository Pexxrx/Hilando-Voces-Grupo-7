-- ==============================================================================
-- HILANDO VOCES - ESQUEMA OFICIAL DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- Proyecto: Hilando Voces (Grupo 7) · San Juan de Lurigancho (SJL)
-- ==============================================================================

-- 1. Extensión para generación de UUIDs seguros
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla principal de Reportes Ciudadanos
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(20) NOT NULL UNIQUE,
    axis VARCHAR(50) NOT NULL CHECK (axis IN ('alumbrado', 'microbasurales', 'espacios_recreativos')),
    description TEXT NOT NULL,
    photo_before_url TEXT,
    photo_after_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ubigeo VARCHAR(6) NOT NULL DEFAULT '150132',
    reference TEXT,
    wants_to_coordinate BOOLEAN DEFAULT FALSE,
    coordinator_whatsapp VARCHAR(20),
    anti_spam_hash VARCHAR(64),
    status VARCHAR(30) NOT NULL DEFAULT 'recibido' CHECK (status IN ('recibido', 'en_evaluacion', 'faena_programada', 'resuelto')),
    priority_level VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (priority_level IN ('baja', 'media', 'alta')),
    ai_summary TEXT,
    ai_tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 3. Índices de Rendimiento para Búsquedas Rápidas
CREATE INDEX IF NOT EXISTS idx_reports_ticket_code ON public.reports (ticket_code);
CREATE INDEX IF NOT EXISTS idx_reports_anti_spam_hash ON public.reports (anti_spam_hash);
CREATE INDEX IF NOT EXISTS idx_reports_axis ON public.reports (axis);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);

-- 4. Seguridad de Nivel de Fila (Row Level Security - RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura pública de campos de reportes para el mapa comunitario y seguimiento
CREATE POLICY "Permitir lectura publica de reportes"
ON public.reports
FOR SELECT
TO anon, authenticated
USING (true);

-- Política 2: Inserción de reportes por la ciudadanía (anónima)
CREATE POLICY "Permitir insercion publica de reportes"
ON public.reports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política 3: Modificación y gestión completa reservada al Backend (Service Role)
CREATE POLICY "Permitir gestion completa al backend service_role"
ON public.reports
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
