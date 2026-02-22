import { Transaction } from '@/types/financial';
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';

interface TransactionTableProps {
    transactions: Transaction[];
    loading: boolean;
}

export function TransactionTable({ transactions, loading }: TransactionTableProps) {
    if (loading) {
        return <div className="p-8 text-center">Carregando transações...</div>;
    }

    if (transactions.length === 0) {
        return (
            <div className="p-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nenhuma movimentação ainda</h3>
                <p className="text-slate-500 text-sm">Assim que você completar seu primeiro projeto, ele aparecerá aqui.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                        <th className="px-6 py-4 border-b border-slate-100">Data</th>
                        <th className="px-6 py-4 border-b border-slate-100">Descrição</th>
                        <th className="px-6 py-4 border-b border-slate-100">Status</th>
                        <th className="px-6 py-4 border-b border-slate-100 text-right">Valor</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-100">
                    {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                                <span className="text-slate-500 text-xs font-bold tabular-nums">
                                    {new Date(t.created_at).toLocaleDateString('pt-BR')}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${t.type === 'earnings' ? 'bg-emerald-100 text-emerald-600' :
                                            t.type === 'withdrawal' ? 'bg-amber-100 text-amber-600' :
                                                t.type === 'refund' ? 'bg-red-100 text-red-600' :
                                                    'bg-blue-100 text-blue-600'
                                        }`}>
                                        {t.type === 'earnings' ? <ArrowDownToLine className="w-5 h-5" /> :
                                            t.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5" /> :
                                                <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-bold leading-tight">{t.description || t.contract?.projects?.title || 'Transação'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{t.type}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider border-none ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                        t.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                            t.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                    }`}>
                                    {t.status === 'completed' ? 'Concluído' :
                                        t.status === 'processing' ? 'Processando' :
                                            t.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                </Badge>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <span className={`text-sm font-black tabular-nums ${t.type === 'earnings' || t.type === 'bonus' ? 'text-emerald-600' : 'text-slate-900'
                                    }`}>
                                    {t.type === 'earnings' || t.type === 'bonus' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
