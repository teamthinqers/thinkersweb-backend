-- Create dots table
CREATE TABLE IF NOT EXISTS dots (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  summary TEXT NOT NULL,
  anchor TEXT NOT NULL,
  pulse TEXT NOT NULL,
  wheel_id INTEGER REFERENCES wheels(id),
  source_type TEXT NOT NULL,
  capture_mode TEXT NOT NULL,
  position_x INTEGER DEFAULT 0 NOT NULL,
  position_y INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create wheels table  
CREATE TABLE IF NOT EXISTS wheels (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  heading TEXT,
  goals TEXT,
  purpose TEXT,
  timeline TEXT,
  category TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#EA580C',
  chakra_id INTEGER REFERENCES wheels(id),
  position_x INTEGER DEFAULT 0 NOT NULL,
  position_y INTEGER DEFAULT 0 NOT NULL,
  radius INTEGER DEFAULT 120 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create dot_voice_recordings table
CREATE TABLE IF NOT EXISTS dot_voice_recordings (
  id SERIAL PRIMARY KEY,
  dot_id INTEGER NOT NULL REFERENCES dots(id),
  layer TEXT NOT NULL,
  voice_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
