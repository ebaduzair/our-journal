-- =============================================
-- GRATITUDE ENTRIES TABLE
-- Run this in Supabase SQL Editor
-- =============================================
CREATE TABLE gratitude_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Couple can view gratitude entries" ON gratitude_entries
  FOR SELECT USING (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert gratitude entries" ON gratitude_entries
  FOR INSERT WITH CHECK (couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own gratitude entries" ON gratitude_entries
  FOR DELETE USING (author_id = auth.uid());

-- Index for performance
CREATE INDEX idx_gratitude_entries_couple ON gratitude_entries(couple_code);
