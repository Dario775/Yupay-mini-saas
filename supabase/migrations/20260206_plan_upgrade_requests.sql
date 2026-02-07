-- =============================================
-- Plan Upgrade Requests Table
-- =============================================
-- This table tracks plan upgrade requests with MercadoPago payment integration

CREATE TABLE IF NOT EXISTS plan_upgrade_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    current_plan VARCHAR(50) NOT NULL,
    target_plan VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    mp_preference_id TEXT,
    mp_payment_id TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_user ON plan_upgrade_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status ON plan_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_mp_preference ON plan_upgrade_requests(mp_preference_id);

-- RLS Policies
ALTER TABLE plan_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own upgrade requests
CREATE POLICY "Users can view own upgrade requests"
    ON plan_upgrade_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create upgrade requests
CREATE POLICY "Users can create upgrade requests"
    ON plan_upgrade_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can update (for webhook)
CREATE POLICY "Service can update upgrade requests"
    ON plan_upgrade_requests FOR UPDATE
    USING (true);

-- Admin can view all
CREATE POLICY "Admin can view all upgrade requests"
    ON plan_upgrade_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
