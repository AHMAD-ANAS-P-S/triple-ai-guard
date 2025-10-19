import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Threat intelligence check using AlienVault OTX
async function checkThreatIntel(indicator: string, type: 'url' | 'domain' | 'ip'): Promise<any> {
  const OTX_API_KEY = Deno.env.get('ALIENVAULT_OTX_API_KEY');
  if (!OTX_API_KEY) return null;

  try {
    let endpoint = '';
    if (type === 'url') {
      const urlObj = new URL(indicator);
      endpoint = `https://otx.alienvault.com/api/v1/indicators/domain/${urlObj.hostname}/general`;
    } else if (type === 'domain') {
      endpoint = `https://otx.alienvault.com/api/v1/indicators/domain/${indicator}/general`;
    } else if (type === 'ip') {
      endpoint = `https://otx.alienvault.com/api/v1/indicators/IPv4/${indicator}/general`;
    }

    const response = await fetch(endpoint, {
      headers: { 'X-OTX-API-KEY': OTX_API_KEY }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        pulses: data.pulse_info?.count || 0,
        reputation: data.reputation || 0,
        malicious: (data.pulse_info?.count || 0) > 0
      };
    }
  } catch (error) {
    console.error('OTX check error:', error);
  }
  return null;
}

// Sandbox analysis using URLScan.io
async function sandboxAnalysis(url: string): Promise<any> {
  const URLSCAN_API_KEY = Deno.env.get('URLSCAN_API_KEY');
  if (!URLSCAN_API_KEY) return null;

  try {
    // Submit URL for scanning
    const submitResponse = await fetch('https://urlscan.io/api/v1/scan/', {
      method: 'POST',
      headers: {
        'API-Key': URLSCAN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, visibility: 'unlisted' })
    });

    if (submitResponse.ok) {
      const submitData = await submitResponse.json();
      
      // Wait for scan to complete (simplified - in production use polling)
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Get results
      const resultResponse = await fetch(submitData.api, {
        headers: { 'API-Key': URLSCAN_API_KEY }
      });

      if (resultResponse.ok) {
        const resultData = await resultResponse.json();
        return {
          malicious: resultData.verdicts?.overall?.malicious || false,
          score: resultData.verdicts?.overall?.score || 0,
          categories: resultData.verdicts?.overall?.categories || [],
          screenshot: resultData.task?.screenshotURL
        };
      }
    }
  } catch (error) {
    console.error('URLScan error:', error);
  }
  return null;
}

// Enhanced infrastructure analysis
async function analyzeInfrastructure(url: string): Promise<any> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // DNS lookup to get IP
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const dnsData = await dnsResponse.json();
    const ip = dnsData.Answer?.[0]?.data;

    // WHOIS-like data (using IP geolocation)
    let geoData = null;
    if (ip) {
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      if (geoResponse.ok) {
        geoData = await geoResponse.json();
      }
    }

    return {
      domain,
      ip: ip || 'unknown',
      country: geoData?.country_name || 'unknown',
      asn: geoData?.asn || 'unknown',
      org: geoData?.org || 'unknown',
      isp: geoData?.org || 'unknown'
    };
  } catch (error) {
    console.error('Infrastructure analysis error:', error);
    return null;
  }
}

// Simple rate limiting using in-memory storage (for production, use Deno KV or external service)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 10) { // 10 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
}

// Input validation schema
interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: { url?: string; emailContent?: string };
}

