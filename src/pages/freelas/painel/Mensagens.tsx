import { useEffect, useState, useRef } from 'react';
import { FreelasLayout } from '@/components/layout/freelas/FreelasLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send, Paperclip, CheckCheck, Loader2, MessageSquareOff, RefreshCcw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import { toast } from 'sonner';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    file_url?: string;
    type?: 'image' | 'file' | 'text';
    created_at: string;
}

interface Conversation {
    client_id: string;
    client_name: string;
    client_avatar: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

export default function FreelasMensagens() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeConversationRef = useRef<Conversation | null>(null);
    const isFetchingRef = useRef(false);
    const isVisible = usePageVisibility();

    // Sincroniza o ref com o estado para o realtime
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    // Gerenciamento de Realtime com Hook Robusto
    const handleNewMessage = (newMsg: Message) => {
        // Verifica se a mensagem pertence ao usuário atual
        if (newMsg.sender_id !== user?.id && newMsg.receiver_id !== user?.id) return;

        // Se for conversa ativa, atualiza mensagens
        const currentActive = activeConversationRef.current;
        if (
            currentActive &&
            ((newMsg.sender_id === user?.id && newMsg.receiver_id === currentActive.client_id) ||
                (newMsg.sender_id === currentActive.client_id && newMsg.receiver_id === user?.id))
        ) {
            setMessages(prev => {
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
            if (newMsg.receiver_id === user?.id) {
                markAsRead(currentActive.client_id);
            }
        }

        // Atualiza lista de conversas
        fetchConversations(true);
    };

    const { reconnect } = useChatRealtime(user?.id, handleNewMessage);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const checkAuthAndFetch = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.warn("Sessão não encontrada no chat");
                return;
            }
            fetchConversations();
        };

