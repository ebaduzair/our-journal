-- =============================================
-- MISSING TABLES FOR FULL SUPABASE MIGRATION
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- REALITY CHECK ANSWERS TABLE
-- =============================================
CREATE TABLE reality_check_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worry TEXT NOT NULL,
  evidence TEXT,
  likelihood INTEGER CHECK (likelihood >= 1 AND likelihood <= 5),
  worst_case TEXT,
  coping_plan TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reality_check_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can view reality checks" ON reality_check_answers
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert reality checks" ON reality_check_answers
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own reality checks" ON reality_check_answers
  FOR DELETE USING (author_id = auth.uid());

CREATE INDEX idx_reality_checks_couple ON reality_check_answers(couple_code);

-- =============================================
-- CHALLENGE STREAKS TABLE
-- =============================================
CREATE TABLE challenge_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_week TEXT DEFAULT '',
  couple_code TEXT NOT NULL UNIQUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE challenge_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can view streaks" ON challenge_streaks
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can insert streaks" ON challenge_streaks
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can update streaks" ON challenge_streaks
  FOR UPDATE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));

CREATE INDEX idx_challenge_streaks_couple ON challenge_streaks(couple_code);

-- =============================================
-- WEEKLY CHALLENGES TABLE
-- =============================================
CREATE TABLE weekly_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id TEXT NOT NULL,
  week_string TEXT NOT NULL,
  couple_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(couple_code, week_string)
);

ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can view weekly challenges" ON weekly_challenges
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can insert weekly challenges" ON weekly_challenges
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Couple can update weekly challenges" ON weekly_challenges
  FOR UPDATE USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));

CREATE INDEX idx_weekly_challenges_couple ON weekly_challenges(couple_code);
