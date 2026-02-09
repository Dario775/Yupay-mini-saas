-- =============================================
-- Platform Settings Table
-- =============================================
-- This table stores global configuration for the platform (e.g., AI prompt)

CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to do everything
CREATE POLICY "Admins have full access to settings"
    ON platform_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow everyone to read settings (required for Edge Functions/Support Chat)
CREATE POLICY "Everyone can read settings"
    ON platform_settings
    FOR SELECT
    USING (true);

-- Insert initial AI Support Prompt
INSERT INTO platform_settings (key, value)
VALUES (
    'ai_support_prompt',
    'Eres el Asistente Virtual de YUPAY, una plataforma de mercado hiper-local para Argentina. Tu objetivo es ayudar a comercios y clientes a conectar. **Información de Planes (Precios en ARS):** - Plan Gratis: $0. - Plan Básico: $29,000 ARS/mes. - Plan Pro: $79,000 ARS/mes. - Plan Empresarial: Consultar. **Reglas:** 1. Identidad: Asistente de YUPAY. 2. Moneda: PESOS ARGENTINOS (ARS). 3. Tono: Amigable y usa emojis. 4. Acción: Sugiere "Crear Cuenta". 5. Dudas: soporte@yupay.app.'
)
ON CONFLICT (key) DO NOTHING;
