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

  try {
    const { url, emailContent } = await req.json();
    
    if (!url && !emailContent) {
      return new Response(
        JSON.stringify({ error: 'URL or email content required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const content = url || emailContent;
    const contentType = url ? 'URL' : 'Email/SMS content';

    // Call Lovable AI for triple-AI analysis
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
            content: `You are Zerophish AI, a sophisticated phishing detection system with three specialized AI detectives:

1. NLP Detective (Text Analysis): Analyzes language patterns, urgency indicators, grammatical errors, threatening tone, AI-generated content
2. Visual Detective (Visual Analysis): Examines logos, colors, layouts, brand spoofing, image quality
3. Network Detective (Infrastructure Analysis): Checks domain age, SSL certificates, hosting location, DNS patterns

Analyze the provided content and return a JSON response with this exact structure:
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
- High threat (91-100%): All detectives agree it's dangerous
- Medium threat (70-90%): 2/3 detectives agree it's suspicious
- Low threat (<30%): Content appears safe

Be thorough and accurate. Real phishing attempts must be caught.`
          },
          {
            role: 'user',
            content: `Analyze this ${contentType}:\n\n${content}`
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
    console.error('Error in analyze-phishing:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});