-- Create threats table to store detected phishing attempts
CREATE TABLE public.threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT,
  email_content TEXT,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('high', 'medium', 'low')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  verdict TEXT NOT NULL,
  reason TEXT NOT NULL,
  nlp_score INTEGER NOT NULL,
  nlp_issues JSONB DEFAULT '[]'::jsonb,
  visual_score INTEGER NOT NULL,
  visual_issues JSONB DEFAULT '[]'::jsonb,
  network_score INTEGER NOT NULL,
  network_issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_ip TEXT
);

-- Enable RLS
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert threats (for demo purposes)
CREATE POLICY "Anyone can insert threats" ON public.threats
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read threats (for demo/analytics)
CREATE POLICY "Anyone can read threats" ON public.threats
  FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX idx_threats_created_at ON public.threats(created_at DESC);
CREATE INDEX idx_threats_threat_level ON public.threats(threat_level);

-- Enable realtime for threats table
ALTER PUBLICATION supabase_realtime ADD TABLE public.threats;