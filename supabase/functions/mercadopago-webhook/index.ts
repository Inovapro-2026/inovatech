
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Used for admin actions
        )

        const payload = await req.json();
        const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN') || 'APP_USR-177791261319351-111320-ac95b05069ed0a2a6916916255393da8-2453606405';
        const webhookSecret = Deno.env.get('MP_WEBHOOK_SECRET') || '79e3b2a1e02824d5252b77f7c4f01767ba429ff57b975ac27b0d3f9258930a40';

        if (!payload.data || !payload.data.id) {
            return new Response(JSON.stringify({ message: "No payment data" }), { status: 200, headers: corsHeaders });
        }

        // Validação da assinatura (x-signature)
        if (webhookSecret) {
            const xSignature = req.headers.get('x-signature');
            const xRequestId = req.headers.get('x-request-id');
            const dataId = payload.data.id;

            if (xSignature && xRequestId) {
                const parts = xSignature.split(',');
                let ts = '';
                let v1 = '';
                parts.forEach(part => {
                    const [key, value] = part.split('=');
                    if (key === 'ts') ts = value;
                    if (key === 'v1') v1 = value;
                });

                const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

                const encoder = new TextEncoder();
                const key = await crypto.subtle.importKey(
                    'raw',
                    encoder.encode(webhookSecret),
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['verify', 'sign']
                );

                const signatureBuffer = await crypto.subtle.sign(
                    'HMAC',
                    key,
                    encoder.encode(manifest)
                );

                const signatureHex = Array.from(new Uint8Array(signatureBuffer))
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('');

                if (signatureHex !== v1) {
                    console.error('Assinatura do webhook inválida. Possível tentativa de fraude.');
                    return new Response(JSON.stringify({ error: 'Assinatura inválida' }), { status: 403, headers: corsHeaders });
                }
            } else {
                console.warn('Headers x-signature ou x-request-id ausentes. Prosseguindo sem validação.');
            }
        }

        const start_time = new Date().toISOString();

        // Check if the webhook is about a payment
        if (payload.action === 'payment.created' || payload.action === 'payment.updated') {
            const paymentId = payload.data.id;

            // Verify payment status with Mercado Pago
            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${mpAccessToken}`
                }
            });

            const paymentData = await mpResponse.json();

            if (paymentData.status === 'approved') {
                const metadata = paymentData.metadata;
                const projectId = metadata.project_id;
                const clientId = metadata.client_id;
                const freelancerId = metadata.freelancer_id;

                const serviceValue = metadata.service_value;
                const platformFee = metadata.platform_fee;
                const platformFeePercentage = metadata.platform_fee_percentage;
                const totalAmount = metadata.total_amount || paymentData.transaction_amount;

                // Create or update contract
                const { data: existingContract } = await supabaseClient
                    .from('contracts')
                    .select('id')
                    .eq('mercadopago_payment_id', String(paymentId))
                    .single();

                if (!existingContract) {
                    const { data: contract, error: contractError } = await supabaseClient
                        .from('contracts')
                        .insert({
                            project_id: projectId,
                            client_id: clientId,
                            freelancer_id: freelancerId,
                            amount: totalAmount, // For legacy compatibility
                            service_value: serviceValue,
                            platform_fee: platformFee,
                            platform_fee_percentage: platformFeePercentage,
                            total_amount: totalAmount,
                            mercadopago_payment_id: String(paymentId),
                            mercadopago_status: 'approved',
                            status: 'in_progress',
                            accepted_at: new Date().toISOString()
                        })
                        .select()
                        .single();

                    if (contractError) {
                        console.error('Error creating contract:', contractError);
                        throw contractError;
                    }

                    // 1. Log Transaction for Audit
                    await supabaseClient.from('transactions').insert({
                        contract_id: contract.id,
                        user_id: clientId,
                        type: 'payment',
                        amount: totalAmount,
                        status: 'completed',
                        mp_transaction_id: String(paymentId)
                    });

                    // 2. Log Platform Revenue (The Fee part)
                    await supabaseClient.from('platform_revenue').insert({
                        contract_id: contract.id,
                        fee_amount: platformFee,
                        fee_percentage: platformFeePercentage,
                        service_value: serviceValue
                    });

                    console.log(`Contract ${contract.id} created and transactional data recorded.`);
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
});
