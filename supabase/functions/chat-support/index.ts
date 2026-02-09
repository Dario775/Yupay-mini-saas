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

    // Fetch all settings at once for efficiency
    const { data: allSettings, error: dbError } = await supabase
      .from('platform_settings')
      .select('key, value');

    if (dbError) console.warn("Error fetching settings:", dbError);

    const settingsMap = Object.fromEntries(
      (allSettings || []).map((s: { key: string; value: string }) => [s.key, s.value])
    );

    const systemPrompt = settingsMap['ai_support_prompt'] || `
      Eres el Asistente de YUPAY. Solo respondes dudas sobre esta plataforma.
      Planes: Gratis ($0), Básico ($29,000 ARS), Pro ($79,000 ARS).
      Reglas: Sé amigable, breve, usa emojis 🇦🇷 y NO respondas nada que no sea de Yupay.
    `;

    // OPTIMIZACIÓN: Solo enviamos los últimos 6 mensajes para ahorrar tokens de contexto
    const history = messages.slice(-6);

    // GUARDRAILS: Instrucción de seguridad para evitar mal uso del bot
    const guardrail = "\n\nIMPORTANTE: Solo responde sobre YUPAY. Si el usuario desea contactar con soporte o un humano, DEBES usar la herramienta 'notify_support' una vez que tengas su Nombre, Correo, Teléfono y Motivo.";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    // Herramienta para capturar leads
    const tools = [{
      function_declarations: [{
        name: "notify_support",
        description: "Envía una notificación a soporte con los datos del usuario para que lo contacten.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "Nombre del usuario" },
            email: { type: "STRING", description: "Correo electrónico" },
            phone: { type: "STRING", description: "Teléfono de contacto" },
            subject: { type: "STRING", description: "Motivo de la consulta" }
          },
          required: ["name", "email", "phone", "subject"]
        }
      }]
    }];

    async function callGemini(contents: any, toolsList: any) {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          tools: toolsList,
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
        }),
      });
      return await resp.json();
    }

    let contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt + guardrail + "\n\nConversación:\n" + history.map((m: any) => `${m.role}: ${m.content}`).join("\n") }]
      }
    ];

    let data = await callGemini(contents, tools);

    // Si la IA decide llamar a la función de notificación
    if (data.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
      const call = data.candidates[0].content.parts[0].functionCall;

      if (call.name === "notify_support") {
        const { name, email, phone, subject } = call.args;

        // Ejecutamos la notificación por Telegram
        const botToken = settingsMap['telegram_bot_token'];
        const chatId = settingsMap['telegram_chat_id'];

        let telegramResult = "success";
        if (botToken && chatId) {
          const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          const text = `🚀 *Nuevo Lead desde YUPAY*
          
👤 *Nombre:* ${name}
📧 *Email:* ${email}
📞 *Teléfono:* ${phone}
📝 *Asunto:* ${subject}
          
_Enviado desde el Asistente AI_`;

          try {
            const tgResp = await fetch(telegramUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: "Markdown"
              })
            });
            if (!tgResp.ok) telegramResult = "error-telegram-api";
          } catch (e) {
            console.error("Telegram send error:", e);
            telegramResult = "error-network";
          }
        } else {
          telegramResult = "error-missing-config";
        }

        // Devolvemos el resultado a la IA para que le confirme al usuario
        contents.push(data.candidates[0].content);
        contents.push({
          role: "function",
          parts: [{
            functionResponse: {
              name: "notify_support",
              response: { content: telegramResult === "success" ? "Notificación enviada con éxito" : "Error al enviar notificación" }
            }
          } as any]
        });

        // Llamamos de nuevo a Gemini para que genere la respuesta final al usuario
        data = await callGemini(contents, tools);
      }
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "He recibido tus datos y los he enviado a soporte. Pronto se comunicarán contigo. 🚀";

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
