-- Local Hero App Database Schema
-- Migration: 002_local_hero_schema.sql

-- Drop existing tables that are not needed for Local Hero
DROP TABLE IF EXISTS hp_ledger CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS charity_payouts CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS update_hp_balance() CASCADE;
DROP FUNCTION IF EXISTS can_refresh_quote(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_hp_balance(UUID) CASCADE;

-- Update profiles table for Local Hero
ALTER TABLE profiles DROP COLUMN IF EXISTS is_premium;
ALTER TABLE profiles DROP COLUMN IF EXISTS premium_since;
ALTER TABLE profiles DROP COLUMN IF EXISTS hp_balance;
ALTER TABLE profiles DROP COLUMN IF EXISTS hp_daily_grant_used;

-- Add Local Hero specific columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community TEXT DEFAULT 'Melstone, MT';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS karma_points INTEGER DEFAULT 0;

-- Update display_name to full_name if it exists
UPDATE profiles SET full_name = display_name WHERE display_name IS NOT NULL;
ALTER TABLE profiles DROP COLUMN IF EXISTS display_name;

-- Make full_name required
ALTER TABLE profiles ALTER COLUMN full_name SET NOT NULL;

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
    id BIGSERIAL PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, friend_id)
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    when_text TEXT,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'friends')) DEFAULT 'public',
    community TEXT NOT NULL DEFAULT 'Melstone, MT',
    status TEXT NOT NULL CHECK (status IN ('open', 'matched', 'done', 'cancelled')) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    helper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('offer_received', 'offer_accepted', 'offer_declined', 'new_message', 'request_matched')),
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push tokens table for Expo notifications
CREATE TABLE IF NOT EXISTS push_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friends_owner_id ON friends(owner_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_requests_community_status ON requests(community, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_owner_id ON requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_offers_request_id ON offers(request_id);
CREATE INDEX IF NOT EXISTS idx_offers_helper_id ON offers(helper_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Friends: users can see their own friendships and pending requests
CREATE POLICY "Users can view own friendships" ON friends
    FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests" ON friends
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own friendship requests" ON friends
    FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = friend_id);

-- Requests: visibility rules based on PRD
CREATE POLICY "Users can create own requests" ON requests
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can read public requests in same community" ON requests
    FOR SELECT USING (
        visibility = 'public' AND 
        community = (SELECT community FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can read friend requests" ON requests
    FOR SELECT USING (
        visibility = 'friends' AND 
        EXISTS (
            SELECT 1 FROM friends 
            WHERE (owner_id = auth.uid() AND friend_id = requests.owner_id) OR
                  (friend_id = auth.uid() AND owner_id = requests.owner_id)
        )
    );

CREATE POLICY "Users can read own requests" ON requests
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update own requests" ON requests
    FOR UPDATE USING (auth.uid() = owner_id);

-- Offers: visible to request owner and offer helper
CREATE POLICY "Users can create offers on visible requests" ON offers
    FOR INSERT WITH CHECK (
        auth.uid() = helper_id AND
        EXISTS (
            SELECT 1 FROM requests r
            WHERE r.id = request_id AND
                  (r.visibility = 'public' OR 
                   (r.visibility = 'friends' AND 
                    EXISTS (
                        SELECT 1 FROM friends f
                        WHERE (f.owner_id = auth.uid() AND f.friend_id = r.owner_id) OR
                              (f.friend_id = auth.uid() AND f.owner_id = r.owner_id)
                    )
                  ))
        )
    );

CREATE POLICY "Users can view offers on their requests" ON offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM requests r
            WHERE r.id = request_id AND r.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own offers" ON offers
    FOR SELECT USING (auth.uid() = helper_id);

CREATE POLICY "Users can update their own offers" ON offers
    FOR UPDATE USING (auth.uid() = helper_id);

-- Messages: visible to request participants
CREATE POLICY "Users can send messages to requests they can see" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM requests r
            WHERE r.id = request_id AND
                  (r.owner_id = auth.uid() OR
                   EXISTS (
                       SELECT 1 FROM offers o
                       WHERE o.request_id = request_id AND o.helper_id = auth.uid()
                   ))
        )
    );

CREATE POLICY "Users can read messages in requests they participate in" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM requests r
            WHERE r.id = request_id AND r.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM offers o
            WHERE o.request_id = request_id AND o.helper_id = auth.uid()
        )
    );

