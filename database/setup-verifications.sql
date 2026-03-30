-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage all verifications
CREATE POLICY "Admins can manage all verifications" ON verifications
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'admin@golfclub.com'
  );

-- Create policy for users to view their own verifications
CREATE POLICY "Users can view own verifications" ON verifications
  FOR SELECT USING (
    auth.jwt() ->> 'email' = user_email
  );

-- Create policy for users to insert their own verifications
CREATE POLICY "Users can insert own verifications" ON verifications
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = user_email
  );

-- Create indexes for better performance
CREATE INDEX idx_verifications_status ON verifications(status);
CREATE INDEX idx_verifications_user_email ON verifications(user_email);
CREATE INDEX idx_verifications_submitted_at ON verifications(submitted_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_verifications_updated_at 
  BEFORE UPDATE ON verifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
