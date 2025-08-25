-- BeeGood App Database Schema
-- Migration: 001_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_since TIMESTAMPTZ,
    hp_balance INTEGER DEFAULT 0,
    hp_daily_grant_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HP Ledger table
CREATE TABLE hp_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('rewarded_video', 'refresh_quote', 'iap_purchase', 'admin_adjust', 'daily_bonus', 'premium_unlimited', 'refund')),
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('stripe')),
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'past_due')),
    current_period_end TIMESTAMPTZ NOT NULL,
    price_id TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('subscription', 'iap_points', 'ad')),
    gross_cents INTEGER NOT NULL,
    fee_cents INTEGER NOT NULL,
    net_cents INTEGER NOT NULL,
    provider TEXT NOT NULL,
    provider_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Charity payouts table
CREATE TABLE charity_payouts (
    id BIGSERIAL PRIMARY KEY,
    month DATE NOT NULL UNIQUE,
    net_cents INTEGER NOT NULL,
    charity_share_cents INTEGER NOT NULL,
    tx_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_hp_ledger_user_id ON hp_ledger(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX idx_hp_ledger_created_at ON hp_ledger(created_at);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- HP Ledger: users can only see their own ledger entries
CREATE POLICY "Users can view own hp ledger" ON hp_ledger
    FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Payments: users can only see their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Charity payouts: public read access
CREATE POLICY "Anyone can view charity payouts" ON charity_payouts
    FOR SELECT USING (true);

-- Functions for HP management
CREATE OR REPLACE FUNCTION update_hp_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update HP balance when ledger changes
    UPDATE profiles 
    SET hp_balance = (
        SELECT COALESCE(SUM(delta), 0) 
        FROM hp_ledger 
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update HP balance
CREATE TRIGGER hp_balance_update
    AFTER INSERT OR UPDATE OR DELETE ON hp_ledger
    FOR EACH ROW
    EXECUTE FUNCTION update_hp_balance();

-- Function to check if user can refresh quote
CREATE OR REPLACE FUNCTION can_refresh_quote(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile RECORD;
BEGIN
    SELECT is_premium, hp_balance INTO user_profile
    FROM profiles 
    WHERE id = user_uuid;
    
    -- Premium users can always refresh
    IF user_profile.is_premium THEN
        RETURN TRUE;
    END IF;
    
    -- Non-premium users need at least 10 HP
    RETURN user_profile.hp_balance >= 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's HP balance
CREATE OR REPLACE FUNCTION get_user_hp_balance(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    balance INTEGER;
BEGIN
    SELECT hp_balance INTO balance
    FROM profiles 
    WHERE id = user_uuid;
    
    RETURN COALESCE(balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
