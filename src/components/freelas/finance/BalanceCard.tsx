import { Wallet, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FinancialStats } from '@/types/financial';

interface BalanceCardProps {
    stats: FinancialStats;
    loading: boolean;
}

export function BalanceCard({ stats, loading }: BalanceCardProps) {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Saldo Disponível */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl group-hover:bg-teal-500/30 transition-colors" />
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <Wallet className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 bg-teal-500/20 px-2 py-1 rounded-full">Disponível</span>
                </div>
                <p className="text-slate-400 text-xs mb-1 font-bold uppercase tracking-tighter">Saldo para Saque</p>
                <h2 className="text-3xl font-black text-white tracking-tight">
                    {loading ? <Skeleton className="h-9 w-32 bg-slate-700/50" /> : `R$ ${stats.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </h2>
                <p className="text-[10px] text-slate-500 mt-2 font-medium italic">* Liberação após aprovação do projeto</p>
            </div>

            {/* Faturamento Mensal */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                        <ArrowUpRight className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Este Mês</span>
                </div>
                <p className="text-slate-500 text-xs mb-1 font-bold uppercase tracking-tighter">Faturamento Bruto</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {loading ? <Skeleton className="h-8 w-32" /> : `R$ ${stats.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </h2>
                <div className="mt-3 flex items-center gap-1.5">
                    <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <span className="text-[10px] font-bold text-teal-600">65% da meta</span>
                </div>
            </div>

            {/* Total Acumulado */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total All-time</span>
                </div>
                <p className="text-slate-500 text-xs mb-1 font-bold uppercase tracking-tighter">Acumulado Histórico</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {loading ? <Skeleton className="h-8 w-32" /> : `R$ ${stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </h2>
            </div>

            {/* Pendente / Em caução */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendente</span>
                </div>
                <p className="text-slate-500 text-xs mb-1 font-bold uppercase tracking-tighter">Aguardando Liberação</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {loading ? <Skeleton className="h-8 w-32" /> : `R$ ${stats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </h2>
            </div>
        </div>
    );
}
