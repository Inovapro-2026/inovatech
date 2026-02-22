
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { DashboardKPIs } from '@/components/admin/dashboard/DashboardKPIs';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts';
import { RecentTransactions } from '@/components/admin/dashboard/RecentTransactions';
import { RecentUsers } from '@/components/admin/dashboard/RecentUsers';
import { useToast } from '@/hooks/use-toast';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function AdminIndex() {
  const { toast } = useToast();
  const { refresh } = useDashboardStats();

  const handleRefresh = async () => {
    await refresh();
    toast({
      title: "Dados atualizados",
      description: "As métricas do painel foram atualizadas com sucesso.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral da Plataforma 📈</h1>
            <p className="text-slate-500">Métricas em tempo real e desempenho da INOVAPRO</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
            <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Download className="mr-2 h-4 w-4" /> Exportar Relatório
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <DashboardKPIs />

        {/* Charts */}
        <DashboardCharts />

        {/* Recent Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentTransactions />
          <RecentUsers />
        </div>
      </div>
    </AdminLayout>
  );
}
