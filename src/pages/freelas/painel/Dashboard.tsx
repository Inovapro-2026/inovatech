import { useEffect, useState } from 'react';
import { FreelasLayout } from '@/components/layout/freelas/FreelasLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
    Wallet,
    Briefcase,
    Target,
    CheckCircle2,
    TrendingUp,
    Sparkles,
    ArrowRight,
    Clock,
    MessageSquare,
    Eye,
    Box,
    Star,
    DollarSign,
    Building,
    User as UserIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

export default function FreelasDashboard() {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30_days');

    // Data States
    const [kpis, setKpis] = useState({
        totalEarnings: 0,
        activeJobs: 0,
        matches: 0,
        completedJobs: 0,
        avgRating: 0
    });
    const [earningsData, setEarningsData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [conversionData, setConversionData] = useState<any[]>([]);
    const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [wallet, setWallet] = useState({ available: 0, pending: 0 });

    // Withdrawal Modal State
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [amountToWithdraw, setAmountToWithdraw] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [pixKey, setPixKey] = useState('');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchDashboardData();
    }, [user, period]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. KPIs Queries
            // Earnings (Completed contracts)
            const { data: completedContracts } = await supabase
                .from('contracts')
                .select('amount, status, rating, projects(category)')
                .eq('freelancer_id', user.id)
                .eq('status', 'completed');

            const totalEarned = completedContracts?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
            const completedCount = completedContracts?.length || 0;
            const avgRating = completedCount > 0
                ? (completedContracts?.reduce((acc, curr) => acc + (curr.rating || 5), 0) || 0) / completedCount
                : 5.0;

            // Active Jobs
            const { count: activeCount } = await supabase
                .from('contracts')
                .select('id', { count: 'exact' })
                .eq('freelancer_id', user.id)
                .eq('status', 'in_progress');

            // Matches (Open projects not by me)
            const { count: matchCount } = await supabase
                .from('projects')
                .select('id', { count: 'exact' })
                .eq('status', 'published')
                .neq('freelancer_id', user.id);

            setKpis({
                totalEarnings: totalEarned,
                activeJobs: activeCount || 0,
                matches: matchCount || 0,
                completedJobs: completedCount,
                avgRating
            });

            // 2. Charts Data

            // Line Chart: Earnings Evolution (RPC)
            // Using mock RPC call if function not ready, or real one
            const { data: earningsHistory, error: rpcError } = await supabase.rpc('get_earnings_by_period', {
                p_freelancer_id: user.id,
                p_period: period === '30_days' ? 'day' : 'month',
                p_months: period === '30_days' ? 1 : 6
            });

            if (!rpcError && earningsHistory) {
                setEarningsData(earningsHistory.map((d: any) => ({
                    name: d.period_label,
                    value: Number(d.total_amount)
                })));
            } else {
                // Fallback mock if no data yet to avoid empty charts
                setEarningsData([
                    { name: 'Jan', value: 0 },
                    { name: 'Fev', value: 1200 },
                    { name: 'Mar', value: 900 },
                    { name: 'Abr', value: 2400 },
                    { name: 'Mai', value: 1800 },
                    { name: 'Jun', value: 3200 },
                ]);
            }

            // Donut Chart: Category Distribution
            const categories: Record<string, number> = {};
            completedContracts?.forEach((c: any) => {
                const cat = c.projects?.category || 'Outros';
                categories[cat] = (categories[cat] || 0) + 1;
            });

            const pieData = Object.entries(categories).map(([name, value]) => ({ name, value }));
            setCategoryData(pieData.length > 0 ? pieData : [{ name: 'Sem dados', value: 1 }]);

            // Bar Chart: Conversion Rate (Mocked for now as we don't have views/proposals tables yet)
            setConversionData([
                { name: 'Visualizações', value: 145, fill: '#94a3b8' }, // Slate-400
                { name: 'Matches', value: matchCount || 23, fill: '#8b5cf6' }, // Purple-500
                { name: 'Contratos', value: completedCount + (activeCount || 0), fill: '#0d9488' }, // Teal-600
            ]);

            // 3. Recommended Projects (RPC)
            const { data: recProjects } = await supabase.rpc('get_recommended_projects', {
                p_freelancer_id: user.id,
                p_limit: 3
            });
            setRecommendedProjects(recProjects || []);

            // 4. Recent Activity (Real Table)
            const { data: activities } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentActivities(activities || []);

            // 5. Wallet Balance (Mock calculation based on earnings)
            // In a real app, this would query a 'wallets' table
            const available = totalEarned * 0.7; // Simulating 70% available
            setWallet({ available, pending: totalEarned * 0.3 });

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast({ title: 'Erro', description: 'Falha ao carregar dados do dashboard.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountVal = Number(amountToWithdraw.replace(',', '.'));

        if (amountVal > wallet.available || amountVal < 50) {
            toast({ title: 'Atenção', description: 'Valor inválido ou insuficiente. Min: R$ 50,00', variant: 'destructive' });
            return;
        }

        setIsWithdrawing(true);
        setTimeout(async () => {
            // Log the withdrawal activity
            await supabase.from('activity_logs').insert({
                user_id: user.id,
                type: 'payment',
                text: `Saque solicitado: R$ ${amountVal.toFixed(2)}`,
            });

            toast({ title: 'Sucesso', description: 'Saque solicitado! O valor cairá em sua conta em breve.' });
            setWallet(prev => ({ ...prev, available: prev.available - amountVal }));
            setRecentActivities(prev => [{
                type: 'payment',
                text: `Saque solicitado: R$ ${amountVal.toFixed(2)}`,
                created_at: new Date().toISOString()
            }, ...prev]);

            setIsWithdrawing(false);
            setIsWithdrawOpen(false);
            setAmountToWithdraw('');
        }, 1500);
    };

    const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

    const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    const getTimeAgo = (dateStr: string) => {
        const diff = new Date().getTime() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `Há ${days} dia${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
        return 'Agora mesmo';
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'view': return <Eye className="w-4 h-4 text-blue-500" />;
            case 'message': return <MessageSquare className="w-4 h-4 text-teal-500" />;
            case 'project': return <Box className="w-4 h-4 text-purple-500" />;
            case 'payment': return <DollarSign className="w-4 h-4 text-emerald-500" />;
            case 'rating': return <Star className="w-4 h-4 text-amber-500" />;
            default: return <Target className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <FreelasLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bem-vindo, {profile?.full_name?.split(' ')[0] || 'Freelancer'} ⚡</h1>
                    <p className="text-slate-500 mt-1">Aqui está o que está acontecendo com sua carreira hoje</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="h-10 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none w-full md:w-auto cursor-pointer"
                    >
                        <option value="30_days">Últimos 30 dias</option>
                        <option value="7_days">Últimos 7 dias</option>
                        <option value="6_months">Últimos 6 meses</option>
                    </select>
                    <Button
                        onClick={() => setIsWithdrawOpen(true)}
                        className="h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md font-semibold px-6 w-full md:w-auto"
                    >
                        Retirar Ganhos
                    </Button>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1: Ganhos */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                        <div className="h-full bg-emerald-500 w-[70%] group-hover:w-full transition-all duration-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
                        </span>
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm mb-1">Ganhos Totais</h3>
                    <div className="text-3xl font-extrabold text-slate-900">
                        {loading ? <Skeleton className="h-9 w-32" /> :
                            kpis.completedJobs > 0 ? formatCurrency(kpis.totalEarnings) :
                                <span className="text-slate-400 text-lg">Complete seu primeiro job</span>
                        }
                    </div>
                </div>

                {/* Card 2: Jobs Ativos */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                        <div className="h-full bg-blue-500 w-[40%] group-hover:w-full transition-all duration-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            Em andamento
                        </span>
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm mb-1">Jobs Ativos</h3>
                    <div className="text-3xl font-extrabold text-slate-900">
                        {loading ? <Skeleton className="h-9 w-16" /> :
                            kpis.activeJobs > 0 ? kpis.activeJobs :
                                <span className="text-slate-400 text-lg">Sem jobs ativos</span>
                        }
                    </div>
                </div>

                {/* Card 3: Matches */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                        <div className="h-full bg-purple-500 w-[20%] group-hover:w-full transition-all duration-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
                            <Target className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                            +5 novos
                        </span>
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm mb-1">Matches</h3>
                    <div className="text-3xl font-extrabold text-slate-900">
                        {loading ? <Skeleton className="h-9 w-16" /> : kpis.matches}
                    </div>
                </div>

                {/* Card 4: Concluídos */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                        <div className="h-full bg-amber-500 w-[98%] group-hover:w-full transition-all duration-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                            {kpis.avgRating.toFixed(1)}/5.0
                        </span>
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm mb-1">Concluídos</h3>
                    <div className="text-3xl font-extrabold text-slate-900">
                        {loading ? <Skeleton className="h-9 w-16" /> : kpis.completedJobs}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Chart 1: Earnings Evolution */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-teal-600" /> Evolução de Ganhos
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={earningsData}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Category Distribution */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-900 mb-2">Por Categoria</h3>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-slate-900">{kpis.completedJobs}</span>
                                <span className="text-xs text-slate-500 font-medium">Projetos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations & Timeline */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content (2/3) - Recommendations */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6 text-purple-500" /> Recomendações da IA</h2>
                            <Link to="/freelas/jobs" className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center">
                                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                                ))
                            ) : recommendedProjects.length > 0 ? (
                                recommendedProjects.map((project) => (
                                    <div key={project.id || project.project_id} className="border border-slate-100 rounded-2xl p-5 hover:border-teal-200 hover:shadow-md transition-all group flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
                                        <div className="absolute top-3 right-3 z-10">
                                            <div className="bg-white/90 backdrop-blur text-purple-700 text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center shadow-sm border border-purple-100">
                                                <Target className="w-3 h-3 mr-1" /> {project.match_percentage}% MATCH
                                            </div>
                                        </div>

                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Briefcase className="w-6 h-6 text-teal-600" />
                                        </div>

                                        <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2 leading-tight">{project.title}</h3>
                                        <p className="text-xs text-slate-500 mb-4 line-clamp-1 flex items-center gap-1">
                                            <Building className="w-3 h-3" /> {project.client_name || 'Cliente Confidencial'}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-slate-500 font-medium">Orçamento</span>
                                                <span className="font-extrabold text-teal-700">R$ {Number(project.price).toLocaleString('pt-BR')}</span>
                                            </div>
                                            <Button className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 shadow-sm">
                                                Ver Detalhes
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Target className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                    <p className="font-medium">Nenhuma recomendação no momento.</p>
                                    <p className="text-sm mt-1">Complete seu perfil para receber projetos.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar (1/3) - Activity & Conversion */}
                <div className="space-y-8">
                    {/* Conversion Chart (Mini) */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-sm font-bold mb-4 text-slate-500 uppercase tracking-wider">Funil de Conversão</h2>
                        <div className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={conversionData} barSize={20}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {conversionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center">
                            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100">
                                Taxa de Conversão: {((kpis.activeJobs + kpis.completedJobs) / (kpis.matches || 1) * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" /> Atividade Recente</h2>

                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : recentActivities.length > 0 ? (
                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
                                {recentActivities.map((act, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-white flex items-center justify-center shadow-sm z-10`}>
                                            {getActivityIcon(act.type)}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800 leading-snug">{act.text}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-400 font-medium">{getTimeAgo(act.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                Nenhuma atividade recente registrada.
                            </div>
                        )}

                        <Button variant="outline" className="w-full mt-4 rounded-xl border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">
                            Ver Histórico Completo
                        </Button>
                    </section>
                </div>
            </div>

            {/* Modal Solicitar Saque */}
            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">
                    <div className="px-8 pt-8 pb-6 border-b border-slate-100 bg-slate-50">
                        <DialogTitle className="text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                            <Building className="w-6 h-6 text-teal-600" /> Retirar Ganhos
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium tracking-tight">
                            Transfira seu saldo disponível direto para sua conta bancária.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleWithdraw} className="p-8 space-y-5">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <span className="block text-emerald-700 font-bold text-xs uppercase tracking-wider">Disponível</span>
                                <span className="text-emerald-600 font-extrabold text-xl">R$ {wallet.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-slate-500 font-bold text-xs uppercase tracking-wider">Pendente</span>
                                <span className="text-slate-400 font-bold text-sm">R$ {wallet.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-slate-900">Seu PIX ou Conta</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Chave Pix..."
                                    className="pl-10 h-12 rounded-xl focus-visible:ring-teal-500 font-semibold"
                                    value={pixKey} onChange={(e) => setPixKey(e.target.value)} required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-slate-900">Valor do Saque</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-emerald-600" />
                                <Input
                                    type="text"
                                    placeholder="Ex: 1500,00"
                                    className="pl-10 h-12 rounded-xl text-lg font-extrabold focus-visible:ring-teal-500 border-slate-300"
                                    value={amountToWithdraw} onChange={(e) => setAmountToWithdraw(e.target.value)} required
                                />
                                <button
                                    type="button"
                                    onClick={() => setAmountToWithdraw(wallet.available.toString())}
                                    className="absolute right-3 top-3.5 text-xs font-bold text-teal-600 hover:text-teal-700 uppercase"
                                >
                                    Total
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 text-sm text-slate-500 flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <Clock className="w-5 h-5 shrink-0 text-slate-400" />
                            <span>Processamento em até <strong>2 dias úteis</strong>. Mínimo de R$ 50,00.</span>
                        </div>

                        <Button
                            type="submit"
                            disabled={isWithdrawing || wallet.available < 50}
                            className="w-full h-12 rounded-xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl mt-4!"
                        >
                            {isWithdrawing ? 'Processando...' : 'Confirmar Saque'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </FreelasLayout>
    );
}
