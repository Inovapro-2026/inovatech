
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
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Cabeçalho de autorização não encontrado. Por favor, faça login novamente.');
        }

        const token = authHeader.replace('Bearer ', '').trim();

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser(token)

        if (userError || !user) {
            throw new Error(`Autenticação falhou: ${userError?.message || 'Sessão inválida ou expirada.'}. Faça login novamente.`);
        }

        const { title, projectId, freelancerId, amount: serviceValue, success_url, cancel_url, back_urls, auto_return } = await req.json();
        console.log(`Iniciando checkout para Projeto: ${projectId}, Valor: ${serviceValue}`);

        let originUrl = req.headers.get('origin');
        if (!originUrl || originUrl === 'null' || originUrl === 'undefined') {
            originUrl = 'https://inovatech.com'; // domain generico seguro fallback
        }

        if (typeof serviceValue !== 'number' || serviceValue <= 0) {
            throw new Error('Valor do serviço inválido ou zerado. Por favor, verifique o preço do projeto.');
        }

        const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN') || 'APP_USR-177791261319351-111320-ac95b05069ed0a2a6916916255393da8-2453606405';
        if (!mpAccessToken) {
            throw new Error('Configuração incompleta: MP_ACCESS_TOKEN não encontrado nas variáveis de ambiente do Supabase.');
        }

        // Fetch user profile for more details
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single();

        // 1. Calculate progressive fee
        let feePercentage = 0;
        if (serviceValue <= 500) {
            feePercentage = 15;
        } else if (serviceValue <= 2000) {
            feePercentage = 10;
        } else {
            feePercentage = 7;
        }

        const feeAmount = parseFloat((serviceValue * (feePercentage / 100)).toFixed(2));
        const totalAmount = parseFloat((serviceValue + feeAmount).toFixed(2));

        const preferenceData = {
            items: [
                {
                    id: projectId,
                    title: `INOVAPRO: ${title}`,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: totalAmount,
                }
            ],
            payer: {
                name: profile?.full_name?.split(' ')[0] || 'Cliente',
                surname: profile?.full_name?.split(' ').slice(1).join(' ') || 'INOVAPRO',
                email: user.email,
            },
            metadata: {
                client_id: user.id,
                project_id: projectId,
                freelancer_id: freelancerId,
                service_value: serviceValue,
                platform_fee: feeAmount,
                platform_fee_percentage: feePercentage,
                total_amount: totalAmount
            },
            external_reference: projectId,
            back_urls: back_urls || {
                success: success_url || `${originUrl}/marketplace/success`,
                failure: cancel_url || `${originUrl}/marketplace/failure`,
                pending: `${originUrl}/marketplace/pending`
            },
            auto_return: auto_return || "approved",
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
            statement_descriptor: "INOVAPRO"
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferenceData)
        });

        const data = await response.json();

        if (data.error || !data.init_point) {
            console.error('Mercado Pago Error:', data);
            throw new Error(data.message || data.error || 'Erro ao criar preferência no Mercado Pago');
        }

        return new Response(
            JSON.stringify({
                url: data.init_point,
                init_point: data.init_point,
                preference_id: data.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Checkout Function Error:', errorMsg);

        // Diagnóstico de ambiente
        const hasUrl = !!Deno.env.get('SUPABASE_URL');
        const hasKey = !!Deno.env.get('SUPABASE_ANON_KEY');
        const hasMP = !!Deno.env.get('MP_ACCESS_TOKEN');
        console.log(`Ambiente OK? URL: ${hasUrl}, Key: ${hasKey}, MP: ${hasMP}`);

        return new Response(
            JSON.stringify({
                error: errorMsg,
                details: error instanceof Error ? error.stack : undefined,
                diagnostics: { hasUrl, hasKey, hasMP }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
});
