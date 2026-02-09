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

-- Insert Telegram Bot Config (Placeholders)
INSERT INTO platform_settings (key, value)
VALUES 
    ('telegram_bot_token', ''),
    ('telegram_chat_id', '')
ON CONFLICT (key) DO NOTHING;
