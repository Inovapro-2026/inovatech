import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format, formatDistanceToNow, differenceInDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Briefcase, Calendar, Search, Clock, MessageSquare, ExternalLink, ChevronRight, Send, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ServicesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [contracts, setContracts] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');

    const [selectedContract, setSelectedContract] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mini-chat state in modal
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        fetchContracts();

        // Realtime subscription
        const channel = supabase
            .channel('contracts_updates')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'contracts', filter: `client_id=eq.${user.id}` },
                () => fetchContracts()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    useEffect(() => {
        if (selectedContract && isModalOpen) {
            fetchContractDetails(selectedContract.id);
            subscribeToContractMessages(selectedContract.id);
        }
    }, [selectedContract, isModalOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('contracts')
                .select(`
                    *,
                    project:projects (
                        title,
                        cover_image_url,
                        category
                    ),
                    freelancer:profiles!freelancer_id (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('client_id', user!.id)
                .in('status', ['pending_acceptance', 'in_progress'])
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            setContracts(data || []);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            toast.error('Erro ao carregar os serviços');
        } finally {
            setLoading(false);
        }
    };

    const fetchContractDetails = async (contractId: string) => {
        try {
            // Fetch messages
            const { data: msgData } = await supabase
                .from('messages')
                .select('*')
                .eq('contract_id', contractId)
                .order('created_at', { ascending: true });

            setMessages(msgData || []);

            // Fetch deliveries for timeline
            const { data: delData } = await supabase
                .from('deliveries')
                .select('*')
                .eq('contract_id', contractId)
                .order('created_at', { ascending: true });

            setDeliveries(delData || []);
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    const subscribeToContractMessages = (contractId: string) => {
        const channel = supabase
            .channel(`contract_chat_${contractId}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `contract_id=eq.${contractId}` },
                (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedContract) return;

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    contract_id: selectedContract.id,
                    sender_id: user!.id,
                    receiver_id: selectedContract.freelancer_id,
                    content: newMessage.trim(),
                    is_read: false
                });

            if (error) throw error;
            setNewMessage('');
        } catch (error) {
            toast.error('Erro ao enviar mensagem');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedContract) return;

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
                    contract_id: selectedContract.id,
                    sender_id: user!.id,
                    receiver_id: selectedContract.freelancer_id,
                    content: `📦 Arquivo enviado: ${file.name}`,
                    file_url: publicUrl,
                    type: fileType,
                    is_read: false
                });

            if (msgError) throw msgError;
            toast.success("Arquivo enviado com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao enviar arquivo.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCancelContract = async (contractId: string) => {
        try {
            const { error } = await supabase
                .from('contracts')
                .update({ status: 'cancelled_refunded' })
                .eq('id', contractId);

            if (error) throw error;
            toast.success('Contrato cancelado com sucesso');
            setIsModalOpen(false);
            fetchContracts();
        } catch (error) {
            toast.error('Erro ao cancelar contrato');
        }
    };

    const filteredContracts = contracts.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending_acceptance':
                return { label: 'Aguardando Aceite', class: 'bg-amber-100 text-amber-700 border-amber-200' };
            case 'in_progress':
                return { label: 'Em Andamento', class: 'bg-blue-100 text-blue-700 border-blue-200' };
            default:
                return { label: status, class: 'bg-slate-100 text-slate-700' };
        }
    };

    const getDeadlineInfo = (deadline: string | null, createdAt: string) => {
        const targetDate = deadline ? new Date(deadline) : null;
        if (!targetDate) return { text: 'A definir', color: 'text-slate-500' };

        const daysRemaining = differenceInDays(targetDate, new Date());
        const isPast = isAfter(new Date(), targetDate);

        if (isPast) return { text: 'Atrasado', color: 'text-red-600 font-bold' };
        if (daysRemaining <= 2) return { text: `${daysRemaining} dias restantes`, color: 'text-orange-600 font-semibold' };
        return { text: `${daysRemaining} dias restantes`, color: 'text-emerald-600' };
    };

    return (
        <DashboardLayout type="client">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Serviços Fechados</h1>
                        <Badge className="bg-primary hover:bg-primary-light">
                            {contracts.length}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Acompanhe o andamento dos projetos que você contratou.
                    </p>
                </div>
                <Button asChild className="mt-4 sm:mt-0 font-semibold bg-primary hover:bg-primary-light text-primary-foreground rounded-xl shadow-md transition-all hover:scale-105">
                    <Link to="/marketplace">
                        <Search className="w-4 h-4 mr-2" />
                        Explorar Talentos
                    </Link>
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                <Button
                    variant={filter === 'all' ? "default" : "outline"}
                    onClick={() => setFilter('all')}
                    className={`rounded-full px-6 transition-all ${filter === 'all' ? 'shadow-md' : 'hover:bg-slate-50'}`}
                >
                    Todos
                </Button>
                <Button
                    variant={filter === 'in_progress' ? "default" : "outline"}
                    onClick={() => setFilter('in_progress')}
                    className={`rounded-full px-6 transition-all ${filter === 'in_progress' ? 'shadow-md shadow-blue-100' : 'hover:bg-slate-50'}`}
                >
                    Em Andamento
                </Button>
                <Button
                    variant={filter === 'pending_acceptance' ? "default" : "outline"}
                    onClick={() => setFilter('pending_acceptance')}
                    className={`rounded-full px-6 transition-all ${filter === 'pending_acceptance' ? 'shadow-md shadow-amber-100' : 'hover:bg-slate-50'}`}
                >
                    Aguardando Aceite
                </Button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[400px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                    ))}
                </div>
            ) : filteredContracts.length === 0 ? (
                <div className="text-center py-20 px-4 border border-dashed rounded-3xl bg-slate-50/50 backdrop-blur-sm">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Você ainda não fechou nenhum serviço</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        Explore nossa vitrine de talentos e encontre o profissional ideal para o seu projeto.
                    </p>
                    <Button asChild className="rounded-xl px-8 py-6 h-auto text-lg font-semibold bg-primary hover:bg-primary-light">
                        <Link to="/marketplace">Explorar Vitrine</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContracts.map((contract) => {
                        const project = contract.projects;
                        const freelancer = contract.freelancer;
                        const deadlineInfo = getDeadlineInfo(contract.deadline, contract.created_at);
                        const status = getStatusStyle(contract.status);

                        return (
                            <div key={contract.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
                                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                    <div className="absolute top-3 left-3 z-10 flex gap-2">
                                        <Badge className="bg-white/90 text-slate-900 backdrop-blur-md border shadow-sm">
                                            {project?.category || 'Geral'}
                                        </Badge>
                                        <Badge className={`${status.class} border shadow-sm`}>
                                            {status.label}
                                        </Badge>
                                    </div>
                                    <div className="absolute top-3 right-3 z-10">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/marketplace/painel/mensagens');
                                            }}
                                        >
                                            <MessageSquare className="w-4 h-4 text-slate-700" />
                                        </Button>
                                    </div>
                                    {project?.cover_image_url ? (
                                        <img
                                            src={project.cover_image_url}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                            <Briefcase className="w-12 h-12 text-slate-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <h3 className="font-bold text-lg leading-snug line-clamp-2 text-slate-800 group-hover:text-primary transition-colors">
                                            {project?.title || 'Projeto sem título'}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <Avatar className="w-9 h-9 border-2 border-white shadow-sm shrink-0">
                                            <AvatarImage src={freelancer?.avatar_url} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{freelancer?.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 font-medium">Freelancer</p>
                                            <p className="text-sm font-bold text-slate-700 truncate">Por {freelancer?.full_name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Início
                                            </span>
                                            <p className="text-xs font-bold text-slate-700">
                                                {contract.accepted_at ? format(new Date(contract.accepted_at), 'dd/MM/yyyy') : 'Aguardando'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Prazo
                                            </span>
                                            <p className={`text-xs font-bold ${deadlineInfo.color}`}>
                                                {deadlineInfo.text}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Valor total</p>
                                            <p className="font-black text-lg text-primary">
                                                R$ {Number(contract.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-full px-4 h-9 font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border-none shadow-sm"
                                            onClick={() => {
                                                setSelectedContract(contract);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Acompanhar
                                            <ChevronRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Detalhes */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[800px] h-[90vh] sm:h-auto max-h-[95vh] p-0 overflow-hidden flex flex-col rounded-3xl border-none shadow-2xl">
                    <DialogHeader className="p-6 pb-4 bg-white border-b shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold line-clamp-1">{selectedContract?.projects?.title}</DialogTitle>
                                    <p className="text-sm text-slate-500">ID do Contrato: #{selectedContract?.id?.slice(0, 8)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={`${selectedContract && getStatusStyle(selectedContract.status).class} border-none px-4 py-1.5 rounded-full text-xs font-bold`}>
                                    {selectedContract && getStatusStyle(selectedContract.status).label}
                                </Badge>
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/marketplace/painel/mensagens')}>
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Coluna 1: Info e Timeline */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Freelancer</p>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6 border">
                                                <AvatarImage src={selectedContract?.freelancer?.avatar_url} />
                                                <AvatarFallback>{selectedContract?.freelancer?.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-sm font-bold text-slate-700 truncate">{selectedContract?.freelancer?.full_name}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Valor</p>
                                        <p className="text-sm font-bold text-primary">R$ {Number(selectedContract?.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Início</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedContract?.created_at ? format(new Date(selectedContract.created_at), 'dd/MM/yyyy') : '--'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Prazo Final</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedContract?.deadline ? format(new Date(selectedContract.deadline), 'dd/MM/yyyy') : 'A definir'}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Linha do Tempo</h4>

                                    <div className="relative pl-8 space-y-8">
                                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />

                                        {/* Step 1: Created */}
                                        <div className="relative translate-z-0">
                                            <div className="absolute -left-[32px] w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Contrato Criado</p>
                                                <p className="text-xs text-slate-500">
                                                    {selectedContract && format(new Date(selectedContract.created_at), "dd/MM 'às' HH:mm")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Step 2: Payment */}
                                        <div className="relative">
                                            <div className="absolute -left-[32px] w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Pagamento Confirmado</p>
                                                <p className="text-xs text-slate-500">
                                                    Escrow ativo. O valor está seguro.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Step 3: Accepted */}
                                        <div className="relative">
                                            <div className={`absolute -left-[32px] w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${selectedContract?.accepted_at ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                <div className={`w-2 h-2 rounded-full ${selectedContract?.accepted_at ? 'bg-white' : 'bg-slate-300'}`} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${selectedContract?.accepted_at ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    Freelancer Aceitou o Projeto
                                                </p>
                                                {selectedContract?.accepted_at && (
                                                    <p className="text-xs text-slate-500">
                                                        {format(new Date(selectedContract.accepted_at), "dd/MM 'às' HH:mm")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Step 4: Deliveries */}
                                        {deliveries.length > 0 && deliveries.map((delivery, idx) => (
                                            <div key={delivery.id} className="relative">
                                                <div className="absolute -left-[32px] w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm">
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Entrega Realizada #{idx + 1}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {format(new Date(delivery.created_at), "dd/MM 'às' HH:mm")}
                                                    </p>
                                                    {delivery.message && (
                                                        <p className="mt-2 text-xs p-3 rounded-lg bg-blue-50 text-blue-700 italic border border-blue-100">
                                                            "{delivery.message.slice(0, 100)}..."
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Step Final: Conclusion */}
                                        <div className="relative">
                                            <div className={`absolute -left-[32px] w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${selectedContract?.status === 'completed' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                <div className={`w-2 h-2 rounded-full ${selectedContract?.status === 'completed' ? 'bg-white' : 'bg-slate-300'}`} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${selectedContract?.status === 'completed' ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    Projeto Concluído
                                                </p>
                                                {selectedContract?.completed_at && (
                                                    <p className="text-xs text-slate-500">
                                                        {format(new Date(selectedContract.completed_at), "dd/MM 'às' HH:mm")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna 2: Mini Chat */}
                            <div className="flex flex-col h-[500px] border border-slate-200 rounded-3xl overflow-hidden bg-slate-50 shadow-inner">
                                <div className="p-4 bg-white border-b flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <h4 className="text-sm font-bold text-slate-700">Chat com Freelancer</h4>
                                </div>

                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="py-20 text-center space-y-2">
                                                <MessageSquare className="w-10 h-10 text-slate-200 mx-auto" />
                                                <p className="text-xs text-slate-400">Inicie uma conversa sobre este projeto</p>
                                            </div>
                                        ) : (
                                            messages.map((msg, i) => {
                                                const isMe = msg.sender_id === user?.id;
                                                return (
                                                    <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10' : 'bg-white text-slate-700 rounded-tl-none border shadow-sm'}`}>
                                                            {msg.type === 'image' && msg.file_url && (
                                                                <div className="mb-2 rounded-xl overflow-hidden shadow-sm">
                                                                    <img src={msg.file_url} alt="anexo" className="max-h-40 w-full object-cover" />
                                                                </div>
                                                            )}
                                                            {msg.type === 'file' && msg.file_url && (
                                                                <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-xl mb-2 border ${isMe ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-100'}`}>
                                                                    <Paperclip className="w-4 h-4" />
                                                                    <span className="text-[10px] truncate max-w-[100px]">{msg.content.replace('📦 Arquivo enviado: ', '')}</span>
                                                                </a>
                                                            )}
                                                            {msg.content}
                                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-slate-400'}`}>
                                                                {format(new Date(msg.created_at), 'HH:mm')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={scrollRef} />
                                    </div>
                                </ScrollArea>

                                <div className="p-4 bg-white border-t space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Textarea
                                            placeholder="Digite uma mensagem..."
                                            className="min-h-[44px] h-11 py-2.5 resize-none bg-slate-50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
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
                                            size="icon"
                                            className="h-11 w-11 shrink-0 rounded-xl bg-primary hover:bg-primary-light transition-all active:scale-95 shadow-lg shadow-primary/20"
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim()}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={isUploading}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-8 text-[10px] font-bold text-slate-400 hover:text-slate-600 px-2"
                                        >
                                            <Paperclip className={`w-3 h-3 mr-1 ${isUploading ? 'animate-spin' : ''}`} /> {isUploading ? 'Enviando...' : 'Anexar Arquivo'}
                                        </Button>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Inovapro Escrow 🔒</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50/50 border-t flex flex-row items-center justify-between gap-3 shrink-0">
                        <Button
                            variant="outline"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 rounded-xl font-bold transition-colors"
                            onClick={() => {
                                if (confirm('Tem certeza que deseja cancelar este contrato? Esta ação pode ter taxas.')) {
                                    handleCancelContract(selectedContract.id);
                                }
                            }}
                            disabled={selectedContract?.status === 'in_progress'}
                        >
                            Cancelar Contrato
                        </Button>
                        <div className="flex gap-3">
                            <Button variant="outline" className="rounded-xl font-bold" onClick={() => setIsModalOpen(false)}>
                                Fechar
                            </Button>
                            <Button className="bg-primary hover:bg-primary-light rounded-xl font-bold px-8 shadow-lg shadow-primary/20">
                                Contatar Suporte
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
