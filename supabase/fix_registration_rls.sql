-- =============================================
-- FIX REGISTRATION RLS POLICIES
-- =============================================

-- 1. Allow Authenticated Users to create their own Subscription
-- Currently missing, which blocks the registration flow
CREATE POLICY "Users can create own subscription" 
ON subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Allow Authenticated Users to update their own Profile
-- (Currently exists, but verification doesn't hurt)
-- DROP POLICY IF EXISTS "Users can update own details" ON profiles;
-- CREATE POLICY "Users can update own details" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Allow Authenticated Users to Insert Stores (Verify)
-- (Already exists in schema.sql: "Owners can insert stores")
