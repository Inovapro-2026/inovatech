import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, FileText, CheckCircle, DollarSign, Zap, TrendingUp, Clock, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientDashboard() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        active: 0,
        inReview: 0,
        completed: 0,
        invested: 0
    });
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [pendingActions, setPendingActions] = useState<any[]>([]);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Active
            const { count: activeCount } = await supabase
                .from('contracts')
                .select('id', { count: 'exact' })
                .eq('client_id', user!.id)
                .eq('status', 'in_progress');

            // Review
            const { count: reviewCount } = await supabase
                .from('contracts')
                .select('id', { count: 'exact' })
                .eq('client_id', user!.id)
                .eq('status', 'delivered');

            // Completed
            const { count: completedCount } = await supabase
                .from('contracts')
                .select('id', { count: 'exact' })
                .eq('client_id', user!.id)
                .eq('status', 'completed');

            // Invested Month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { data: investedData } = await supabase
                .from('contracts')
                .select('amount')
                .eq('client_id', user!.id)
                .gte('created_at', startOfMonth.toISOString());

            const totalInvested = investedData?.reduce((sum, contract) => sum + Number(contract.amount), 0) || 0;

            setStats({
                active: activeCount || 0,
                inReview: reviewCount || 0,
                completed: completedCount || 0,
                invested: totalInvested
            });

            // Recent Projects
            const { data: recent } = await supabase
                .from('contracts')
                .select(`
                    *,
                    project:projects(title),
                    freelancer:profiles!freelancer_id(full_name, avatar_url)
                `)
                .eq('client_id', user!.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recent) setRecentProjects(recent);

            // Pending actions (delivered projects needing review)
            const { data: pending } = await supabase
                .from('contracts')
                .select('*, project:projects(title)')
                .eq('client_id', user!.id)
                .eq('status', 'delivered');

            if (pending) setPendingActions(pending);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_acceptance': return <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 font-black text-[10px] uppercase">Pendente</Badge>;
            case 'in_progress': return <Badge className="bg-blue-100 text-blue-700 border-none px-3 py-1 font-black text-[10px] uppercase">Em Andamento</Badge>;
            case 'delivered': return <Badge className="bg-purple-100 text-purple-700 border-none px-3 py-1 font-black text-[10px] uppercase">Em Revisão</Badge>;
            case 'completed': return <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 font-black text-[10px] uppercase">Concluído</Badge>;
            default: return <Badge variant="outline" className="font-black text-[10px] uppercase">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout type="client">
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'}!</h1>
                        <p className="text-slate-500 mt-2 font-medium">Aqui está o resumo dos seus projetos e atividades recentes.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-slate-200 rounded-2xl h-12 font-bold gap-2">
                            Download Report
                        </Button>
                        <Button asChild className="bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-2xl h-12 font-black px-8">
                            <Link to="/marketplace">Novo Projeto</Link>
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full">
                                    <TrendingUp className="w-3 h-3" /> +2
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ativos</p>
                                <h3 className="text-4xl font-black text-slate-900">{stats.active}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <Badge className="bg-slate-100 text-slate-500 border-none font-bold">Ação Req.</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Revisão</p>
                                <h3 className="text-4xl font-black text-slate-900">{stats.inReview}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Concluídos</p>
                                <h3 className="text-4xl font-black text-slate-900">{stats.completed}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-slate-900 text-white shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/10 rounded-2xl text-white group-hover:bg-white group-hover:text-slate-900 transition-colors">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Investido (Mês)</p>
                                <h3 className="text-2xl font-black">R$ {stats.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Projetos Recentes */}
                    <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-[40px] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black">Projetos Recentes</CardTitle>
                                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-xl transition-all" asChild>
                                    <Link to="/marketplace/painel/servicos">Ver todos <ArrowRight className="w-4 h-4 ml-2" /></Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-50 hover:bg-transparent">
                                        <TableHead className="px-8 font-black text-[10px] uppercase text-slate-400 tracking-widest">Projeto</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Expert</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Status</TableHead>
                                        <TableHead className="text-right px-8 font-black text-[10px] uppercase text-slate-400 tracking-widest">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentProjects.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-slate-400 py-16 font-medium">
                                                <Zap className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                                Nenhum projeto encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentProjects.map((contract) => (
                                            <TableRow key={contract.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                                <TableCell className="px-8 py-5">
                                                    <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{contract.project?.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {format(new Date(contract.created_at), "dd 'de' MMM", { locale: ptBR })}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                            <AvatarImage src={contract.freelancer?.avatar_url} />
                                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">{contract.freelancer?.full_name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-bold text-slate-700">{contract.freelancer?.full_name?.split(' ')[0]}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(contract.status)}</TableCell>
                                                <TableCell className="text-right px-8 py-5">
                                                    <span className="font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                                                        R$ {Number(contract.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Sidebar: Ações & Insights */}
                    <div className="space-y-6">
                        {/* Próximas Ações */}
                        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-black">Próximos Passos</CardTitle>
                                <CardDescription className="font-medium">O que exige sua atenção hoje.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                {pendingActions.length === 0 ? (
                                    <div className="text-center py-10 bg-emerald-50 rounded-3xl border border-emerald-100 p-6">
                                        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                                        <p className="text-emerald-900 font-black text-sm uppercase tracking-tighter">Tudo em ordem!</p>
                                        <p className="text-emerald-600 text-[10px] font-bold mt-1">Nenhuma pendência crítica encontrada.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingActions.map(action => (
                                            <div key={action.id} className="p-5 rounded-3xl flex flex-col gap-4 bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-purple-600">
                                                        <Zap className="w-5 h-5 fill-current" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">Revisar Entrega</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 line-clamp-1">{action.project?.title}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl h-10 font-black text-xs" asChild>
                                                    <Link to="/marketplace/painel/concluidos">
                                                        Avaliar Entrega <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Shortcuts */}
                        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white">
                            <CardContent className="p-8">
                                <h4 className="text-lg font-black mb-4">Acesso Rápido</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/marketplace/painel/mensagens" className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all gap-2 group">
                                        <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
                                    </Link>
                                    <Link to="/marketplace/painel/config" className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all gap-2 group">
                                        <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Perfil</span>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
