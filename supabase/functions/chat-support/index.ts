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

    // Fetch all settings and plan configs for efficiency
    const [settingsResult, plansResult] = await Promise.all([
      supabase.from('platform_settings').select('key, value'),
      supabase.from('plan_configs').select('*')
    ]);

    const allSettings = settingsResult.data;
    const allPlans = plansResult.data; // Dynamic pricing source

    if (settingsResult.error) console.warn("Error fetching settings:", settingsResult.error);

    const settingsMap = Object.fromEntries(
      (allSettings || []).map((s: { key: string; value: string }) => [s.key, s.value])
    );

    // Build dynamic pricing text
    let pricingText = "";
    if (allPlans && allPlans.length > 0) {
      pricingText = allPlans.map((p: any) =>
        `- Plan ${p.id.charAt(0).toUpperCase() + p.id.slice(1)}: $${p.price} (ARS) - ${p.max_products === -1 ? 'Productos ilimitados' : 'Hasta ' + p.max_products + ' productos'}`
      ).join('\n        ');
    } else {
      // Fallback if DB fetch fails
      pricingText = `
        - Básico: $5,000 ARS.
        - Profesional: $15,000 ARS.
        - Empresarial: $45,000 ARS.
      `;
    }

    let basePrompt = settingsMap['ai_support_prompt'] || `
      Eres el Asistente Inteligente de YUPAY.
      Tu objetivo es ayudar a clientes y dueños de tiendas de forma rápida y amable.
      
      CONOCIMIENTOS CLAVE:
      - PLATAFORMA: Yupay permite a cualquier comercio crear su tienda online en segundos.
      - UBICACIÓN: Somos una app geolocalizada.
      - PAGOS: Los clientes pueden pagar ONLINE (MercadoPago) o acordar con la tienda (WhatsApp/Efectivo) directamente desde el carrito.
      
      PRECIOS ACTUALIZADOS (ARS):
      {{PRICING_PLACEHOLDER}}

      SOPORTE HUMANO:
      Si alguien pide hablar con soporte, un humano o tiene un problema técnico:
      1. Pide su Nombre, Email, Teléfono y Motivo.
      2. Usa la herramienta 'notify_support' para enviarnos el caso.
    `;

    // Inject dynamic pricing overriding any static/old pricing in the prompt
    // We append it or replace a placeholder if it existed, but to be safe we'll inject it clearly.
    const systemPrompt = basePrompt.replace('{{PRICING_PLACEHOLDER}}', pricingText) +
      `\n\n[INFO ACTUALIZADA DEL SISTEMA]:\nPrecios vigentes: \n${pricingText}\n\nIMPORTANTE: Usa ESTOS precios, ignora cualquier otro precio anterior.`;

    // OPTIMIZACIÓN: Solo enviamos los últimos 6 mensajes para ahorrar tokens de contexto
    const history = messages.slice(-6);

    // GUARDRAILS
    const guardrail = "\n\nINSTRUCCIÓN DE SEGURIDAD: Solo responde sobre YUPAY. Si detectas intención de contacto humano, recaba los datos y usa 'notify_support'.";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    // Herramienta para capturar leads
    const tools = [{
      function_declarations: [{
        name: "notify_support",
        description: "Envía una notificación al equipo de soporte (Telegram) con los datos del usuario.",
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
          generationConfig: { maxOutputTokens: 500, temperature: 0.6 }
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
        const botToken = settingsMap['telegram_bot_token']?.trim();
        const chatId = settingsMap['telegram_chat_id']?.trim();

        console.log("Notifying support via Telegram:", {
          hasToken: !!botToken,
          chatId: chatId,
          name,
          email
        });

        let telegramResult = "success";
        if (botToken && chatId) {
          const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

          // Helper to escape HTML characters
          const escapeHtml = (str: string) => {
            return (str || '').replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
          };

          const safeName = escapeHtml(name);
          const safeEmail = escapeHtml(email);
          const safePhone = escapeHtml(phone);
          const safeSubject = escapeHtml(subject);

          // Usamos HTML para evitar errores de parseo con caracteres especiales de Markdown
          const text = `🚀 <b>Nuevo Lead desde YUPAY</b>\n\n` +
            `👤 <b>Nombre:</b> ${safeName}\n` +
            `📧 <b>Email:</b> ${safeEmail}\n` +
            `📞 <b>Teléfono:</b> ${safePhone}\n` +
            `📝 <b>Asunto:</b> ${safeSubject}\n\n` +
            `<i>Enviado desde el Asistente AI</i>`;

          try {
            const tgResp = await fetch(telegramUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: "HTML"
              })
            });

            if (!tgResp.ok) {
              const errorData: any = await tgResp.json();
              console.error("Telegram API Error:", errorData);
              telegramResult = `error-telegram: ${errorData.description || JSON.stringify(errorData)}`;
            }
          } catch (e) {
            console.error("Telegram network error:", e);
            telegramResult = "error-network";
          }
        } else {
          console.warn("Missing Telegram configuration (token or chat_id)");
          telegramResult = "error-missing-config";
        }

        // Devolvemos el resultado a la IA para que le confirme al usuario
        contents.push(data.candidates[0].content);
        contents.push({
          role: "function",
          parts: [{
            functionResponse: {
              name: "notify_support",
              response: { content: telegramResult === "success" ? "Notificación enviada con éxito" : `Error al enviar notificación (${telegramResult})` }
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
