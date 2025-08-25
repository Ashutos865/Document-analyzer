// supabase/functions/legal-analyzer/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// This is a placeholder for CORS headers. In a real project, you would create this shared file.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROMPT = `You are an expert legal AI assistant named "Legality". Analyze the following legal document text. Respond ONLY with a valid JSON object with three keys: "summary", "clauses", and "laws".
  - "summary": A concise, neutral summary of the document's purpose.
  - "clauses": A string containing a list of the 3-5 most important clauses, each on a new line.
  - "laws": A string containing a list of the general areas of law that are relevant (e.g., "Contract Law").`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentText } = await req.json();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: PROMPT },
          { role: "user", content: `Here is the document:\n\n${documentText}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await response.json();
    if (aiData.error) throw new Error(aiData.error.message);
    
    const content = aiData.choices[0].message.content;

    return new Response(content, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
