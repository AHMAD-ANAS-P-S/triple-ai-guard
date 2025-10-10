import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ip } = await req.json();
    
    if (!ip) {
      return new Response(
        JSON.stringify({ error: 'IP address required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use HTTPS endpoint to avoid mixed content issues
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      throw new Error(`Geolocation API error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        status: 'success',
        country: data.country_name,
        countryCode: data.country_code,
        lat: data.latitude,
        lon: data.longitude,
        city: data.city,
        region: data.region
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Geolocation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Geolocation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
