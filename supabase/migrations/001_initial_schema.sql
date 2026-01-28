-- TradeMind Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    timezone TEXT DEFAULT 'UTC',
    discipline_goal INTEGER DEFAULT 80,
    tilt_alert_settings JSONB DEFAULT '{"consecutiveLosses": 3, "totalTrades": 10, "brokenRules": 2}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading rules table
CREATE TABLE public.rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('risk', 'entry', 'exit', 'timing', 'mindset')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading sessions table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),

    -- Pre-session data
    pre_session JSONB DEFAULT '{}'::jsonb,
    -- Expected structure:
    -- {
    --   "sleepRating": 1-5,
    --   "stressLevel": 1-5,
    --   "focusRating": 1-5,
    --   "wellnessNotes": "text",
    --   "plannedSetups": "text",
    --   "maxTrades": number,
    --   "maxLoss": number,
    --   "rulesConfirmed": boolean
    -- }

    -- Post-session data
    post_session JSONB,
    -- Expected structure:
    -- {
    --   "planFollowedRating": 1-5,
    --   "emotionalControlRating": 1-5,
    --   "whatWentWell": "text",
    --   "whatToImprove": "text",
    --   "tomorrowFocus": "text"
    -- }

    discipline_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades table
CREATE TABLE public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trade_number INTEGER NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'breakeven')),
    pnl DECIMAL(10, 2),
    rules_followed BOOLEAN NOT NULL DEFAULT true,
    broken_rule_ids UUID[] DEFAULT '{}',
    emotion_tag TEXT NOT NULL CHECK (emotion_tag IN ('confident', 'calm', 'fomo', 'revenge', 'fearful', 'frustrated')),
    notes TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Breaks table
CREATE TABLE public.breaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    reason TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_rules_user_id ON public.rules(user_id);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_date ON public.sessions(date);
CREATE INDEX idx_trades_session_id ON public.trades(session_id);
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_breaks_session_id ON public.breaks(session_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Rules: Users can only access their own rules
CREATE POLICY "Users can view own rules" ON public.rules
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rules" ON public.rules
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rules" ON public.rules
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rules" ON public.rules
    FOR DELETE USING (auth.uid() = user_id);

-- Sessions: Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Trades: Users can only access their own trades
CREATE POLICY "Users can view own trades" ON public.trades
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trades
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trades
    FOR DELETE USING (auth.uid() = user_id);

-- Breaks: Users can access breaks for their sessions
CREATE POLICY "Users can view own breaks" ON public.breaks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = breaks.session_id
            AND sessions.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own breaks" ON public.breaks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = session_id
            AND sessions.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own breaks" ON public.breaks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = breaks.session_id
            AND sessions.user_id = auth.uid()
        )
    );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_rules_updated_at
    BEFORE UPDATE ON public.rules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
