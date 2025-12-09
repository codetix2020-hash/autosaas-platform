-- Migration: contentflow-ai
-- Generated: 2025-12-03T19:43:20.176Z
-- Model: claude-3-haiku-20240307
-- Blueprint: ContentFlow AI

CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user" NOT NULL,
  name TEXT NOT NULL,
  brand_voice JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE POLICY "Users manage own agencies" ON agencies FOR ALL USING (auth.uid() = user_id);

CREATE INDEX ON agencies (user_id);

CREATE TABLE agency_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  approval_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON agency_clients (agency_id);

CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES agency_clients NOT NULL,
  scheduled_date DATE NOT NULL,
  platform TEXT NOT NULL,
  content_text TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON content_calendar (client_id);