-- Remove the public read policy that exposes sensitive user data
DROP POLICY IF EXISTS "Anyone can read threats" ON public.threats;

-- Keep the insert policy for now as the extension needs it
-- But we should implement authentication in the future

-- Add a comment to document this security fix
COMMENT ON TABLE public.threats IS 'Contains threat analysis data. Public read access removed to protect user privacy (IP addresses, browsing history). Future: implement user authentication and user-specific access.';