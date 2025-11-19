-- Add all new fields for enterprise features to threats table (skip existing columns)

-- Behavioral AI Layer fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS behavior_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS behavior_issues jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS dom_manipulation_detected boolean DEFAULT false;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS credential_harvesting_detected boolean DEFAULT false;

-- Context-Aware Email Certainty Engine fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS sender_reputation integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS email_authentication_status text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS writing_style_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS spf_pass boolean;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS dkim_pass boolean;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS dmarc_pass boolean;

-- Reverse URL Decomposition Engine fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS url_decomposition_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS subdomain_depth integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS homograph_detected boolean DEFAULT false;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS punycode_detected boolean DEFAULT false;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS url_decomposition jsonb DEFAULT '{}'::jsonb;

-- Social Engineering Pattern Detection fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS social_engineering_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS manipulation_tactics jsonb DEFAULT '[]'::jsonb;

-- AI-Generated Threat Explanation field
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS ai_explanation text;

-- Honeypot Sandbox Engine fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS sandbox_report jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS sandbox_analyzed boolean DEFAULT false;

-- Dark Web Leak Monitoring fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS exposure_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS breach_data jsonb DEFAULT '[]'::jsonb;

-- QR Code Phishing Detection fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS qr_code_detected boolean DEFAULT false;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS qr_destination_url text;

-- Voice Phishing Detection fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS vishing_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS vishing_explanation text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS deepfake_detected boolean DEFAULT false;

-- Adversarial ML Defense Layer fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS adversarial_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS adversarial_issues jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS obfuscation_detected boolean DEFAULT false;

-- Threat Intelligence fields
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS asn text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS isp text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS attack_type text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS threat_intel_sources jsonb DEFAULT '[]'::jsonb;