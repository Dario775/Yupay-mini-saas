import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
        if (!MP_ACCESS_TOKEN) {
            throw new Error('MP_ACCESS_TOKEN not configured')
        }

        const { upgradeRequestId, planName, amount, userEmail } = await req.json()

        if (!upgradeRequestId || !planName || !amount) {
            throw new Error('Missing required fields: upgradeRequestId, planName, amount')
        }

        // Get the origin for back URLs
        const origin = req.headers.get('origin') || 'http://localhost:5173'

        // Create MercadoPago preference
        const preferenceData = {
            items: [
                {
                    id: upgradeRequestId,
                    title: `Plan ${planName} - Yupay`,
                    description: `Suscripción mensual al plan ${planName}`,
                    quantity: 1,
                    currency_id: 'ARS',
                    unit_price: amount
                }
            ],
            payer: {
                email: userEmail || 'cliente@example.com'
            },
            back_urls: {
                success: `${origin}/dashboard?upgrade=success`,
                failure: `${origin}/dashboard?upgrade=failure`,
                pending: `${origin}/dashboard?upgrade=pending`
            },
            auto_return: 'approved',
            external_reference: upgradeRequestId,
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
            statement_descriptor: 'YUPAY'
        }

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferenceData)
        })

        if (!mpResponse.ok) {
            const errorData = await mpResponse.text()
            console.error('MercadoPago error:', errorData)
            throw new Error(`MercadoPago API error: ${mpResponse.status}`)
        }

        const mpData = await mpResponse.json()

        // Update the upgrade request with preference ID
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        await supabase
            .from('plan_upgrade_requests')
            .update({ mp_preference_id: mpData.id })
            .eq('id', upgradeRequestId)

        return new Response(
            JSON.stringify({
                id: mpData.id,
                init_point: mpData.init_point,
                sandbox_init_point: mpData.sandbox_init_point
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
