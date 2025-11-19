import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Honeypot Sandbox Engine - Deep URL Analysis
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const URLSCAN_API_KEY = Deno.env.get('URLSCAN_API_KEY');
    
    const sandboxReport = {
      url: url,
      analyzed: false,
      malicious: false,
      risk_score: 0,
      behaviors: [] as string[],
      redirects: [] as Array<{ from: string; to: string }>,
      forms_detected: 0,
      scripts_executed: 0,
      cookies_set: 0,
      external_connections: [] as Array<{ url: string; method: string; status: number }>,
      screenshot_url: null as string | null,
      dom_analysis: {} as Record<string, any>,
      timestamp: new Date().toISOString()
    };

    if (!URLSCAN_API_KEY) {
      console.warn('URLSCAN_API_KEY not configured, returning basic analysis');
      return new Response(
        JSON.stringify(sandboxReport),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Submit URL for scanning
      const submitResponse = await fetch('https://urlscan.io/api/v1/scan/', {
        method: 'POST',
        headers: {
          'API-Key': URLSCAN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url, 
          visibility: 'unlisted',
          tags: ['zerophish-ai', 'automated']
        })
      });

      if (submitResponse.ok) {
        const submitData = await submitResponse.json();
        
        // Wait for scan to complete
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Get results
        const resultResponse = await fetch(submitData.api, {
          headers: { 'API-Key': URLSCAN_API_KEY }
        });

        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          
          // Extract comprehensive sandbox data
          sandboxReport.analyzed = true;
          sandboxReport.malicious = resultData.verdicts?.overall?.malicious || false;
          sandboxReport.risk_score = resultData.verdicts?.overall?.score || 0;
          sandboxReport.screenshot_url = resultData.task?.screenshotURL;
          
          // Behavioral analysis
          if (resultData.data?.requests) {
            sandboxReport.external_connections = resultData.data.requests
              .slice(0, 10)
              .map((req: any) => ({
                url: req.request?.request?.url,
                method: req.request?.request?.method,
                status: req.response?.response?.status
              }));
          }

          // Form detection
          if (resultData.data?.console) {
            sandboxReport.forms_detected = resultData.data.console.filter(
              (c: any) => c.message?.includes('form')
            ).length;
          }

          // Script analysis
          if (resultData.lists?.scripts) {
            sandboxReport.scripts_executed = resultData.lists.scripts.length;
            
            // Check for suspicious scripts
            resultData.lists.scripts.forEach((script: string) => {
              if (script.includes('eval') || script.includes('atob') || 
                  script.includes('fromCharCode')) {
                sandboxReport.behaviors.push('Obfuscated JavaScript detected');
              }
            });
          }

          // Cookie analysis
          if (resultData.lists?.cookies) {
            sandboxReport.cookies_set = resultData.lists.cookies.length;
          }

          // Redirect chain analysis
          if (resultData.data?.redirects) {
            sandboxReport.redirects = resultData.data.redirects.map((r: any) => ({
              from: r.request?.request?.url,
              to: r.response?.response?.url
            }));
            
            if (sandboxReport.redirects.length > 3) {
              sandboxReport.behaviors.push('Excessive redirect chain detected');
            }
          }

          // DOM analysis
          sandboxReport.dom_analysis = {
            title: resultData.page?.title,
            domain: resultData.page?.domain,
            ip: resultData.page?.ip,
            asn: resultData.page?.asn,
            country: resultData.page?.country
          };

          // Malicious indicators
          if (resultData.verdicts?.urlscan?.malicious) {
            sandboxReport.behaviors.push('URLScan malicious verdict');
          }
          if (resultData.verdicts?.engines?.malicious > 0) {
            sandboxReport.behaviors.push(`${resultData.verdicts.engines.malicious} security engines flagged as malicious`);
          }
          if (resultData.data?.console?.some((c: any) => c.message?.includes('error'))) {
            sandboxReport.behaviors.push('Console errors detected');
          }
        }
      }
    } catch (error) {
      console.error('URLScan API error:', error);
      sandboxReport.behaviors.push('Sandbox analysis partially failed');
    }

    return new Response(
      JSON.stringify(sandboxReport),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sandbox analyzer error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze URL in sandbox',
        analyzed: false,
        malicious: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
