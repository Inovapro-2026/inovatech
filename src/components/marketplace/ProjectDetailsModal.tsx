import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Shield, CheckCircle2, MessageSquare, Send, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { FeeBreakdown } from "./FeeBreakdown";

interface ProjectDetailsModalProps {
    project: any;
    isOpen: boolean;
    onClose: () => void;
    onContratar: (project: any) => void;
    onMessage: (project: any) => void;
    loading?: boolean;
}

export default function ProjectDetailsModal({ project, isOpen, onClose, onContratar, onMessage, loading }: ProjectDetailsModalProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        if (project && isOpen) {
            fetchProjectReviews();
        }
    }, [project, isOpen]);

    const fetchProjectReviews = async () => {
        try {
            setLoadingReviews(true);
            let query = supabase
                .from('reviews')
                .select(`
                    id, rating, comment, created_at,
                    reviewer:profiles!reviewer_id (full_name, avatar_url)
                `)
                .eq('rated_id', project.freelancer.id)
                .order('created_at', { ascending: false })
                .limit(5);

            let { data, error } = await query;

            // Fallback se rated_id não existir
            if (error && error.code === '42703') {
                console.warn("Coluna rated_id não encontrada, buscando por reviewer_id apenas para evitar crash...");
                const basicQuery = await supabase
                    .from('reviews')
                    .select('id, rating, comment, created_at, reviewer:profiles!reviewer_id (full_name, avatar_url)')
                    .order('created_at', { ascending: false })
                    .limit(5);
                data = basicQuery.data;
                error = basicQuery.error;
            }

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;

        try {
            setSendingMessage(true);
            const { error } = await supabase.from('messages').insert({
                sender_id: user?.id,
                receiver_id: project.freelancer.id,
                content: messageText
            });

            if (error) throw error;

            toast.success("Mensagem enviada com sucesso!");
            setMessageText("");
            setIsMessageOpen(false);
            onClose();
            navigate("/marketplace/painel/mensagens");
        } catch (error: any) {
            toast.error("Erro ao enviar mensagem: " + error.message);
        } finally {
            setSendingMessage(false);
        }
    };

    if (!project) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
                    <DialogTitle className="sr-only">Detalhes do Projeto - {project.title}</DialogTitle>
                    <DialogDescription className="sr-only">Visualize detalhes, descrição e avaliações deste serviço de freelancer.</DialogDescription>
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 p-6 sm:p-8 space-y-8">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest">
                                        {project.category}
                                    </Badge>
                                    <h1 className="text-3xl font-black text-slate-800 leading-tight">
                                        {project.title}
                                    </h1>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border border-slate-100">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" /> Sobre este serviço
                                </h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {project.description || "Nenhuma descrição detalhada fornecida ainda."}
                                </p>
                            </div>

                            {project.tags && project.tags.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Tecnologias e Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="bg-slate-50 text-slate-600 border border-slate-200 py-1.5 px-3 rounded-xl font-bold">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews Section */}
                            <div className="pt-8 border-t border-slate-100 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-800">Avaliações Públicas</h3>
                                    <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full">
                                        <Star className={`w-4 h-4 ${Number(project.rating) > 0 ? 'fill-current' : ''}`} />
                                        <span className="font-bold">{Number(project.rating) > 0 ? project.rating : "Novo"}</span>
                                        <span className="text-slate-400 text-xs">({project.reviews})</span>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {loadingReviews ? (
                                        <div className="py-10 text-center"><Star className="w-8 h-8 text-slate-100 animate-spin mx-auto" /></div>
                                    ) : reviews.length > 0 ? (
                                        reviews.map((rev) => (
                                            <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-8 h-8 border">
                                                            <AvatarImage src={rev.reviewer?.avatar_url} />
                                                            <AvatarFallback>{rev.reviewer?.full_name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-700">{rev.reviewer?.full_name}</p>
                                                            <div className="flex gap-0.5 mt-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'text-yellow-500 fill-current' : 'text-slate-200'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {format(new Date(rev.created_at), "MMM yyyy", { locale: ptBR })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 italic">"{rev.comment}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center border-2 border-dashed rounded-3xl bg-slate-50/50">
                                            <p className="text-slate-400 text-sm">Nenhuma avaliação ainda. Seja o primeiro a contratar!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="bg-slate-50/50 border-l border-slate-100 p-6 sm:p-8 space-y-8 h-full">
                            <Card className="p-1 border-none shadow-xl bg-white rounded-3xl space-y-4">
                                <FeeBreakdown serviceValue={project.price} className="border-none shadow-none" />

                                <div className="px-6 pb-6 space-y-4">
                                    <Button
                                        className="w-full h-14 bg-primary hover:bg-primary-light text-white text-lg font-black rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                                        onClick={() => onContratar(project)}
                                        disabled={loading}
                                    >
                                        {loading ? "Processando..." : "Contratar Agora"}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full h-12 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold transition-all active:scale-95"
                                        onClick={() => {
                                            if (!user) {
                                                onMessage(project);
                                            } else {
                                                setIsMessageOpen(true);
                                            }
                                        }}
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" /> Enviar Mensagem
                                    </Button>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-center">
                                            Pagamento Seguro via <br /><span className="text-primary">Inovapro Escrow</span>
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Sobre o Freelancer</h4>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-shadow">
                                    <Avatar className="w-14 h-14 border shadow-sm">
                                        <AvatarImage src={project.freelancer.avatar} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-black">{project.freelancer.name.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-800 truncate">{project.freelancer.name}</p>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] h-5 font-black uppercase">
                                            {project.freelancer.level}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white border border-slate-100 text-center">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Projetos</p>
                                        <p className="text-xl font-black text-slate-800">{project.projectsCount}+</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-slate-100 text-center">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Nota</p>
                                        <p className="text-xl font-black text-slate-800">{Number(project.rating) > 0 ? project.rating : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span>Prazo médio: 7-10 dias</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    <span>Revisões ilimitadas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Message Dialog */}
            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                <DialogContent className="max-w-md rounded-3xl p-8 border-none shadow-2xl">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <MessageSquare className="w-7 h-7" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-800">Enviar Mensagem</DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium">Fale diretamente com {project.freelancer.name}.</DialogDescription>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Sua mensagem</label>
                            <Textarea
                                placeholder="Olá! Gostaria de saber mais sobre este projeto..."
                                className="min-h-[160px] rounded-2xl bg-slate-50 border-slate-100 focus-visible:ring-primary/20 p-4 font-medium"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                className="h-14 bg-primary hover:bg-primary-light text-white text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                                onClick={handleSendMessage}
                                disabled={sendingMessage || !messageText.trim()}
                            >
                                {sendingMessage ? "Enviando..." : "Enviar Mensagem Agora"}
                                <Send className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-12 text-slate-400 font-bold hover:text-slate-600 rounded-xl"
                                onClick={() => setIsMessageOpen(false)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