        checkAuthAndFetch();
    }, [user, retryCount]);

    // Timeout de segurança para evitar loading infinito
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("Timeout de carregamento do chat");
                setLoading(false);
                if (conversations.length === 0) {
                    setError("O carregamento está demorando mais que o esperado. Verifique sua conexão.");
                }
            }
        }, 12000);
        return () => clearTimeout(timer);
    }, [loading]);

    // Refetch ao voltar para a aba ou ganhar foco
    useEffect(() => {
        const handleFocus = () => {
            console.log("Chat focado - verificando novidades...");
            fetchConversations(true);
            if (activeConversationRef.current) {
                fetchMessages(activeConversationRef.current.client_id);
            }
        };

        if (isVisible) {
            reconnect();
            handleFocus();
        }

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [isVisible]);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.client_id);
            markAsRead(activeConversation.client_id);
        }
    }, [activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async (silent = false) => {
        if (!user?.id || isFetchingRef.current) {
            if (!user?.id) setLoading(false);
            return;
        }

        try {
            isFetchingRef.current = true;
            if (!silent) setLoading(true);
            console.log("Buscando conversas para o usuário:", user.id);
            let query = supabase
                .from('messages')
                .select('id, content, created_at, is_read, sender_id, receiver_id, type, file_url')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            let { data, error } = await query;

            // Fallback se colunas do marketplace estiverem faltando
            if (error && error.code === '42703') {
                console.warn("Colunas type/file_url não encontradas no Freelas, tentando básica...");
                const basicQuery = await supabase
                    .from('messages')
                    .select('id, content, created_at, is_read, sender_id, receiver_id')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });
                data = basicQuery.data;
                error = basicQuery.error;
            }

            if (error) {
                console.error("Erro ao buscar mensagens para conversas:", error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.log("Nenhuma mensagem encontrada.");
                setConversations([]);
                setLoading(false);
                return;
            }

            // Group into conversations manually
            const convosMap = new Map<string, Conversation>();

            data.forEach((msg: any) => {
                const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

                if (!otherUserId) return;

                if (!convosMap.has(otherUserId)) {
                    convosMap.set(otherUserId, {
                        client_id: otherUserId,
                        client_name: 'Cliente Inovapro',
                        client_avatar: '',
                        last_message: msg.content,
                        last_message_time: msg.created_at,
                        unread_count: (msg.receiver_id === user.id && !msg.is_read) ? 1 : 0
                    });
                } else {
                    const existing = convosMap.get(otherUserId)!;
                    if (msg.receiver_id === user.id && !msg.is_read) {
                        existing.unread_count += 1;
                    }
                }
            });

            // Enriquecer com dados dos perfis
            const otherUserIds = Array.from(convosMap.keys());
            if (otherUserIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', otherUserIds);

                profiles?.forEach(profile => {
                    const conv = convosMap.get(profile.id);
                    if (conv) {
                        conv.client_name = profile.full_name || 'Cliente Inovapro';
                        conv.client_avatar = profile.avatar_url || '';
                    }
                });
            }

            const sortedConversations = Array.from(convosMap.values());
            console.log("Conversas formatadas:", sortedConversations.length);
            setConversations(sortedConversations);
            setError(null);
        } catch (err: any) {
            console.error("Erro fatal fetchConversations:", err);
            setError("Não foi possível carregar as conversas.");
            toast.error("Erro de conexão com o servidor de mensagens.");
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    };

    const fetchMessages = async (clientId: string) => {
        if (!user?.id) return;

        try {
            console.log("Buscando histórico com:", clientId);
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${clientId}),and(sender_id.eq.${clientId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            console.log("Mensagens carregadas:", data?.length);
            setMessages(data || []);
        } catch (err) {
            console.error("Erro fetchMessages:", err);
        }
    };

    const markAsRead = async (clientId: string) => {
        if (!user?.id) return;
        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('receiver_id', user.id)
                .eq('sender_id', clientId)
                .eq('is_read', false);

            setConversations(prev => prev.map(c => c.client_id === clientId ? { ...c, unread_count: 0 } : c));
        } catch (err) {
            console.error("Erro markAsRead:", err);
        }
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        fetchConversations();
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConversation || !user) return;
        setSending(true);

        try {
            // Create message in DB
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: activeConversation.client_id,
                    content: newMessage,
                    is_read: false
                });

            if (error) throw error;
            setNewMessage('');
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !activeConversation) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${user!.id}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('chat_attachments')
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('chat_attachments')
                .getPublicUrl(filePath);

            const fileType = file.type.startsWith('image/') ? 'image' : 'file';

            // Insert message with file
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    sender_id: user!.id,
                    receiver_id: activeConversation.client_id,
                    content: `📦 Arquivo enviado: ${file.name}`,
                    file_url: publicUrl,
                    type: fileType
                });

            if (msgError) throw msgError;
        } catch (error: any) {
            console.error(error);
            alert("Erro ao enviar arquivo. Verifique se o bucket existe.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <FreelasLayout>
            <div className="flex flex-col h-[calc(100vh-8rem)]">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Mensagens 💬</h1>

                <div className="flex flex-1 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm">

                    {/* Sidebar de Conversas */}
                    <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col border-r border-slate-200 bg-slate-50">
                        <div className="p-4 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar cliente..."
                                    className="pl-9 h-10 w-full bg-white border-slate-200 rounded-xl focus-visible:ring-teal-500"
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-2">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                                    <p className="text-xs text-slate-400 font-medium animate-pulse">Sincronizando mensagens...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                                    <div className="p-4 bg-red-50 rounded-full">
                                        <RefreshCcw className="w-8 h-8 text-red-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-700">Ops! Algo deu errado</p>
                                        <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
                                    </div>
                                    <Button
                                        onClick={handleRetry}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-slate-200 hover:bg-slate-100 font-bold"
                                    >
                                        Tentar Novamente
                                    </Button>
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="text-center p-8 text-slate-500">
                                    <MessageSquareOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Nenhuma conversa encontrada</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {conversations.map((conv) => (
                                        <div
                                            key={conv.client_id}
                                            onClick={() => setActiveConversation(conv)}
                                            className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-colors ${activeConversation?.client_id === conv.client_id
                                                ? 'bg-teal-50 border border-teal-100 shadow-sm'
                                                : 'hover:bg-slate-100 border border-transparent'
                                                }`}
                                        >
                                            <div className="relative">
                                                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                                    <AvatarImage src={conv.client_avatar} />
                                                    <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">{conv.client_name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {/* Online Status Mock */}
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className="font-bold text-slate-900 text-sm truncate">{conv.client_name}</h4>
                                                    <span className="text-xs font-semibold text-slate-400">{conv.last_message_time}</span>
                                                </div>
                                                <p className={`text-xs truncate ${conv.unread_count > 0 ? 'font-extrabold text-slate-900' : 'text-slate-500'}`}>
                                                    {conv.last_message}
                                                </p>
                                            </div>

                                            {conv.unread_count > 0 && (
                                                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm mt-1">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Área de Chat Ativo */}
                    <div className="hidden md:flex flex-1 flex-col bg-slate-50/50 relative">
                        {activeConversation ? (
                            <>
                                {/* Header do Chat */}
                                <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 border-2 border-emerald-100">
                                            <AvatarImage src={activeConversation.client_avatar} />
                                            <AvatarFallback className="bg-teal-100 text-teal-700 font-bold">{activeConversation.client_name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-extrabold text-slate-900 text-sm">{activeConversation.client_name}</h3>
                                            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online agora
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="h-9 px-4 rounded-xl text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-semibold text-sm">Ver Perfil</Button>
                                </div>

                                {/* Histórico */}
                                <ScrollArea className="flex-1 p-6 z-0">
                                    <div className="space-y-6">
                                        {messages.map((msg, idx) => {
                                            const isMine = msg.sender_id === user?.id;
                                            return (
                                                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm relative ${isMine
                                                        ? 'bg-teal-600 text-white rounded-br-sm'
                                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                                                        }`}>
                                                        {msg.type === 'image' && msg.file_url && (
                                                            <div className="mb-2 rounded-xl overflow-hidden shadow-sm">
                                                                <img src={msg.file_url} alt="anexo" className="max-h-60 w-full object-cover cursor-pointer hover:scale-105 transition-transform" />
                                                            </div>
                                                        )}
                                                        {msg.type === 'file' && msg.file_url && (
                                                            <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-3 rounded-xl mb-2 border transition-colors ${isMine ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                                                                <div className={`p-2 rounded-lg ${isMine ? 'bg-white/20' : 'bg-teal-50 text-teal-600'}`}>
                                                                    <Paperclip className="w-4 h-4" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[10px] font-black truncate">{msg.content.replace('📦 Arquivo enviado: ', '')}</p>
                                                                    <p className="text-[9px] opacity-60 uppercase font-black">Baixar</p>
                                                                </div>
                                                            </a>
                                                        )}
                                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] font-semibold text-slate-400">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMine && (
                                                            <CheckCheck className={`w-3 h-3 ${msg.is_read ? 'text-blue-500' : 'text-slate-300'}`} />
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-slate-200 z-10">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={isUploading}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="shrink-0 h-12 w-12 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                        >
                                            <Paperclip className={`w-5 h-5 ${isUploading ? 'animate-spin' : ''}`} />
                                        </Button>
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                                            placeholder="Digite sua mensagem para o cliente..."
                                            className="h-12 flex-1 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-teal-500 placeholder:text-slate-400 font-medium px-4"
                                        />
                                        <Button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim() || sending}
                                            className="shrink-0 h-12 w-12 rounded-xl shadow-md bg-teal-600 hover:bg-teal-700 text-white"
                                        >
                                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                                <MessageSquareOff className="w-16 h-16 mb-4 opacity-30 text-teal-600" />
                                <h3 className="font-bold text-lg text-slate-600 mb-1">Selecione uma conversa</h3>
                                <p className="text-sm">Clique em um contato na barra lateral para iniciar o atendimento.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </FreelasLayout>
    );
}
