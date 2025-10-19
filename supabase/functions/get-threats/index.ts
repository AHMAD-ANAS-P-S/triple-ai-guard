import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use service role to read threats data
    const { data: threats, error } = await supabase
      .from('threats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Anonymize sensitive data before returning
    const sanitizedThreats = threats?.map(threat => ({
      ...threat,
      user_ip: threat.user_ip ? '***.***.***.' + threat.user_ip.split('.').pop() : null, // Partially mask IP
    }));

    return new Response(JSON.stringify(sanitizedThreats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const requestId = crypto.randomUUID();
    // Log detailed error server-side
    console.error('Failed to fetch threats:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      requestId
    });

    // Return generic error to client
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch threat data. Please try again later.',
        requestId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});