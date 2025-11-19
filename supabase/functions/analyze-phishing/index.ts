import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Behavioral AI Layer - Detect DOM manipulation and malicious JS patterns
async function analyzeBehavioralPatterns(content: string): Promise<any> {
  const patterns = {
    domManipulation: /(document\.write|innerHTML\s*=|createElement.*script|eval\()/gi,
    credentialHarvesting: /(password|login|credential|account).*?(capture|steal|harvest)/gi,
    clipboardHijack: /(clipboard|execCommand.*copy|navigator\.clipboard)/gi,
    keylogging: /(keydown|keypress|keyup).*addEventListener/gi,
    fakeOverlay: /(position\s*:\s*fixed|z-index\s*:\s*999|opacity\s*:\s*0\.)/gi
  };

  const issues = [];
  let score = 0;

  if (patterns.domManipulation.test(content)) {
    issues.push('DOM manipulation detected');
    score += 30;
  }
  if (patterns.credentialHarvesting.test(content)) {
    issues.push('Credential harvesting patterns found');
    score += 40;
  }
  if (patterns.clipboardHijack.test(content)) {
    issues.push('Clipboard manipulation detected');
    score += 25;
  }
  if (patterns.keylogging.test(content)) {
    issues.push('Keylogging event listeners found');
    score += 35;
  }
  if (patterns.fakeOverlay.test(content)) {
    issues.push('Suspicious overlay elements detected');
    score += 20;
  }

  return {
    score: Math.min(score, 100),
    issues,
    domManipulation: patterns.domManipulation.test(content),
    credentialHarvesting: patterns.credentialHarvesting.test(content)
  };
}

// Social Engineering Pattern Detection
async function detectSocialEngineering(content: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) return { score: 0, tactics: [] };

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Analyze this content for social engineering tactics. Detect: urgency, fear, authority impersonation, reward/bounty, payment pressure. Return JSON with {score: 0-100, tactics: [string array]}.

Content: ${content.substring(0, 2000)}`
        }],
        response_format: { type: "json_object" }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    }
  } catch (error) {
    console.error('Social engineering analysis error:', error);
  }
  
  return { score: 0, tactics: [] };
}

// Reverse URL Decomposition Engine
async function decomposeURL(url: string): Promise<any> {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Subdomain depth analysis
    const parts = hostname.split('.');
    const subdomainDepth = parts.length - 2;
    
    // Punycode detection
    const punycodeDetected = hostname.startsWith('xn--');
    
    // Homograph detection (mixed scripts, lookalike characters)
    const homographPatterns = /[а-яА-Я].*[a-zA-Z]|[a-zA-Z].*[а-яА-Я]|[οОο0]|[аaα]|[еeε]|[іiι]/;
    const homographDetected = homographPatterns.test(hostname);
    
    // Check for suspicious TLDs
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top'];
    const suspiciousTLD = suspiciousTLDs.some(tld => hostname.endsWith(tld));
    
    let score = 0;
    const issues = [];
    
    if (subdomainDepth > 3) {
      score += 30;
      issues.push(`Excessive subdomain depth: ${subdomainDepth}`);
    }
    if (punycodeDetected) {
      score += 40;
      issues.push('Punycode encoding detected');
    }
    if (homographDetected) {
      score += 50;
      issues.push('Homograph attack detected (lookalike characters)');
    }
    if (suspiciousTLD) {
      score += 25;
      issues.push('Suspicious TLD');
    }
    
    return {
      score: Math.min(score, 100),
      subdomainDepth,
      homographDetected,
      punycodeDetected,
      decomposition: {
        protocol: urlObj.protocol,
        hostname,
        path: urlObj.pathname,
        params: urlObj.searchParams.toString(),
        subdomains: parts.slice(0, -2).join('.'),
        domain: parts.slice(-2).join('.')
      },
      issues
    };
  } catch (error) {
    return { score: 0, subdomainDepth: 0, homographDetected: false, punycodeDetected: false, decomposition: {}, issues: [] };
  }
}

// Email Authentication Verification (SPF, DKIM, DMARC)
async function verifyEmailAuthentication(emailContent: string, senderEmail: string): Promise<any> {
  // Extract domain from email
  const domain = senderEmail?.split('@')[1];
  if (!domain) return { spf: false, dkim: false, dmarc: false, reputation: 0 };
  
  try {
    // Check DNS records for SPF, DKIM, DMARC
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
    const dnsData = await dnsResponse.json();
    
    let spf = false, dkim = false, dmarc = false;
    
    if (dnsData.Answer) {
      for (const record of dnsData.Answer) {
        const txt = record.data?.toLowerCase() || '';
        if (txt.includes('v=spf1')) spf = true;
        if (txt.includes('v=dkim1')) dkim = true;
        if (txt.includes('v=dmarc1')) dmarc = true;
      }
    }
    
    const reputation = (spf ? 33 : 0) + (dkim ? 33 : 0) + (dmarc ? 34 : 0);
    const status = `SPF:${spf} DKIM:${dkim} DMARC:${dmarc}`;
    
    return { spf, dkim, dmarc, reputation, status };
  } catch (error) {
    console.error('Email auth verification error:', error);
    return { spf: false, dkim: false, dmarc: false, reputation: 0, status: 'verification_failed' };
  }
}

// Dark Web Exposure Check
async function checkDarkWebExposure(domain: string, email: string): Promise<any> {
  const HIBP_API_KEY = Deno.env.get('HIBP_API_KEY');
  if (!HIBP_API_KEY) return { score: 0, breaches: [] };
  
  try {
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
      headers: { 'hibp-api-key': HIBP_API_KEY }
    });
    
    if (response.ok) {
      const breaches = await response.json();
      const score = Math.min(breaches.length * 10, 100);
      return { score, breaches: breaches.slice(0, 5).map((b: any) => b.Name) };
    }
  } catch (error) {
    console.error('HIBP check error:', error);
  }
  
  return { score: 0, breaches: [] };
}

// Adversarial ML Defense - Detect obfuscation and evasion
async function detectAdversarialTactics(content: string): Promise<any> {
  const patterns = {
    obfuscatedHTML: /&#x[\da-f]{2,4};|&#\d{2,5};|\\u[\da-f]{4}/gi,
    invisibleText: /(color\s*:\s*white.*background\s*:\s*white|opacity\s*:\s*0|display\s*:\s*none.*content)/gi,
    encodedPayloads: /(base64|atob|btoa|fromCharCode)/gi,
    pixelBrandImpersonation: /(1px|0\.01|font-size\s*:\s*0)/gi
  };
  
  const issues = [];
  let score = 0;
  
  if (patterns.obfuscatedHTML.test(content)) {
    issues.push('HTML entity obfuscation detected');
    score += 35;
  }
  if (patterns.invisibleText.test(content)) {
    issues.push('Invisible text patterns found');
    score += 30;
  }
  if (patterns.encodedPayloads.test(content)) {
    issues.push('Encoded payloads detected');
    score += 25;
  }
  if (patterns.pixelBrandImpersonation.test(content)) {
    issues.push('Pixel-based manipulation detected');
    score += 20;
  }
  
  return {
    score: Math.min(score, 100),
    issues,
    obfuscationDetected: issues.length > 0
  };
}

// Generate AI Explanation
async function generateThreatExplanation(analysisData: any): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) return 'Analysis complete. Review threat indicators for details.';

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Generate a clear, concise explanation (max 200 words) of why this is dangerous based on: 
Threat Level: ${analysisData.threat}
Confidence: ${analysisData.confidence}%
NLP Score: ${analysisData.nlp?.score || 0}
Visual Score: ${analysisData.visual?.score || 0}
Network Score: ${analysisData.network?.score || 0}
Behavioral Score: ${analysisData.behavioral?.score || 0}
Social Engineering Score: ${analysisData.socialEngineering?.score || 0}

Explain what indicators were found and how severe the threat is.`
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error('AI explanation error:', error);
  }
  
  return 'This content shows multiple threat indicators. Review the detailed analysis for specific concerns.';
}

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

    const content = url || emailContent || '';
    const contentType = url ? 'URL' : 'Email/SMS content';

    // Perform ALL detection layers in parallel
    const [
      threatIntel,
      infrastructure,
      sandbox,
      behavioral,
      socialEngineering,
      urlDecomposition,
      emailAuth,
      darkWebExposure,
      adversarial
    ] = await Promise.all([
      url ? checkThreatIntel(url, 'url') : Promise.resolve(null),
      url ? analyzeInfrastructure(url) : Promise.resolve(null),
      url ? sandboxAnalysis(url) : Promise.resolve(null),
      analyzeBehavioralPatterns(content),
      detectSocialEngineering(content),
      url ? decomposeURL(url) : Promise.resolve(null),
      emailContent ? verifyEmailAuthentication(emailContent, '') : Promise.resolve(null),
      url ? checkDarkWebExposure(new URL(url).hostname, '') : Promise.resolve(null),
      detectAdversarialTactics(content)
    ]);

    console.log('All Detection Layers:', {
      threatIntel,
      infrastructure,
      sandbox,
      behavioral,
      socialEngineering,
      urlDecomposition,
      emailAuth,
      darkWebExposure,
      adversarial
    });

    // Build enhanced context for AI analysis with ALL detection layers
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

    if (behavioral) {
      enhancedContext += `\n\nBEHAVIORAL ANALYSIS:\n- Behavior Score: ${behavioral.score}\n- DOM Manipulation: ${behavioral.domManipulation ? 'DETECTED' : 'None'}\n- Credential Harvesting: ${behavioral.credentialHarvesting ? 'DETECTED' : 'None'}\n- Issues: ${behavioral.issues.join(', ')}`;
    }

    if (socialEngineering && socialEngineering.score > 0) {
      enhancedContext += `\n\nSOCIAL ENGINEERING:\n- Manipulation Score: ${socialEngineering.score}\n- Tactics: ${socialEngineering.tactics.join(', ')}`;
    }

    if (urlDecomposition) {
      enhancedContext += `\n\nURL DECOMPOSITION:\n- Subdomain Depth: ${urlDecomposition.subdomainDepth}\n- Homograph Attack: ${urlDecomposition.homographDetected ? 'DETECTED' : 'None'}\n- Punycode: ${urlDecomposition.punycodeDetected ? 'YES' : 'No'}\n- Score: ${urlDecomposition.score}`;
    }

    if (emailAuth) {
      enhancedContext += `\n\nEMAIL AUTHENTICATION:\n- SPF: ${emailAuth.spf ? 'PASS' : 'FAIL'}\n- DKIM: ${emailAuth.dkim ? 'PASS' : 'FAIL'}\n- DMARC: ${emailAuth.dmarc ? 'PASS' : 'FAIL'}\n- Reputation: ${emailAuth.reputation}`;
    }

    if (darkWebExposure && darkWebExposure.score > 0) {
      enhancedContext += `\n\nDARK WEB EXPOSURE:\n- Exposure Score: ${darkWebExposure.score}\n- Known Breaches: ${darkWebExposure.breaches.join(', ')}`;
    }

    if (adversarial) {
      enhancedContext += `\n\nADVERSARIAL DETECTION:\n- Obfuscation Score: ${adversarial.score}\n- Obfuscation Detected: ${adversarial.obfuscationDetected ? 'YES' : 'No'}\n- Issues: ${adversarial.issues.join(', ')}`;
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

    // Generate AI explanation
    const aiExplanation = await generateThreatExplanation({
      ...result,
      behavioral,
      socialEngineering,
      urlDecomposition,
      emailAuth,
      darkWebExposure,
      adversarial
    });

    // Enhance result with all detection layers
    result.behavior_score = behavioral?.score || 0;
    result.behavior_issues = behavioral?.issues || [];
    result.social_engineering_score = socialEngineering?.score || 0;
    result.manipulation_tactics = socialEngineering?.tactics || [];
    result.url_decomposition_score = urlDecomposition?.score || 0;
    result.adversarial_score = adversarial?.score || 0;
    result.ai_explanation = aiExplanation;

    // Store the threat in database with all new fields
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
        user_ip: req.headers.get('x-forwarded-for') || 'unknown',
        // Behavioral AI
        behavior_score: result.behavior_score,
        behavior_issues: result.behavior_issues,
        dom_manipulation_detected: behavioral?.domManipulation || false,
        credential_harvesting_detected: behavioral?.credentialHarvesting || false,
        // Social Engineering
        social_engineering_score: result.social_engineering_score,
        manipulation_tactics: result.manipulation_tactics,
        // URL Decomposition
        url_decomposition_score: result.url_decomposition_score,
        subdomain_depth: urlDecomposition?.subdomainDepth || 0,
        homograph_detected: urlDecomposition?.homographDetected || false,
        punycode_detected: urlDecomposition?.punycodeDetected || false,
        url_decomposition: urlDecomposition?.decomposition || {},
        // Email Authentication
        sender_reputation: emailAuth?.reputation || 0,
        email_authentication_status: emailAuth?.status || null,
        spf_pass: emailAuth?.spf || false,
        dkim_pass: emailAuth?.dkim || false,
        dmarc_pass: emailAuth?.dmarc || false,
        // Dark Web
        exposure_score: darkWebExposure?.score || 0,
        breach_data: darkWebExposure?.breaches || [],
        // Adversarial
        adversarial_score: result.adversarial_score,
        adversarial_issues: adversarial?.issues || [],
        obfuscation_detected: adversarial?.obfuscationDetected || false,
        // Threat Intel Enhancement
        asn: infrastructure?.asn || null,
        isp: infrastructure?.isp || null,
        attack_type: result.threat === 'high' ? 'phishing' : null,
        threat_intel_sources: threatIntel ? ['alienvault_otx'] : [],
        // AI Explanation
        ai_explanation: aiExplanation
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