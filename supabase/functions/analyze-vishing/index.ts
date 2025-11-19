import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice Phishing (Vishing) Detection
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl, transcription } = await req.json();

    if (!audioUrl && !transcription) {
      return new Response(
        JSON.stringify({ error: 'Audio URL or transcription required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Analyze transcription for vishing patterns using AI
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
            content: `You are a vishing (voice phishing) detection expert. Analyze voice call transcriptions for:

1. **Impersonation Tactics:**
   - Bank/financial institution impersonation
   - Government agency impersonation (IRS, Social Security, police)
   - Tech support scams (Microsoft, Apple, Google)
   - Utility company impersonation

2. **Social Engineering Patterns:**
   - Urgency and pressure tactics
   - Threats (arrest, account closure, legal action)
   - Request for sensitive information (SSN, passwords, card numbers)
   - Payment demands (gift cards, wire transfer, crypto)
   - Remote access requests

3. **Deepfake Indicators:**
   - Unnatural speech patterns
   - Voice inconsistencies
   - Background noise anomalies
   - Robotic or synthesized quality

4. **Fraudulent Scripts:**
   - Pre-written scripts with placeholders
   - Rehearsed responses
   - Avoiding direct questions
   - Pressure to act immediately

Return JSON:
{
  "vishing_score": 0-100,
  "deepfake_detected": true/false,
  "threat_level": "high" | "medium" | "low",
  "impersonation_type": "bank" | "government" | "tech_support" | "utility" | "other" | "none",
  "social_engineering_tactics": ["urgency", "threats", "payment_pressure", etc],
  "explanation": "Detailed explanation of why this is vishing",
  "confidence": 0-100
}`
          },
          {
            role: 'user',
            content: `Analyze this voice call transcription for vishing:\n\n${transcription || 'Audio analysis pending...'}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Vishing analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze vishing attempt',
        vishing_score: 0,
        deepfake_detected: false,
        threat_level: 'low',
        explanation: 'Analysis failed'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
