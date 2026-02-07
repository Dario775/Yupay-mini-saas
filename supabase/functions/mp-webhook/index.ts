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

        // Parse webhook payload
        const { type, data } = await req.json()
        console.log('Webhook received:', type, data)

        // Only process payment notifications
        if (type !== 'payment') {
            return new Response(JSON.stringify({ message: 'Ignored' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // Get payment details from MercadoPago
        const paymentId = data.id
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
            }
        })

        if (!mpResponse.ok) {
            throw new Error(`Failed to fetch payment: ${mpResponse.status}`)
        }

        const payment = await mpResponse.json()
        console.log('Payment status:', payment.status, 'External ref:', payment.external_reference)

        // Only process approved payments
        if (payment.status !== 'approved') {
            console.log('Payment not approved yet:', payment.status)
            return new Response(JSON.stringify({ message: 'Payment not approved' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // Get upgrade request ID from external_reference
        const upgradeRequestId = payment.external_reference
        if (!upgradeRequestId) {
            throw new Error('Missing external_reference')
        }

        // Initialize Supabase client with service role
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Get the upgrade request
        const { data: upgradeRequest, error: fetchError } = await supabase
            .from('plan_upgrade_requests')
            .select('*')
            .eq('id', upgradeRequestId)
            .single()

        if (fetchError || !upgradeRequest) {
            throw new Error(`Upgrade request not found: ${upgradeRequestId}`)
        }

        // Check if already processed
        if (upgradeRequest.status === 'approved') {
            console.log('Already processed')
            return new Response(JSON.stringify({ message: 'Already processed' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // Update upgrade request status
        await supabase
            .from('plan_upgrade_requests')
            .update({
                status: 'approved',
                mp_payment_id: paymentId.toString(),
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', upgradeRequestId)

        // Update subscription plan
        const { error: subError } = await supabase
            .from('subscriptions')
            .update({
                plan: upgradeRequest.target_plan,
                status: 'activa',
                updated_at: new Date().toISOString()
            })
            .eq('id', upgradeRequest.subscription_id)

        if (subError) {
            console.error('Error updating subscription:', subError)
            throw subError
        }

        console.log(`Successfully upgraded user ${upgradeRequest.user_id} to plan ${upgradeRequest.target_plan}`)

        return new Response(
            JSON.stringify({
                success: true,
                message: `Plan upgraded to ${upgradeRequest.target_plan}`
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
