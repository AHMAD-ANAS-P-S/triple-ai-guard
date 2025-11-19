import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    const { url, threatId } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL required', requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting sandbox analysis for: ${url}`);

    // Fetch the page content
    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'ZerophishAI-Sandbox/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch URL: ${fetchResponse.status}`);
    }

    const htmlContent = await fetchResponse.text();

    // Analyze page for malicious behavior
    const analysis = {
      redirects: [],
      forms: [],
      externalScripts: [],
      suspiciousPatterns: [],
      javascriptBehavior: [],
      iframes: []
    };

    // Detect forms (credential harvesting)
    const formMatches = htmlContent.match(/<form[^>]*>(.*?)<\/form>/gis);
    if (formMatches) {
      for (const form of formMatches) {
        const hasPassword = /type\s*=\s*["']?password["']?/i.test(form);
        const hasEmail = /type\s*=\s*["']?email["']?/i.test(form);
        const action = form.match(/action\s*=\s*["']([^"']+)["']/i)?.[1];
        
        if (hasPassword || hasEmail) {
          analysis.forms.push({
            hasPassword,
            hasEmail,
            action: action || 'none',
            suspicious: !action || !action.startsWith('https://')
          });
        }
      }
    }

    // Detect external scripts
    const scriptMatches = htmlContent.match(/<script[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi);
    if (scriptMatches) {
      for (const script of scriptMatches) {
        const src = script.match(/src\s*=\s*["']([^"']+)["']/i)?.[1];
        if (src && !src.startsWith(new URL(url).origin)) {
          analysis.externalScripts.push(src);
        }
      }
    }

    // Detect iframes
    const iframeMatches = htmlContent.match(/<iframe[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi);
    if (iframeMatches) {
      for (const iframe of iframeMatches) {
        const src = iframe.match(/src\s*=\s*["']([^"']+)["']/i)?.[1];
        if (src) {
          analysis.iframes.push(src);
        }
      }
    }

    // Detect suspicious patterns
    const suspiciousPatterns = [
      { pattern: /document\.write/gi, name: 'document.write detected' },
      { pattern: /eval\(/gi, name: 'eval() usage detected' },
      { pattern: /atob\(/gi, name: 'Base64 decoding detected' },
      { pattern: /fromCharCode/gi, name: 'Character code manipulation' },
      { pattern: /location\.replace/gi, name: 'Location replacement detected' }
    ];

    for (const { pattern, name } of suspiciousPatterns) {
      if (pattern.test(htmlContent)) {
        analysis.suspiciousPatterns.push(name);
      }
    }

    // Calculate sandbox score
    let sandboxScore = 0;
    if (analysis.forms.some(f => f.suspicious)) sandboxScore += 40;
    if (analysis.externalScripts.length > 5) sandboxScore += 20;
    if (analysis.suspiciousPatterns.length > 0) sandboxScore += 30;
    if (analysis.iframes.length > 0) sandboxScore += 15;

    const sandboxReport = {
      url,
      timestamp: new Date().toISOString(),
      score: Math.min(sandboxScore, 100),
      analysis,
      verdict: sandboxScore > 70 ? 'MALICIOUS' : sandboxScore > 40 ? 'SUSPICIOUS' : 'CLEAN'
    };

    // Update threat record with sandbox results
    if (threatId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase
        .from('threats')
        .update({
          sandbox_report: sandboxReport,
          sandbox_analyzed: true
        })
        .eq('id', threatId);
    }

    console.log('Sandbox analysis complete:', sandboxReport.verdict);

    return new Response(
      JSON.stringify(sandboxReport),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sandbox analysis failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId
    });

    return new Response(
      JSON.stringify({ 
        error: 'Sandbox analysis failed. Please try again later.',
        requestId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
