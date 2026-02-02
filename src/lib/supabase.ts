import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Flag para saber si Supabase está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn(
        '⚠️ Supabase no está configurado. La app funcionará en modo DEMO.',
        '\nPara habilitar la base de datos, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
    );
}

// Crear cliente (con valores vacíos si no está configurado - no crasheará)
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
