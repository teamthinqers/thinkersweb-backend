-- Create WhatsApp OTP Verification table
CREATE TABLE IF NOT EXISTS whatsapp_otp_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  phone_number TEXT NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_otp_user_id ON whatsapp_otp_verifications(user_id);