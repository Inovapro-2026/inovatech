
import { 
  DollarSign, TrendingUp, Target, Users, UserPlus, 
  BarChart2, Package, ClipboardList, Tent, Star, 
  AlertTriangle, Clock 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export function DashboardKPIs() {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
      ))}
    </div>;
  }

  const kpiData = [
    // Row 1 - Financeiro
    {
      title: "GMV Total",
      value: `R$ ${stats.gmv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      sub: "Este mês",
      trend: "+12.5%",
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      trendUp: true
    },
    {
      title: "Receita Plataforma",
      value: `R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      sub: "Taxas + Planos",
      trend: "+8.3%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      trendUp: true
    },
    {
      title: "Ticket Médio",
      value: `R$ ${stats.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      sub: "Por transação",
      trend: "+3.1%",
      icon: Target,
      color: "text-amber-600",
      bg: "bg-amber-100",
      trendUp: true
    },
    // Row 2 - Usuários
    {
      title: "Total Usuários",
      value: stats.users.total,
      sub: `${stats.users.freelancers} Freelas | ${stats.users.clients} Clientes`,
      trend: "+15.2%",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trendUp: true
    },
    {
      title: "Novos Cadastros",
      value: stats.users.newLast30Days,
      sub: "Últimos 30 dias",
      trend: "+22.1%",
      icon: UserPlus,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      trendUp: true
    },
    {
      title: "Taxa de Ativação",
      value: "67.4%",
      sub: "Completaram perfil",
      trend: "+5.4%",
      icon: BarChart2,
      color: "text-purple-600",
      bg: "bg-purple-100",
      trendUp: true
    },
    // Row 3 - Projetos/Contratos
    {
      title: "Projetos Publicados",
      value: stats.projects.published,
      sub: `${stats.projects.total} Total | ${stats.projects.drafts} Rascunhos`,
      trend: "+2.8%", // Mock trend
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-50",
      trendUp: true
    },
    {
      title: "Contratos Ativos",
      value: stats.contracts.active,
      sub: "Em andamento agora",
      trend: "+1.2%",
      icon: ClipboardList,
      color: "text-orange-600",
      bg: "bg-orange-100",
      trendUp: true
    },
    {
      title: "Taxa de Conversão",
      value: "19.6%",
      sub: "Projetos → Contratos",
      trend: "+2.8%",
      icon: Tent,
      color: "text-purple-500",
      bg: "bg-purple-50",
      trendUp: true
    },
    // Row 4 - Qualidade
    {
      title: "Satisfação Média",
      value: "4.7/5.0",
      sub: "Baseado em 234 avaliações",
      trend: "Estável",
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      trendUp: true
    },
    {
      title: "Disputas Ativas",
      value: stats.disputes.active,
      sub: "Requerem atenção",
      trend: stats.disputes.active > 5 ? "Crítico" : "Normal",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
      trendUp: false
    },
    {
      title: "Tempo Médio Entrega",
      value: "5.2 dias",
      sub: "Meta: 7 dias",
      trend: "-12% (Melhor)",
      icon: Clock,
      color: "text-teal-600",
      bg: "bg-teal-100",
      trendUp: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                kpi.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              } flex items-center gap-1`}>
                {kpi.trendUp ? '↗' : '↘'} {kpi.trend}
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</h3>
              <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
              <p className="text-xs text-slate-400">{kpi.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
