import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey) throw new Error("API Key missing");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase config missing");

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch dynamic prompt from database
    const { data: settings, error: dbError } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'ai_support_prompt')
      .single();

    if (dbError) {
      console.warn("Error fetching dynamic prompt, using fallback:", dbError);
    }

    const fallbackPrompt = `
      Eres el Asistente de YUPAY. Ayudas a comercios y clientes.
      Planes: Gratis (10 productos), Básico ($29,000 ARS), Pro ($79,000 ARS).
      Contacto: soporte@yupay.app.
      Reglas: Sé amigable, usa emojis 🇦🇷 y responde en español.
    `;

    const systemPrompt = settings?.value || fallbackPrompt;

    // Tomamos el último mensaje del usuario
    const lastUserMessage = messages[messages.length - 1].content;

    // Usamos el modelo ultra-lite y económico sugerido por el usuario
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\nUsuario dice: " + lastUserMessage }] }
        ],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google AI Error:", data);
      throw new Error(data.error?.message || "Error de comunicación con Google AI");
    }

    const aiText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ response: aiText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge Function Crash:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
