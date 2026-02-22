
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { serviceValue } = await req.json()

        if (typeof serviceValue !== 'number') {
            throw new Error('Valor do serviço inválido')
        }

        let feePercentage = 0;
        if (serviceValue <= 500) {
            feePercentage = 15;
        } else if (serviceValue <= 2000) {
            feePercentage = 10;
        } else {
            feePercentage = 7;
        }

        const fee = parseFloat((serviceValue * (feePercentage / 100)).toFixed(2));
        const total = parseFloat((serviceValue + fee).toFixed(2));

        return new Response(
            JSON.stringify({
                fee,
                total,
                percentage: feePercentage
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
