-- Update RLS policy to require authentication for INSERT
DROP POLICY IF EXISTS "Anyone can insert threats" ON public.threats;

CREATE POLICY "Authenticated users can insert threats"
ON public.threats
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Note: We keep the threats table without SELECT policies since
-- access is controlled through the secure get-threats edge function