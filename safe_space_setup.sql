-- Safe Space Feature Database Setup
-- Run this in Supabase SQL Editor

-- Create the safe_space_entries table
CREATE TABLE safe_space_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_code TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('just_listen', 'need_support', 'private')),
  category TEXT CHECK (category IN ('hurt', 'stressed', 'anxious', 'sad', 'frustrated', 'other')),
  reactions TEXT[] DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE safe_space_entries ENABLE ROW LEVEL SECURITY;

-- View: Own entries OR partner's non-private entries
CREATE POLICY "Users can view couple entries"
  ON safe_space_entries FOR SELECT
  USING (
    couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid())
    AND (author_id = auth.uid() OR mode != 'private')
  );

-- Insert: Own entries only
CREATE POLICY "Users can insert own entries"
  ON safe_space_entries FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid())
  );

-- Update: Own entries OR partner's entries (for reactions)
CREATE POLICY "Users can update couple entries"
  ON safe_space_entries FOR UPDATE
  USING (
    couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid())
  );

-- Delete: Own entries only
CREATE POLICY "Users can delete own entries"
  ON safe_space_entries FOR DELETE
  USING (author_id = auth.uid());
