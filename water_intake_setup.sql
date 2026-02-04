-- Water Intake Feature Database Setup
-- Run this in Supabase SQL Editor

-- Create the water_intake table
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_code TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  glasses INTEGER NOT NULL DEFAULT 0,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one entry per user per day
  UNIQUE(author_id, logged_at)
);

-- Enable RLS
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

-- View: Can view own and partner's water intake
CREATE POLICY "Users can view couple water intake"
  ON water_intake FOR SELECT
  USING (
    couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid())
  );

-- Insert: Own entries only
CREATE POLICY "Users can insert own water intake"
  ON water_intake FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND couple_code IN (SELECT couple_code FROM profiles WHERE id = auth.uid())
  );

-- Update: Own entries only
CREATE POLICY "Users can update own water intake"
  ON water_intake FOR UPDATE
  USING (author_id = auth.uid());

-- Delete: Own entries only
CREATE POLICY "Users can delete own water intake"
  ON water_intake FOR DELETE
  USING (author_id = auth.uid());
