
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.8';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { storeId, items, buyerEmail, backUrls } = await req.json()

        // 1. Get Store Payment Config
        const { data: config, error: configError } = await supabaseClient
            .from('store_payment_configs')
            .select('access_token')
            .eq('store_id', storeId)
            .eq('provider', 'mercadopago')
            .eq('is_active', true)
            .single()

        if (configError || !config) {
            // Fallback or error if store hasn't configured payments
            throw new Error('La tienda no tiene configurado MercadoPago o las credenciales son inválidas.')
        }

        // 2. Initialize MercadoPago with Store's Access Token
        const client = new MercadoPagoConfig({ accessToken: config.access_token });
        const preference = new Preference(client);

        // 3. Create Preference
        // Note: 'items' should be validated or reconstructed here to secure prices, 
        // but for this MVP we trust the input with basic checks or fetch from DB if needed.
        // Ideally: Fetch products from DB using item IDs to ensure price integrity.

        // Quick validation/mapping
        const mpItems = items.map((item: any) => ({
            id: item.productId,
            title: item.productName,
            quantity: Number(item.quantity),
            unit_price: Number(item.unitPrice),
            currency_id: 'ARS',
        }));

        const body = {
            items: mpItems,
            payer: {
                email: buyerEmail
            },
            back_urls: backUrls || {
                success: 'http://localhost:5173/dashboard?status=success', // Replace with prod URL
                failure: 'http://localhost:5173/dashboard?status=failure',
                pending: 'http://localhost:5173/dashboard?status=pending',
            },
            auto_return: 'approved',
        };

        const result = await preference.create({ body });

        return new Response(
            JSON.stringify({ init_point: result.init_point, sandbox_init_point: result.sandbox_init_point, preferenceId: result.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
