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

        console.log('📋 Request received:', { upgradeRequestId, planName, amount, userEmail })
        console.log('🔑 Token prefix:', MP_ACCESS_TOKEN.substring(0, 20) + '...')

        // Get the origin for back URLs
        const origin = req.headers.get('origin') || 'https://yupay.com.ar'

        // Create MercadoPago preference
        const preferenceData = {
            items: [
                {
                    id: upgradeRequestId,
                    title: `Plan ${planName} - Yupay`,
                    description: `Suscripción mensual al plan ${planName}`,
                    quantity: 1,
                    currency_id: 'ARS',
                    unit_price: Number(amount)
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

        console.log('📤 Sending to MercadoPago:', JSON.stringify(preferenceData, null, 2))

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferenceData)
        })

        const responseText = await mpResponse.text()
        console.log('📥 MercadoPago response status:', mpResponse.status)
        console.log('📥 MercadoPago response body:', responseText)

        if (!mpResponse.ok) {
            throw new Error(`MercadoPago API error ${mpResponse.status}: ${responseText}`)
        }

        const mpData = JSON.parse(responseText)

        console.log('✅ MercadoPago preference created:', mpData.id)

        // Update the upgrade request with preference ID (optional - don't fail if this errors)
        try {
            const supabaseUrl = Deno.env.get('SUPABASE_URL')
            const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

            if (!supabaseUrl || !supabaseKey) {
                console.warn('⚠️ Supabase credentials not found, skipping DB update')
            } else {
                const supabase = createClient(supabaseUrl, supabaseKey)

                const { error: updateError } = await supabase
                    .from('plan_upgrade_requests')
                    .update({ mp_preference_id: mpData.id })
                    .eq('id', upgradeRequestId)

                if (updateError) {
                    console.error('⚠️ Failed to update DB:', updateError)
                } else {
                    console.log('✅ Database updated with preference ID')
                }
            }
        } catch (dbErr) {
            console.error('⚠️ DB update error (non-fatal):', dbErr)
        }

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

    } catch (error: any) {
        console.error('❌ Fatal error:', error)
        const errorMessage = error?.message || String(error)
        const errorDetails = {
            error: errorMessage,
            type: error?.name || 'UnknownError',
            details: error?.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace'
        }
        console.error('Error details:', errorDetails)

        return new Response(
            JSON.stringify(errorDetails),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
