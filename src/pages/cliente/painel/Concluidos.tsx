import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, XCircle, FileText, Image as ImageIcon, Briefcase, Star, Search, Clock, RotateCcw, ChevronRight, File, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompletedProjectsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [contracts, setContracts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'delivered' | 'revision_requested' | 'completed'>('delivered');

    // Modal State
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<any>(null);
    const [revisionMessage, setRevisionMessage] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [rating, setRating] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    const handleReview = async () => {
        if (!selectedContract || rating === 0) return;

        try {
            setActionLoading(true);
            const { error } = await supabase.from('reviews').insert({
                contract_id: selectedContract.id,
                reviewer_id: user?.id,
                rated_id: selectedContract.freelancer_id,
                rating: rating,
                comment: reviewComment
            });

            if (error) throw error;

            toast.success("Avaliação enviada com sucesso!");
            setIsReviewOpen(false);
            setRating(0);
            setReviewComment('');
            fetchContracts();
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao enviar avaliação: " + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchContracts();

            // Realtime subscription
            const channel = supabase
                .channel('contracts_concluidos')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'contracts', filter: `client_id=eq.${user.id}` },
                    () => fetchContracts()
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchContracts = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('contracts')
                .select(`
                    *,
                    project:projects(title, cover_image_url),
                    freelancer:profiles!freelancer_id(id, full_name, avatar_url),
                    deliveries(id, message, file_urls, created_at),
                    revisions(id, message, created_at)
                `)
                .eq('client_id', user!.id)
                .in('status', ['delivered', 'revision_requested', 'completed'])
                .order('updated_at', { ascending: false });

            if (error) {
                console.error("Supabase error:", error);
                throw error;
            }
            setContracts(data || []);
        } catch (error) {
            console.error("Error fetching contracts:", error);
            toast.error("Erro ao carregar os dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedContract) return;

        try {
            setActionLoading(true);

            // 1. If rating is provided, save the review first
            if (rating > 0) {
                const { error: reviewError } = await supabase.from('reviews').insert({
                    contract_id: selectedContract.id,
                    reviewer_id: user?.id,
                    rated_id: selectedContract.freelancer_id,
                    rating: rating,
                    comment: reviewComment
                });
                if (reviewError) console.error("Error saving review during approval:", reviewError);
            }

            // 2. Update status and completed_at
            const { error } = await supabase
                .from('contracts')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', selectedContract.id);

            if (error) throw error;

            toast.success("Projeto aprovado! Pagamento liberado ao freelancer.");
            setIsApproveOpen(false);
            setRating(0); // Reset
            setReviewComment(''); // Reset
            fetchContracts();
        } catch (error: any) {
            toast.error("Erro ao aprovar: " + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedContract || !revisionMessage.trim()) return;

        try {
            setActionLoading(true);

            // Insert revision
            const { error: revError } = await supabase
                .from('revisions')
                .insert({
                    contract_id: selectedContract.id,
                    message: revisionMessage,
                    created_by: user!.id
                });

            if (revError) throw revError;

            // Update status
            const { error: conError } = await supabase
                .from('contracts')
                .update({ status: 'revision_requested' })
                .eq('id', selectedContract.id);

            if (conError) throw conError;

            toast.success("Solicitação de ajuste enviada com sucesso.");
            setIsRejectOpen(false);
            setRevisionMessage('');
            fetchContracts();
        } catch (error: any) {
            toast.error("Erro ao solicitar ajuste: " + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredContracts = contracts.filter(c => c.status === activeTab);
    const pendingCount = contracts.filter(c => c.status === 'delivered').length;

    return (
        <DashboardLayout type="client">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Serviços Concluídos</h1>
                        {pendingCount > 0 && (
                            <Badge className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full text-xs font-bold animate-in fade-in zoom-in duration-300">
                                {pendingCount} pendentes
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Entregas prontas para sua revisão e aprovação.
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b mb-8 overflow-x-auto scrollbar-none gap-2">
                <button
                    onClick={() => setActiveTab('delivered')}
                    className={`pb-4 px-6 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-300 flex items-center gap-2 ${activeTab === 'delivered' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <CheckCircle className={`w-4 h-4 ${activeTab === 'delivered' ? 'text-primary' : 'text-slate-300'}`} />
                    Aprovando
                    {pendingCount > 0 && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('revision_requested')}
                    className={`pb-4 px-6 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-300 flex items-center gap-2 ${activeTab === 'revision_requested' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <RotateCcw className={`w-4 h-4 ${activeTab === 'revision_requested' ? 'text-amber-500 font-bold' : 'text-slate-300'}`} />
                    Ajustes Solicitados
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-4 px-6 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-300 flex items-center gap-2 ${activeTab === 'completed' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <Briefcase className={`w-4 h-4 ${activeTab === 'completed' ? 'text-slate-800' : 'text-slate-300'}`} />
                    Histórico
                </button>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2].map(i => (
                        <div key={i} className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl border border-slate-100 bg-white">
                            <Skeleton className="w-full sm:w-48 h-32 rounded-2xl" />
                            <div className="flex-1 space-y-4">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredContracts.length === 0 ? (
                <div className="text-center py-24 px-4 bg-slate-50/50 backdrop-blur-sm border border-dashed rounded-3xl">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        {activeTab === 'delivered' ? <CheckCircle className="w-10 h-10 text-slate-300" /> : <Briefcase className="w-10 h-10 text-slate-300" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {activeTab === 'delivered' ? "Nenhuma entrega pendente" : activeTab === 'revision_requested' ? "Sem pedidos de ajuste" : "Histórico vazio"}
                    </h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        {activeTab === 'delivered' ? "Quando os freelancers entregarem seus projetos, eles aparecerão aqui para sua aprovação." : "Tudo sob controle. Não há registros para exibir nesta categoria agora."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredContracts.map((contract) => {
                        const delivery = contract.deliveries?.[contract.deliveries.length - 1]; // Útima entrega
                        const revision = contract.revisions?.[contract.revisions.length - 1]; // Última revisão

                        return (
                            <div key={contract.id} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 hover:shadow-xl transition-all duration-500 flex flex-col lg:flex-row gap-8 items-stretch group">
                                {/* Thumbnail */}
                                <div className="relative w-full lg:w-48 h-48 lg:h-auto shrink-0 bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                                    {contract.project?.cover_image_url ? (
                                        <img src={contract.project.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Briefcase className="w-12 h-12 text-slate-200" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col py-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{contract.project?.title}</h3>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-5 h-5 border shadow-sm">
                                                        <AvatarImage src={contract.freelancer?.avatar_url} />
                                                        <AvatarFallback>{contract.freelancer?.full_name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-bold text-slate-600">{contract.freelancer?.full_name}</span>
                                                </div>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {activeTab === 'completed'
                                                        ? `Finalizado ${formatDistanceToNow(new Date(contract.completed_at), { locale: ptBR, addSuffix: true })}`
                                                        : `Entregue ${delivery ? formatDistanceToNow(new Date(delivery.created_at), { locale: ptBR, addSuffix: true }) : ''}`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={`px-4 py-1.5 rounded-full border-none text-[10px] font-black tracking-widest uppercase ${activeTab === 'delivered' ? 'bg-purple-100 text-purple-700' :
                                            activeTab === 'revision_requested' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {activeTab === 'delivered' ? 'Aguardando Revisão' :
                                                activeTab === 'revision_requested' ? 'Em Ajuste' : 'Concluído & Pago'}
                                        </Badge>
                                    </div>

                                    <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 p-5 mb-6 shadow-inner">
                                        {activeTab === 'revision_requested' && revision && (
                                            <div className="mb-4 pb-4 border-b border-white/50 space-y-2">
                                                <p className="text-[10px] uppercase font-black text-amber-600 flex items-center gap-1">
                                                    <RotateCcw className="w-3 h-3" /> Sua última solicitação:
                                                </p>
                                                <p className="text-sm text-slate-600 italic">"{revision.message}"</p>
                                            </div>
                                        )}

                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                            {delivery?.message || "O freelancer enviou o trabalho e marcou como pronto para revisão."}
                                        </p>

                                        {delivery?.files_urls && delivery.files_urls.length > 0 && (
                                            <div className="mt-6 flex flex-wrap gap-3">
                                                {delivery.files_urls.slice(0, 4).map((url: string, idx: number) => {
                                                    const isImg = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                                    return (
                                                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="relative h-14 w-14 rounded-xl border border-white shadow-sm overflow-hidden hover:scale-110 transition-transform bg-white flex items-center justify-center group/file">
                                                            {isImg ? (
                                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                            ) : url.toLowerCase().includes('pdf') ? (
                                                                <FileText className="w-6 h-6 text-red-400" />
                                                            ) : (
                                                                <LinkIcon className="w-5 h-5 text-blue-400" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/0 group-hover/file:bg-black/20 transition-colors" />
                                                        </a>
                                                    );
                                                })}
                                                {delivery.files_urls.length > 4 && (
                                                    <div className="h-14 min-w-[56px] px-3 flex items-center justify-center bg-white border border-dashed rounded-xl text-xs font-bold text-slate-400">
                                                        +{delivery.files_urls.length - 4} mais
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-400 mb-0.5 tracking-tighter">Valor Liberado</p>
                                            <p className="text-lg font-black text-primary leading-none">R$ {Number(contract.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>

                                        <div className="flex gap-3 w-full sm:w-auto">
                                            {activeTab === 'delivered' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 sm:flex-none border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold h-11"
                                                        onClick={() => {
                                                            setSelectedContract(contract);
                                                            setRevisionMessage('');
                                                            setIsRejectOpen(true);
                                                        }}
                                                    >
                                                        Solicitar Ajuste
                                                    </Button>
                                                    <Button
                                                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-11 px-8 shadow-lg shadow-emerald-600/20"
                                                        onClick={() => {
                                                            setSelectedContract(contract);
                                                            setIsApproveOpen(true);
                                                        }}
                                                    >
                                                        Aprovar Projeto
                                                    </Button>
                                                </>
                                            )}
                                            {activeTab === 'completed' && (
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    {contract.reviews && contract.reviews.length > 0 ? (
                                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none rounded-xl px-4 py-2 font-black uppercase text-[10px]">
                                                            Avaliado <Star className="w-3 h-3 ml-1 fill-current" />
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 sm:flex-none border-yellow-200 text-yellow-600 hover:bg-yellow-50 rounded-xl font-bold gap-2 h-11"
                                                            onClick={() => {
                                                                setSelectedContract(contract);
                                                                setIsReviewOpen(true);
                                                            }}
                                                        >
                                                            <Star className="w-4 h-4" /> Avaliar
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold gap-2 h-11 px-6">
                                                        Ver Detalhes <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            {activeTab === 'revision_requested' && (
                                                <Button variant="secondary" className="w-full sm:w-auto rounded-xl font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 border-none cursor-default">
                                                    Aguardando Nova Entrega
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Review Modal */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-md">
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                <Star className="w-10 h-10 fill-current" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-800">Avaliar Freelancer</DialogTitle>
                                <DialogDescription className="text-slate-500">Sua avaliação ajuda a comunidade e o profissional.</DialogDescription>
                            </div>
                        </div>

                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`p-1 transition-transform active:scale-90 ${rating >= star ? 'text-yellow-500' : 'text-slate-200'}`}
                                >
                                    <Star className={`w-10 h-10 ${rating >= star ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Seu comentário</label>
                            <Textarea
                                placeholder="Conte como foi sua experiência com este profissional..."
                                className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 focus-visible:ring-primary/20 p-4"
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                className="h-14 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95"
                                onClick={handleReview}
                                disabled={actionLoading || rating === 0}
                            >
                                {actionLoading ? "Enviando..." : "Publicar Avaliação"}
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-12 text-slate-400 font-bold hover:text-slate-600"
                                onClick={() => setIsReviewOpen(false)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modals */}
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-md overflow-y-auto max-h-[90vh]">
                    <div className="flex flex-col space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-2xl font-black text-slate-800">Liberar Pagamento?</DialogTitle>
                                <DialogDescription className="text-slate-500">
                                    Ao confirmar, o valor será liberado para o freelancer e o projeto será marcado como concluído.
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <div className="text-center space-y-2">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-widest text-center">Como foi sua experiência?</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`p-1 transition-transform active:scale-90 ${rating >= star ? 'text-yellow-500' : 'text-slate-200'}`}
                                        >
                                            <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Deixe um comentário público</label>
                                <Textarea
                                    placeholder="O profissional foi atencioso? Entregou no prazo? (Opcional)"
                                    className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-100 focus-visible:ring-primary/20 p-4 text-sm"
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-3 pt-2">
                            <Button
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-600/30"
                                onClick={handleApprove}
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Processando..." : "Confirmar e Avaliar"}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 text-slate-400 font-bold hover:text-slate-600"
                                onClick={() => setIsApproveOpen(false)}
                                disabled={actionLoading}
                            >
                                Voltar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-lg">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-500">
                                <RotateCcw className="w-7 h-7" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-slate-800">Solicitar Ajuste</DialogTitle>
                                <DialogDescription>Informe o que precisa ser modificado no projeto.</DialogDescription>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Descrição das alterações</label>
                            <Textarea
                                placeholder="Seja detalhista. Ex: Preciso das cores do banner em tons mais escuros..."
                                className="min-h-[160px] rounded-2xl bg-slate-50 border-slate-100 focus-visible:ring-primary/20 resize-none p-4"
                                value={revisionMessage}
                                onChange={(e) => setRevisionMessage(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl font-bold"
                                onClick={() => setIsRejectOpen(false)}
                                disabled={actionLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg"
                                onClick={handleReject}
                                disabled={actionLoading || !revisionMessage.trim()}
                            >
                                {actionLoading ? "Enviando..." : "Enviar Solicitação"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </DashboardLayout>
    );
}
