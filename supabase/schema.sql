-- =============================================
-- YUPAY - Database Schema for Supabase
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (extends Supabase Auth)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'cliente' CHECK (role IN ('admin', 'tienda', 'cliente')),
    avatar TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STORES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    logo TEXT,
    banner TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(2,1) DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    locality VARCHAR(255),
    province VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    cost DECIMAL(10, 2),
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    sku VARCHAR(100),
    category VARCHAR(100),
    images TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    discount INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado')),
    total DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    payment_method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL
);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    plan VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'trial' CHECK (status IN ('activa', 'trial', 'pendiente', 'cancelada', 'vencida', 'limite_alcanzado')),
    price DECIMAL(10, 2) DEFAULT 0,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT TRUE,
    sales_this_month INTEGER DEFAULT 0,
    last_reset_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PLAN CONFIGURATIONS (Global limits)
-- =============================================
CREATE TABLE IF NOT EXISTS plan_configs (
    id VARCHAR(50) PRIMARY KEY, -- 'free', 'basico', 'profesional', 'empresarial'
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_sales_per_month INTEGER DEFAULT -1,
    max_products INTEGER DEFAULT -1,
    max_stores INTEGER DEFAULT 1,
    has_flash_offers BOOLEAN DEFAULT FALSE,
    max_flash_offers_per_month INTEGER DEFAULT 0,
    max_flash_offer_radius INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial plan configs
INSERT INTO plan_configs (id, price, max_sales_per_month, max_products, max_stores, has_flash_offers, max_flash_offers_per_month, max_flash_offer_radius)
VALUES 
('free', 0, 5, 10, 1, false, 0, 0),
('basico', 5000, 50, 100, 1, false, 0, 0),
('profesional', 15000, 500, 1000, 3, true, 2, 5),
('empresarial', 45000, -1, -1, 10, true, -1, 20)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- GLOBAL SETTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS global_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SHIPPING METHODS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS shipping_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    estimated_days VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENT METHODS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('efectivo', 'transferencia', 'mercadopago', 'otro')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FLASH OFFERS TABLE (Ofertas Relámpago)
-- =============================================
CREATE TABLE IF NOT EXISTS flash_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    -- Productos (array de UUIDs)
    product_ids UUID[],
    -- Descuento
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    -- Tiempo
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    duration_hours INTEGER NOT NULL,
    -- Alcance geográfico
    radius_km INTEGER DEFAULT 5,
    -- Límites
    max_redemptions INTEGER,
    current_redemptions INTEGER DEFAULT 0,
    -- Estado
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'expired', 'cancelled')),
    -- Notificaciones
    notifications_sent INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_offers ENABLE ROW LEVEL SECURITY;

-- Plan Configs: Public read, Admin manage
CREATE POLICY "Plan configs are viewable by everyone" ON plan_configs FOR SELECT USING (true);
CREATE POLICY "Only admins can manage plan configs" ON plan_configs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Global Settings: Public read, Admin manage
CREATE POLICY "Global settings are viewable by everyone" ON global_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can manage global settings" ON global_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Profiles: Users see their own profile.
-- Note: Use a separate secure view or function if public data (name/avatar) needs to be exposed globally.
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Allow store owners to view profiles of customers who have active orders with them
CREATE POLICY "Store owners can view customer profiles" ON profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders o
        JOIN stores s ON s.id = o.store_id
        WHERE o.customer_id = profiles.id 
        AND s.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can update own details" ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    (CASE WHEN role IS DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()) THEN false ELSE true END)
);

-- Stores: Public read, owners can modify
CREATE POLICY "Stores are viewable by everyone" ON stores FOR SELECT USING (true);
CREATE POLICY "Owners can insert stores" ON stores FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update stores" ON stores FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete stores" ON stores FOR DELETE USING (auth.uid() = owner_id);

-- Products: Public read, store owners can modify
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Store owners can manage products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
);

-- Orders: Customers and store owners can view their orders
CREATE POLICY "Users can view their orders" ON orders FOR SELECT USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
);
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Store owners can update orders" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
);

-- Subscriptions: Users can view their own
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Flash Offers: Public read (active only), store owners can manage
CREATE POLICY "Active flash offers are viewable by everyone" ON flash_offers FOR SELECT USING (
    status = 'active' OR 
    EXISTS (SELECT 1 FROM stores WHERE stores.id = flash_offers.store_id AND stores.owner_id = auth.uid())
);
CREATE POLICY "Store owners can manage flash offers" ON flash_offers FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = flash_offers.store_id AND stores.owner_id = auth.uid())
);

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        -- SEGURIDAD: Solo permite roles 'tienda' o 'cliente'. 'admin' debe ser asignado manualmente.
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' = 'tienda' THEN 'tienda'
            ELSE 'cliente'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