-- Notifications: users can only see their own
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Push tokens: users can only manage their own
CREATE POLICY "Users can manage own push tokens" ON push_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Helper functions for Local Hero

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION is_friend(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM friends 
        WHERE ((owner_id = user_a AND friend_id = user_b) OR
               (owner_id = user_b AND friend_id = user_a)) AND
              status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is participant in request
CREATE OR REPLACE FUNCTION is_request_participant(request_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM requests r
        WHERE r.id = request_uuid AND r.owner_id = user_uuid
    ) OR EXISTS (
        SELECT 1 FROM offers o
        WHERE o.request_id = request_uuid AND o.helper_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a request
CREATE OR REPLACE FUNCTION create_request(
    p_body TEXT,
    p_when_text TEXT DEFAULT NULL,
    p_visibility TEXT DEFAULT 'public'
)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
    user_community TEXT;
BEGIN
    -- Get user's community
    SELECT community INTO user_community
    FROM profiles
    WHERE id = auth.uid();
    
    -- Create the request
    INSERT INTO requests (owner_id, body, when_text, visibility, community)
    VALUES (auth.uid(), p_body, p_when_text, p_visibility, user_community)
    RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create an offer
CREATE OR REPLACE FUNCTION create_offer(
    p_request_id UUID,
    p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    offer_id UUID;
BEGIN
    -- Verify user can see this request
    IF NOT EXISTS (
        SELECT 1 FROM requests r
        WHERE r.id = p_request_id AND
              (r.visibility = 'public' OR 
               (r.visibility = 'friends' AND is_friend(auth.uid(), r.owner_id)))
    ) THEN
        RAISE EXCEPTION 'Cannot see this request';
    END IF;
    
    -- Create the offer
    INSERT INTO offers (request_id, helper_id, message)
    VALUES (p_request_id, auth.uid(), p_message)
    RETURNING id INTO offer_id;
    
    -- Create notification for request owner
    INSERT INTO notifications (user_id, type, data)
    VALUES (
        (SELECT owner_id FROM requests WHERE id = p_request_id),
        'offer_received',
        jsonb_build_object('offer_id', offer_id, 'request_id', p_request_id)
    );
    
    RETURN offer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept an offer
CREATE OR REPLACE FUNCTION accept_offer(p_offer_id UUID)
RETURNS VOID AS $$
DECLARE
    request_uuid UUID;
    helper_uuid UUID;
BEGIN
    -- Get request and helper info
    SELECT o.request_id, o.helper_id INTO request_uuid, helper_uuid
    FROM offers o
    WHERE o.id = p_offer_id;
    
    -- Verify user owns the request
    IF NOT EXISTS (
        SELECT 1 FROM requests r
        WHERE r.id = request_uuid AND r.owner_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Not authorized to accept offers on this request';
    END IF;
    
    -- Update request status to matched
    UPDATE requests 
    SET status = 'matched', updated_at = NOW()
    WHERE id = request_uuid;
    
    -- Accept the selected offer
    UPDATE offers 
    SET status = 'accepted', updated_at = NOW()
    WHERE id = p_offer_id;
    
    -- Decline all other offers on this request
    UPDATE offers 
    SET status = 'declined', updated_at = NOW()
    WHERE request_id = request_uuid AND id != p_offer_id;
    
    -- Create notifications
    INSERT INTO notifications (user_id, type, data)
    VALUES 
        (helper_uuid, 'offer_accepted', jsonb_build_object('request_id', request_uuid)),
        (auth.uid(), 'request_matched', jsonb_build_object('request_id', request_uuid, 'helper_id', helper_uuid));
    
    -- Award karma points
    UPDATE profiles 
    SET karma_points = karma_points + 1
    WHERE id = helper_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark request as done
CREATE OR REPLACE FUNCTION mark_request_done(p_request_id UUID)
RETURNS VOID AS $$
DECLARE
    helper_uuid UUID;
BEGIN
    -- Verify user owns the request
    IF NOT EXISTS (
        SELECT 1 FROM requests r
        WHERE r.id = p_request_id AND r.owner_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Not authorized to mark this request as done';
    END IF;
    
    -- Get the matched helper
    SELECT helper_id INTO helper_uuid
    FROM offers
    WHERE request_id = p_request_id AND status = 'accepted';
    
    -- Update request status
    UPDATE requests 
    SET status = 'done', updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Award karma points to helper
    IF helper_uuid IS NOT NULL THEN
        UPDATE profiles 
        SET karma_points = karma_points + 3
        WHERE id = helper_uuid;
    END IF;
    
    -- Create notification for helper
    IF helper_uuid IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, data)
        VALUES (helper_uuid, 'request_matched', jsonb_build_object('request_id', p_request_id, 'completed', true));
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send a message
CREATE OR REPLACE FUNCTION send_message(
    p_request_id UUID,
    p_body TEXT
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
BEGIN
    -- Verify user is participant in this request
    IF NOT is_request_participant(p_request_id, auth.uid()) THEN
        RAISE EXCEPTION 'Not authorized to send messages to this request';
    END IF;
    
    -- Create the message
    INSERT INTO messages (request_id, sender_id, body)
    VALUES (p_request_id, auth.uid(), p_body)
    RETURNING id INTO message_id;
    
    -- Create notifications for other participants
    INSERT INTO notifications (user_id, type, data)
    SELECT 
        p.id,
        'new_message',
        jsonb_build_object('request_id', p_request_id, 'message_id', message_id)
    FROM profiles p
    WHERE p.id IN (
        SELECT DISTINCT user_id FROM (
            SELECT owner_id as user_id FROM requests WHERE id = p_request_id
            UNION
            SELECT helper_id as user_id FROM offers WHERE request_id = p_request_id
        ) participants
        WHERE user_id != auth.uid()
    );
    
    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request friendship
CREATE OR REPLACE FUNCTION request_friendship(p_addressee_id UUID)
RETURNS BIGINT AS $$
DECLARE
    friendship_id BIGINT;
BEGIN
    -- Cannot request friendship with self
    IF auth.uid() = p_addressee_id THEN
        RAISE EXCEPTION 'Cannot request friendship with yourself';
    END IF;
    
    -- Check if friendship already exists
    IF EXISTS (
        SELECT 1 FROM friends 
        WHERE (owner_id = auth.uid() AND friend_id = p_addressee_id) OR
              (owner_id = p_addressee_id AND friend_id = auth.uid())
    ) THEN
        RAISE EXCEPTION 'Friendship already exists or requested';
    END IF;
    
    -- Create friendship request
    INSERT INTO friends (owner_id, friend_id)
    VALUES (auth.uid(), p_addressee_id)
    RETURNING id INTO friendship_id;
    
    RETURN friendship_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to respond to friendship request
CREATE OR REPLACE FUNCTION respond_friendship(
    p_friend_id UUID,
    p_accept BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    -- Find the friendship request
    IF p_accept THEN
        UPDATE friends 
        SET status = 'accepted'
        WHERE friend_id = auth.uid() AND owner_id = p_friend_id AND status = 'pending';
    ELSE
        UPDATE friends 
        SET status = 'declined'
        WHERE friend_id = auth.uid() AND owner_id = p_friend_id AND status = 'pending';
    END IF;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No pending friendship request found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles table RLS policies for Local Hero
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_tokens_updated_at
    BEFORE UPDATE ON push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
