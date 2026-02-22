
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useChatRealtime = (userId: string | undefined, onNewMessage: (payload: any) => void) => {
    const channelRef = useRef<RealtimeChannel | null>(null);

    const subscribeToChannel = () => {
        if (!userId) return;

        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        console.log("Iniciando subscrição Realtime para usuário:", userId);

        const channel = supabase
            .channel(`chat-user-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    console.log('Nova mensagem via realtime recebida:', payload);
                    onNewMessage(payload.new);
                }
            )
            .on('system', { event: '*' }, (event: any) => {
                console.log('Evento de sistema Realtime:', event);
                if (event.extension === 'postgres_changes' && event.status === 'SUBSCRIBED') {
                    console.log('Realtime SUBSCRIBED');
                }
            })
            .subscribe((status) => {
                console.log('Status da subscrição Realtime:', status);
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error('Erro/Timeout no canal Realtime, tentando reconectar...');
                    setTimeout(subscribeToChannel, 3000);
                }
            });

        channelRef.current = channel;
    };

    useEffect(() => {
        subscribeToChannel();

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                console.log('Canal Realtime removido no cleanup');
            }
        };
    }, [userId]);

    const reconnect = () => {
        console.log('Forçando reconexão do Realtime...');
        subscribeToChannel();
    };

    return { reconnect };
};
