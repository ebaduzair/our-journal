-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Couple can view own expenses"
  ON expenses FOR SELECT
  USING (couple_code = (SELECT couple_code FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Couple can insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    couple_code = (SELECT couple_code FROM profiles WHERE id = auth.uid())
    AND (
      -- Force author_id to be current user
      author_id = auth.uid() 
    )
  );

CREATE POLICY "Couple can update own expenses"
  ON expenses FOR UPDATE
  USING (couple_code = (SELECT couple_code FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Couple can delete own expenses"
  ON expenses FOR DELETE
  USING (couple_code = (SELECT couple_code FROM profiles WHERE id = auth.uid()));

-- Index (for faster queries by couple_code and date)
CREATE INDEX idx_expenses_couple_date ON expenses(couple_code, date);
