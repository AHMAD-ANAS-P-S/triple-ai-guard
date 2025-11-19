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
    const { audioData } = await req.json();
    
    if (!audioData) {
      return new Response(
        JSON.stringify({ error: 'Audio data required', requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!OPENAI_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('API keys not configured');
    }

    // Step 1: Transcribe audio using Whisper
    const formData = new FormData();
    const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!transcribeResponse.ok) {
      throw new Error('Audio transcription failed');
    }

    const { text: transcript } = await transcribeResponse.json();

    // Step 2: Analyze transcript for vishing indicators using AI
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: `You are a vishing (voice phishing) detection expert. Analyze audio transcripts for:
- Deepfake voice indicators (unnatural speech patterns, audio artifacts)
- Fraudulent scripts (bank impersonation, authority figures, urgency tactics)
- Social engineering (creating fear, demanding immediate action)
- Identity theft attempts
- Financial fraud patterns

Return JSON: {
  "vishing_score": 0-100,
  "deepfake_detected": boolean,
  "threat_indicators": [array of strings],
  "explanation": "detailed explanation",
  "verdict": "SAFE" | "SUSPICIOUS" | "DANGEROUS"
}`
        }, {
          role: 'user',
          content: `Analyze this transcript for vishing:\n\n${transcript}`
        }],
        response_format: { type: "json_object" }
      })
    });

    if (!analysisResponse.ok) {
      throw new Error('Vishing analysis failed');
    }

    const analysisData = await analysisResponse.json();
    const result = JSON.parse(analysisData.choices[0].message.content);

    // Store vishing analysis in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase
      .from('threats')
      .insert({
        email_content: transcript,
        threat_level: result.vishing_score > 70 ? 'high' : result.vishing_score > 40 ? 'medium' : 'low',
        confidence: result.vishing_score,
        verdict: result.verdict,
        reason: 'Voice phishing analysis',
        vishing_score: result.vishing_score,
        deepfake_detected: result.deepfake_detected,
        vishing_explanation: result.explanation,
        nlp_score: 0,
        nlp_issues: [],
        visual_score: 0,
        visual_issues: [],
        network_score: 0,
        network_issues: [],
        user_ip: req.headers.get('x-forwarded-for') || 'unknown'
      });

    return new Response(
      JSON.stringify({
        transcript,
        ...result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Vishing analysis failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId
    });

    return new Response(
      JSON.stringify({ 
        error: 'Vishing analysis failed. Please try again later.',
        requestId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
