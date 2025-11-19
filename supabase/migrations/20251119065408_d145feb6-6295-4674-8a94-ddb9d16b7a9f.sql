-- Add new columns to threats table for all enterprise features

-- Behavioral AI Layer
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS behavior_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS behavior_issues jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS dom_manipulation_detected boolean DEFAULT false;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS credential_harvesting_detected boolean DEFAULT false;

-- Context-Aware Email Engine
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS sender_reputation integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS email_authentication_status text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS writing_style_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS spf_pass boolean;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS dkim_pass boolean;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS dmarc_pass boolean;

-- Reverse URL Decomposition
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS url_decomposition_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS subdomain_depth integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS homograph_detected boolean DEFAULT false;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS punycode_detected boolean DEFAULT false;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS url_decomposition jsonb DEFAULT '{}'::jsonb;

-- Social Engineering Detection
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS social_engineering_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS manipulation_tactics jsonb DEFAULT '[]'::jsonb;

-- AI Explanation
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS ai_explanation text;

-- Honeypot Sandbox
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS sandbox_report jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS sandbox_analyzed boolean DEFAULT false;

-- Dark Web Leak Monitoring
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS exposure_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS breach_data jsonb DEFAULT '[]'::jsonb;

-- QR Code Detection
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS qr_code_detected boolean DEFAULT false;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS qr_destination_url text;

-- Voice Phishing
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS vishing_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS deepfake_detected boolean DEFAULT false;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS vishing_explanation text;

-- Adversarial ML Defense
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS adversarial_score integer DEFAULT 0;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS adversarial_issues jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS obfuscation_detected boolean DEFAULT false;

-- Threat Intelligence Enhancement
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS asn text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS isp text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS attack_type text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS threat_intel_sources jsonb DEFAULT '[]'::jsonb;

-- Create organizations table for SOC mode
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  soc_enabled boolean DEFAULT false
);

-- Create user_roles table with proper enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'soc_analyst');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role, organization_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for organizations
CREATE POLICY "Users can view their organization"
ON public.organizations FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT organization_id FROM public.user_roles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage organizations"
ON public.organizations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add organization_id to threats for SOC mode
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Update threats RLS to support organization access
CREATE POLICY "Organization members can view org threats"
ON public.threats FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_roles 
    WHERE user_id = auth.uid()
  )
  OR organization_id IS NULL
);