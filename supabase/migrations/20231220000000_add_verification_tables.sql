-- ID Verification System
-- Supports document verification and face recognition

-- Verification sessions table
CREATE TABLE IF NOT EXISTS verification_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('id_card', 'face_recognition', 'full')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'expired')),
  provider TEXT, -- e.g., 'veriff', 'onfido', 'manual'
  provider_session_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ID documents table
CREATE TABLE IF NOT EXISTS id_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'drivers_license', 'national_id', 'residence_permit')),
  document_number TEXT,
  country_code TEXT NOT NULL,
  front_image_url TEXT,
  back_image_url TEXT,
  selfie_with_id_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  extracted_data JSONB DEFAULT '{}', -- OCR extracted data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Face recognition data
CREATE TABLE IF NOT EXISTS face_recognition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE SET NULL,
  face_data TEXT, -- Encrypted biometric template
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'disabled')),
  confidence_score DECIMAL(5,4), -- e.g., 0.9876
  enrolled_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  verification_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verification attempts/logs
CREATE TABLE IF NOT EXISTS verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_session_id UUID REFERENCES verification_sessions(id) ON DELETE CASCADE,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('id_upload', 'selfie_capture', 'face_scan', 'document_verification')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'error')),
  error_code TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add verification status to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS face_recognition_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_level TEXT DEFAULT 'none' CHECK (verification_level IN ('none', 'basic', 'standard', 'enhanced'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_sessions_user_id ON verification_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_status ON verification_sessions(status);
CREATE INDEX IF NOT EXISTS idx_id_documents_user_id ON id_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_id_documents_status ON id_documents(status);
CREATE INDEX IF NOT EXISTS idx_face_recognition_user_id ON face_recognition(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_user_id ON verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_session_id ON verification_attempts(verification_session_id);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verification_sessions_updated_at
  BEFORE UPDATE ON verification_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_updated_at();

CREATE TRIGGER id_documents_updated_at
  BEFORE UPDATE ON id_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_updated_at();

CREATE TRIGGER face_recognition_updated_at
  BEFORE UPDATE ON face_recognition
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_updated_at();

-- RLS Policies
ALTER TABLE verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_attempts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification data
CREATE POLICY "Users can view own verification sessions"
  ON verification_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification sessions"
  ON verification_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification sessions"
  ON verification_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ID documents"
  ON id_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ID documents"
  ON id_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ID documents"
  ON id_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own face recognition data"
  ON face_recognition FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own face recognition data"
  ON face_recognition FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own face recognition data"
  ON face_recognition FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own verification attempts"
  ON verification_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification attempts"
  ON verification_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Admin policies commented out until role column is added to users table
-- Uncomment these when you add role management to your app

-- CREATE POLICY "Admins can view all verifications"
--   ON verification_sessions FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );

-- CREATE POLICY "Admins can view all ID documents"
--   ON id_documents FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );

-- CREATE POLICY "Admins can update ID documents"
--   ON id_documents FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );

