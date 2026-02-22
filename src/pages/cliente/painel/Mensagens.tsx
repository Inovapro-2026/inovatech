import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, Send, Paperclip, MoreVertical, Check, CheckCheck, Image as ImageIcon, FileText, Smile, Phone, Video, Search as SearchIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import { RefreshCcw, Loader2 } from 'lucide-react';

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedConvRef = useRef<any>(null);
    const isFetchingRef = useRef(false);
    const isVisible = usePageVisibility();

    // Sincroniza o ref com o estado para o realtime
    useEffect(() => {
        selectedConvRef.current = selectedConversation;
    }, [selectedConversation]);

    // Gerenciamento de Realtime Robusto para Atualização Global e de Chat Ativo
    const handleGlobalNewMessage = (newMsg: any) => {
        const currentConv = selectedConvRef.current;

        // Se houver uma conversa selecionada e a mensagem pertencer a ela
        if (
            currentConv &&
            ((newMsg.sender_id === user?.id && newMsg.receiver_id === currentConv.id) ||
                (newMsg.sender_id === currentConv.id && newMsg.receiver_id === user?.id))
        ) {
            setMessages(prev => {
                if (prev.some((m: any) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });

            if (newMsg.sender_id !== user?.id) {
                markAsRead(currentConv.id);
            }
        }

        // Atualiza a lista de conversas (ex: última mensagem, unread_count)
        fetchConversations(true);
    };

    const { reconnect: reconnectGlobal } = useChatRealtime(user?.id, handleGlobalNewMessage);

    useEffect(() => {
        if (user) {
            const checkAuthAndFetch = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                fetchConversations();
            };
            checkAuthAndFetch();
        }
    }, [user, retryCount]);

    useEffect(() => {
        const handleFocus = () => {
            console.log("Chat focado - verificando novidades...");
            fetchConversations(true);
            if (selectedConvRef.current) {
                fetchMessages(selectedConvRef.current.id);
            }
        };

        if (isVisible) {
            reconnectGlobal();
            handleFocus();
        }

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [isVisible]);

    // Timeout de segurança
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loadingConversations) {
                console.warn("Timeout de carregamento do chat (cliente)");
                setLoadingConversations(false);
                if (conversations.length === 0) {
                    setError("O carregamento está demorando. Tente atualizar a página.");
                }
            }
        }, 15000);
        return () => clearTimeout(timer);
    }, [loadingConversations]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            markAsRead(selectedConversation.id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const markAsRead = async (freelancerId: string) => {
        if (!user?.id) return;
        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('receiver_id', user.id)
                .eq('sender_id', freelancerId)
                .eq('is_read', false);
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    const fetchConversations = async (silent = false) => {
        if (!user?.id || isFetchingRef.current) {
            if (!user?.id) setLoadingConversations(false);
            return;
        }

        try {
            isFetchingRef.current = true;
            if (!silent) setLoadingConversations(true);

            // Tenta buscar com colunas completas (type, file_url, etc)
            let { data: allMessages, error: msgError } = await supabase
                .from('messages')
                .select('id, content, created_at, is_read, sender_id, receiver_id')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (msgError) {
                console.warn("Algumas colunas faltam no banco, tentando modo de compatibilidade...");
                const fallback = await supabase
                    .from('messages')
                    .select('id, content, created_at, is_read, sender_id')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });
                allMessages = fallback.data;
            }

            // Busca os contratos do usuário para enriquecer as conversas com info de projetos
            const { data: contracts } = await supabase
                .from('contracts')
                .select('id, freelancer_id, project:projects(title)')
                .eq('client_id', user.id);

            // Mapeia mensagens para conversas únicas baseadas no outro usuário
            const convMap = new Map();

            (allMessages || []).forEach((msg: any) => {
                let otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

                // Fallback agressivo: se não tem receiver_id, tenta pelo contract_id (se a coluna existir no objeto)
                if (!otherUserId && msg.contract_id) {
                    const contract = contracts?.find(c => c.id === msg.contract_id);
                    if (contract) {
                        otherUserId = contract.freelancer_id;
                    }
                }

                // Se ainda assim não achou (ex: mensagem de teste sem nada), ignora apenas essa mensagem
                if (!otherUserId) {
                    console.log("Mensagem ignorada por falta de vínculo:", msg.id);
                    return;
                }

                if (!convMap.has(otherUserId)) {
                    // Tenta encontrar um contrato com esse freelancer
                    const contract = contracts?.find(c => c.freelancer_id === otherUserId || c.id === msg.contract_id);

                    convMap.set(otherUserId, {
                        id: otherUserId,
                        freelancer: { id: otherUserId, full_name: 'Usuário Inovapro', avatar_url: null },
                        project: contract?.project || { title: 'Dúvida Marketplace' },
                        last_message: msg,
                        unread_count: (msg.receiver_id === user.id && !msg.is_read) ? 1 : 0
                    });
                } else {
                    if (msg.receiver_id === user.id && !msg.is_read) {
                        const existing = convMap.get(otherUserId);
                        existing.unread_count += 1;
                    }
                }
            });

            // Enriquecer com dados dos perfis em uma chamada separada se necessário
            const otherUserIds = Array.from(convMap.keys());
            if (otherUserIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', otherUserIds);

                profiles?.forEach(profile => {
                    const conv = convMap.get(profile.id);
                    if (conv) {
                        conv.freelancer = profile;
                    }
                });
            }

            const sortedConversations = Array.from(convMap.values());
            setConversations(sortedConversations);
            setError(null);

            if (sortedConversations.length > 0 && !selectedConversation) {
                setSelectedConversation(sortedConversations[0]);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setError("Falha ao carregar conversas.");
        } finally {
            isFetchingRef.current = false;
            setLoadingConversations(false);
        }
    };

    const fetchMessages = async (freelancerId: string) => {
        if (!user?.id) return;
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${freelancerId}),and(sender_id.eq.${freelancerId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        fetchConversations();
    };

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const content = newMessage.trim();
        setNewMessage('');

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user!.id,
                    receiver_id: selectedConversation.id,
                    content: content
                });

            if (error) throw error;
        } catch (error: any) {
            toast.error("Erro ao enviar mensagem: " + error.message);
            setNewMessage(content);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedConversation) return;

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
                    receiver_id: selectedConversation.id,
                    content: `📦 Arquivo enviado: ${file.name}`,
                    file_url: publicUrl,
                    type: fileType
                });

            if (msgError) throw msgError;
            toast.success("Arquivo enviado com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao enviar arquivo. Verifique se o bucket existe.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.freelancer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.project?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout type="client">
            <div className="h-[calc(100vh-10rem)] flex bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Conversations Sidebar */}
                <div className="w-full sm:w-80 md:w-[400px] flex-shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/30">
                    <div className="p-6 border-b border-slate-100 bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-black text-2xl text-slate-900 tracking-tight">Conversas</h2>
                            <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-3 py-1">
                                {conversations.reduce((acc, curr) => acc + curr.unread_count, 0)} novas
                            </Badge>
                        </div>
                        <div className="relative group">
                            <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Filtrar por nome ou projeto..."
                                className="pl-11 h-12 bg-slate-100/50 border-none rounded-2xl focus-visible:ring-primary/20 transition-all font-medium text-slate-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        {loadingConversations ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 p-2 animate-pulse">
                                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                                        <div className="flex-1 space-y-2 mt-1">
                                            <div className="h-4 w-1/2 bg-slate-200 rounded" />
                                            <div className="h-3 w-3/4 bg-slate-100 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="p-4 bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                                    <RefreshCcw className="w-8 h-8 text-red-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-800 tracking-tight">Ops! Algo falhou</p>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{error}</p>
                                </div>
                                <Button
                                    onClick={handleRetry}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100"
                                >
                                    Tentar Novamente
                                </Button>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-12 text-center">
                                <Search className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">Nenhum resultado</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {filteredConversations.map((conv) => {
                                    const isSelected = selectedConversation?.id === conv.id;
                                    const lastMsg = conv.last_message;
                                    const time = lastMsg ? formatDistanceToNow(new Date(lastMsg.created_at), { locale: ptBR, addSuffix: false }) : '';

                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv)}
                                            className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 relative group ${isSelected
                                                ? 'bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100'
                                                : 'hover:bg-white/60 hover:translate-x-1'
                                                }`}
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                                                    <AvatarImage src={conv.freelancer?.avatar_url} />
                                                    <AvatarFallback>{conv.freelancer?.full_name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {conv.unread_count > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className={`font-black tracking-tight truncate pr-2 ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                                                        {conv.freelancer?.full_name}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{time}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                    {lastMsg?.sender_id === user?.id && <CheckCheck className="w-3 h-3 text-slate-300 shrink-0" />}
                                                    <p className={`text-xs truncate ${conv.unread_count > 0 ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                                                        {lastMsg?.content || "Nenhuma mensagem ainda"}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center gap-1">
                                                    <Badge variant="outline" className="text-[8px] h-4 px-1 leading-none uppercase font-black border-slate-200 text-slate-400 bg-slate-50">
                                                        {conv.project?.title}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Chat Panel */}
                <div className="flex-1 flex flex-col bg-white relative">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="h-20 px-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="w-11 h-11 border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                                            <AvatarImage src={selectedConversation.freelancer?.avatar_url} />
                                            <AvatarFallback>{selectedConversation.freelancer?.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
                                            {selectedConversation.freelancer?.full_name}
                                            <Badge className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0 border-none">FREELANCER</Badge>
                                        </h3>
                                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 italic">
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            Trabalhando em: {selectedConversation.project?.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary rounded-xl h-10 w-10">
                                        <Phone className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary rounded-xl h-10 w-10">
                                        <Video className="w-5 h-5" />
                                    </Button>
                                    <div className="w-px h-6 bg-slate-100 mx-2" />
                                    <Button variant="ghost" size="icon" className="text-slate-400 rounded-xl h-10 w-10">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <ScrollArea className="flex-1 bg-slate-50/50">
                                <div className="p-8 space-y-6">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-20 px-10">
                                            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                                                <Smile className="w-10 h-10 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-800 mb-2">Inicie uma nova jornada!</h3>
                                            <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">
                                                Dê o primeiro passo e alinhe os detalhes do projeto com seu freelancer.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-center">
                                                <Badge variant="outline" className="text-[10px] font-black tracking-widest bg-white/50 border-slate-100 text-slate-400 uppercase py-1 px-4 rounded-full">
                                                    Começo da conversa
                                                </Badge>
                                            </div>
                                            {messages.map((msg, i) => {
                                                const isMe = msg.sender_id === user?.id;

                                                return (
                                                    <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group/msg animate-in slide-in-from-bottom-2 duration-300`}>
                                                        <div className={`max-w-[85%] sm:max-w-[70%] relative group`}>
                                                            <div className={`rounded-3xl px-6 py-4 shadow-sm border ${isMe
                                                                ? 'bg-slate-900 border-slate-800 text-white rounded-tr-sm'
                                                                : 'bg-white border-slate-100 text-slate-800 rounded-tl-sm'
                                                                }`}>
                                                                {msg.type === 'image' && msg.file_url && (
                                                                    <div className="mb-3 rounded-xl overflow-hidden shadow-md">
                                                                        <img src={msg.file_url} alt="anexo" className="max-h-60 w-full object-cover cursor-pointer hover:scale-105 transition-transform" />
                                                                    </div>
                                                                )}
                                                                {msg.type === 'file' && msg.file_url && (
                                                                    <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-3 rounded-2xl mb-2 border transition-colors ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                                                        }`}>
                                                                        <div className={`p-2 rounded-xl scale-90 ${isMe ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                                                            <FileText className="w-5 h-5" />
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-xs font-black truncate">{msg.content.replace('📦 Arquivo enviado: ', '')}</p>
                                                                            <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Clique para baixar</p>
                                                                        </div>
                                                                    </a>
                                                                )}
                                                                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                            </div>

                                                            <div className={`flex items-center gap-2 mt-2 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                                <span className="text-[10px] font-black text-slate-400">
                                                                    {format(new Date(msg.created_at), 'HH:mm')}
                                                                </span>
                                                                {isMe && (
                                                                    msg.is_read ? <CheckCheck className="w-3.5 h-3.5 text-primary" /> : <Check className="w-3.5 h-3.5 text-slate-300" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-8 bg-white/80 backdrop-blur-md border-t border-slate-100 z-20">
                                <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-end gap-3 group/form">
                                    <div className="flex gap-1 mb-1">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={isUploading}
                                            className="shrink-0 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl h-12 w-12 transition-all active:scale-90"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Paperclip className={`w-5 h-5 ${isUploading ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>

                                    <div className="flex-1 relative">
                                        <Textarea
                                            placeholder="Descreva aqui sua mensagem..."
                                            className="flex-1 w-full border-none bg-slate-100/60 rounded-3xl resize-none h-14 min-h-[56px] max-h-48 py-4 px-6 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium text-slate-700 placeholder:text-slate-400 scrollbar-none"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary rounded-full transition-colors h-8 w-8"
                                        >
                                            <Smile className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim() || isUploading}
                                        className="shrink-0 rounded-2xl h-14 w-14 bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95 group/send group-disabled/form:opacity-50"
                                    >
                                        <Send className="w-5 h-5 -ml-1 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Button>
                                </form>
                                <p className="text-center text-[10px] uppercase font-black tracking-[0.2em] text-slate-300 mt-4 animate-pulse">
                                    Segurança InovaPro: Todas as mensagens são criptografadas
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-12 text-center border-l border-slate-100">
                            <div className="relative mb-10 group">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-1000" />
                                <div className="w-40 h-40 bg-white rounded-[40px] shadow-2xl flex items-center justify-center relative transform perspective-1000 group-hover:rotate-y-12 transition-transform duration-500">
                                    <MoreVertical className="w-12 h-12 text-slate-200 rotate-90" />
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                                        <Send className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Centro de Mensagens</h2>
                            <p className="text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
                                Conecte-se instantaneamente com os melhores freelancers do Brasil. Escolha uma conversa ao lado para retomar seus projetos.
                            </p>
                            <div className="mt-10 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                    <p className="text-xl font-black text-slate-800">100%</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seguro</p>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                    <p className="text-xl font-black text-slate-800">Real-time</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chat</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