function validateInput(data: any): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request format' };
  }

  const { url, emailContent } = data;

  if (!url && !emailContent) {
    return { valid: false, error: 'Either url or emailContent must be provided' };
  }

  // Validate URL if provided
  if (url) {
    if (typeof url !== 'string' || url.length > 2048) {
      return { valid: false, error: 'URL must be a string with maximum length of 2048 characters' };
    }
    try {
      new URL(url);
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  // Validate email content if provided
  if (emailContent) {
    if (typeof emailContent !== 'string' || emailContent.length > 50000) {
      return { valid: false, error: 'Email content must be a string with maximum length of 50KB' };
    }
  }

  return { valid: true, data: { url, emailContent } };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(clientIp)) {
      console.error(`Rate limit exceeded for IP: ${clientIp}`, { requestId });
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          requestId 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let requestData;
    try {
      requestData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON format', requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = validateInput(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error, requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url, emailContent } = validation.data!;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const content = url || emailContent;
    const contentType = url ? 'URL' : 'Email/SMS content';

    // Perform threat intelligence and infrastructure analysis in parallel
    const [threatIntel, infrastructure, sandbox] = await Promise.all([
      url ? checkThreatIntel(url, 'url') : Promise.resolve(null),
      url ? analyzeInfrastructure(url) : Promise.resolve(null),
      url ? sandboxAnalysis(url) : Promise.resolve(null)
    ]);

    console.log('Threat Intel:', threatIntel);
    console.log('Infrastructure:', infrastructure);
    console.log('Sandbox:', sandbox);

    // Build enhanced context for AI analysis
    let enhancedContext = `${content}`;
    
    if (infrastructure) {
      enhancedContext += `\n\nINFRASTRUCTURE ANALYSIS:\n- Domain: ${infrastructure.domain}\n- IP Address: ${infrastructure.ip}\n- Country: ${infrastructure.country}\n- ASN: ${infrastructure.asn}\n- Organization: ${infrastructure.org}`;
    }
    
    if (threatIntel) {
      enhancedContext += `\n\nTHREAT INTELLIGENCE:\n- Known Malicious: ${threatIntel.malicious ? 'YES' : 'NO'}\n- Threat Pulses: ${threatIntel.pulses}\n- Reputation Score: ${threatIntel.reputation}`;
    }

    if (sandbox) {
      enhancedContext += `\n\nSANDBOX ANALYSIS:\n- Malicious Verdict: ${sandbox.malicious ? 'YES' : 'NO'}\n- Risk Score: ${sandbox.score}\n- Categories: ${sandbox.categories.join(', ')}`;
    }

    // Call Lovable AI for triple-AI analysis with enhanced context
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are Zerophish AI, an advanced multi-layered phishing detection system with specialized AI detectives and adversarial detection capabilities:

**MULTI-LANGUAGE DETECTION**: You MUST detect and analyze phishing attempts in ALL LANGUAGES including but not limited to: English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Hindi, Russian, Portuguese, Italian, Dutch, Swedish, Polish, Turkish, Thai, Vietnamese, Indonesian, and any other language. Phishing patterns transcend language barriers.

**Three Specialized AI Detectives:**

1. **NLP Detective (Text Analysis)**: 
   - Analyzes language patterns, urgency indicators, grammatical errors, threatening tone
   - Detects AI-generated content and synthetic text patterns
   - Identifies multi-language social engineering tactics
   - Recognizes emotional manipulation regardless of language

2. **Visual Detective (Visual Analysis)**: 
   - Examines logos, colors, layouts, brand spoofing
   - Detects image quality issues and manipulation
   - Identifies visual cues across different cultural contexts

3. **Network Detective (Infrastructure Analysis)**: 
   - Analyzes domain age, SSL certificates, hosting location
   - Examines DNS patterns and IP reputation
   - Correlates threat intelligence data
   - Identifies infrastructure anomalies and adversarial tactics

**Adversarial Layer Detection:**
- Cross-reference with threat intelligence databases (AlienVault OTX)
- Analyze infrastructure origin (IP geolocation, ASN, ISP)
- Detect domain generation algorithms (DGA)
- Identify command & control (C2) patterns
- Recognize known attacker infrastructure
- Analyze hosting patterns typical of phishing campaigns
- Detect obfuscation and evasion techniques

Analyze the provided content (which includes threat intelligence and infrastructure data) and return a JSON response with this exact structure:
{
  "threat": "high" | "medium" | "low",
  "confidence": 0-100,
  "verdict": "BLOCKED" | "WARNING" | "SAFE",
  "reason": "Brief explanation",
  "nlp": {
    "score": 0-100,
    "issues": ["issue1", "issue2"]
  },
  "visual": {
    "score": 0-100,
    "issues": ["issue1", "issue2"]
  },
  "network": {
    "score": 0-100,
    "issues": ["issue1", "issue2"]
  }
}

Score = suspicion level (higher = more suspicious)
- High threat (91-100%): All detectives agree it's dangerous OR threat intelligence confirms malicious
- Medium threat (70-90%): 2/3 detectives agree it's suspicious OR infrastructure shows red flags
- Low threat (<30%): Content appears safe AND no threat intelligence hits

**CRITICAL INSTRUCTIONS:**
- Analyze content in ANY language - phishing knows no language barriers
- Weight threat intelligence data heavily - known malicious indicators should increase threat level significantly
- Consider infrastructure anomalies (unusual country/ASN combinations, known malicious hosting providers)
- Detect adversarial tactics like domain spoofing, typosquatting, lookalike domains
- Be thorough and accurate. Real phishing attempts in any language must be caught.`
          },
          {
            role: 'user',
            content: `Analyze this ${contentType} with all available context:\n\n${enhancedContext}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    // Store the threat in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabase
      .from('threats')
      .insert({
        url: url || null,
        email_content: emailContent || null,
        threat_level: result.threat,
        confidence: result.confidence,
        verdict: result.verdict,
        reason: result.reason,
        nlp_score: result.nlp.score,
        nlp_issues: result.nlp.issues,
        visual_score: result.visual.score,
        visual_issues: result.visual.issues,
        network_score: result.network.score,
        network_issues: result.network.issues,
        user_ip: req.headers.get('x-forwarded-for') || 'unknown'
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    console.log('Analysis complete:', result.verdict);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log detailed error server-side
    console.error('Analysis failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      requestId
    });

    // Return generic error to client
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed. Please try again later.',
        requestId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});