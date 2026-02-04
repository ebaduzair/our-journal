-- =============================================
-- SUPABASE SCHEMA FOR LOVE JOURNAL APP
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  partner_id UUID REFERENCES profiles(id),
  couple_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LOVE NOTES TABLE
-- =============================================
CREATE TABLE love_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  hearts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MEMORIES TABLE
-- =============================================
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  caption TEXT,
  couple_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SPECIAL EVENTS TABLE
-- =============================================
CREATE TABLE special_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('anniversary', 'date', 'milestone', 'memory')),
  description TEXT,
  emoji TEXT,
  couple_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SURPRISES TABLE
-- =============================================
CREATE TABLE surprises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_revealed BOOLEAN DEFAULT FALSE,
  planned_for DATE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BUCKET LIST TABLE
-- =============================================
CREATE TABLE bucket_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  emoji TEXT,
  couple_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LOVE REASONS TABLE
-- =============================================
CREATE TABLE love_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  hearts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMPLETED CHALLENGES TABLE
-- =============================================
CREATE TABLE completed_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id TEXT NOT NULL,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  couple_code TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHECK-IN ENTRIES TABLE
-- =============================================
CREATE TABLE check_in_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_string TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  connection_rating INTEGER NOT NULL CHECK (connection_rating >= 1 AND connection_rating <= 5),
  partner_highlight TEXT NOT NULL,
  unresolved_issues TEXT NOT NULL,
  gratitude TEXT NOT NULL,
  next_week_plan TEXT NOT NULL,
  overall_mood INTEGER NOT NULL CHECK (overall_mood >= 1 AND overall_mood <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LOVE LANGUAGE RESULTS TABLE
-- =============================================
CREATE TABLE love_language_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  scores JSONB NOT NULL,
  primary_language TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WORRY ENTRIES TABLE (MINDFUL MOMENTS)
-- =============================================
CREATE TABLE worry_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worry TEXT NOT NULL,
  reframe TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REASSURANCE CARDS TABLE
-- =============================================
CREATE TABLE reassurance_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CALM SESSIONS TABLE
-- =============================================
CREATE TABLE calm_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('breathing', 'grounding', 'affirmation')),
  duration_seconds INTEGER NOT NULL,
  completed_together BOOLEAN DEFAULT FALSE,
  couple_code TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHAT MESSAGES TABLE (REAL-TIME)
-- =============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE surprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_language_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE worry_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reassurance_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE calm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile, and view their partner's
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view partner profile" ON profiles
  FOR SELECT USING (
    couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to update partner_id of someone with the same couple_code (for joining)
CREATE POLICY "Users can update partner_id of couple member" ON profiles
  FOR UPDATE USING (
    couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Generic policy for couple-shared tables
-- Love Notes
CREATE POLICY "Couple can view love notes" ON love_notes
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert love notes" ON love_notes
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update love notes" ON love_notes
  FOR UPDATE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own love notes" ON love_notes
  FOR DELETE USING (author_id = auth.uid());

-- Memories
CREATE POLICY "Couple can view memories" ON memories
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can insert memories" ON memories
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can update memories" ON memories
  FOR UPDATE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can delete memories" ON memories
  FOR DELETE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));

-- Special Events
CREATE POLICY "Couple can view events" ON special_events
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can insert events" ON special_events
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can update events" ON special_events
  FOR UPDATE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can delete events" ON special_events
  FOR DELETE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));

-- Surprises
CREATE POLICY "Couple can view surprises" ON surprises
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert surprises" ON surprises
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Creators can update surprises" ON surprises
  FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Creators can delete surprises" ON surprises
  FOR DELETE USING (created_by = auth.uid());

-- Bucket List
CREATE POLICY "Couple can view bucket list" ON bucket_list_items
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can insert bucket list" ON bucket_list_items
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can update bucket list" ON bucket_list_items
  FOR UPDATE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can delete bucket list" ON bucket_list_items
  FOR DELETE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));

-- Love Reasons
CREATE POLICY "Couple can view love reasons" ON love_reasons
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert love reasons" ON love_reasons
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update love reasons" ON love_reasons
  FOR UPDATE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own love reasons" ON love_reasons
  FOR DELETE USING (author_id = auth.uid());

-- Completed Challenges
CREATE POLICY "Couple can view challenges" ON completed_challenges
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can insert challenges" ON completed_challenges
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can delete challenges" ON completed_challenges
  FOR DELETE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));

-- Check-in Entries
CREATE POLICY "Couple can view check-ins" ON check_in_entries
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert check-ins" ON check_in_entries
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own check-ins" ON check_in_entries
  FOR UPDATE USING (author_id = auth.uid());

-- Love Language Results
CREATE POLICY "Couple can view quiz results" ON love_language_results
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert quiz results" ON love_language_results
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own quiz results" ON love_language_results
  FOR UPDATE USING (user_id = auth.uid());

-- Worry Entries
CREATE POLICY "Couple can view worries" ON worry_entries
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert worries" ON worry_entries
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own worries" ON worry_entries
  FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Users can delete own worries" ON worry_entries
  FOR DELETE USING (author_id = auth.uid());

-- Reassurance Cards
CREATE POLICY "Couple can view reassurances" ON reassurance_cards
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert reassurances" ON reassurance_cards
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own reassurances" ON reassurance_cards
  FOR DELETE USING (author_id = auth.uid());

-- Calm Sessions
CREATE POLICY "Couple can view calm sessions" ON calm_sessions
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can insert calm sessions" ON calm_sessions
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));

-- Chat Messages
CREATE POLICY "Couple can view messages" ON chat_messages
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update message read status" ON chat_messages
  FOR UPDATE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));

-- =============================================
-- ENABLE REALTIME FOR CHAT
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE love_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE memories;

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_love_notes_couple ON love_notes(couple_code);
CREATE INDEX idx_memories_couple ON memories(couple_code);
CREATE INDEX idx_chat_messages_couple ON chat_messages(couple_code);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX idx_profiles_couple ON profiles(couple_code);

-- =============================================
-- FOOD LOGS TABLE
-- =============================================
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items TEXT NOT NULL,
  notes TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  logged_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Couple can view food logs" ON food_logs
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert food logs" ON food_logs
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own food logs" ON food_logs
  FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Users can delete own food logs" ON food_logs
  FOR DELETE USING (author_id = auth.uid());

-- Index for performance
CREATE INDEX idx_food_logs_couple ON food_logs(couple_code);
CREATE INDEX idx_food_logs_date ON food_logs(logged_at DESC);
