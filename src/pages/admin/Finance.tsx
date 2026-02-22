import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DollarSign, ArrowUpRight, ArrowDownLeft, FileText, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminFinance() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        balance: 0,
        revenue: 0,
        payouts: 0,
        refunds: 0
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    async function fetchTransactions() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    profiles:user_id(full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);

            // Calculate stats
            const revenue = data?.filter(t => t.type === 'platform_fee').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
            const payouts = data?.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
            const refunds = data?.filter(t => t.type === 'refund').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
            // Balance is usually fetched from payment provider, but we can sum unwithdrawn funds + platform fees
            const balance = revenue; // Simplified for now

            setStats({ balance, revenue, payouts, refunds });

        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financeiro da Plataforma 💰</h1>
                        <p className="text-slate-500">Gestão de receitas, saques e transações</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" /> Relatório Mensal
                        </Button>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" /> Exportar Contabilidade
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-green-200 bg-green-50/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">Saldo Plataforma</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{formatCurrency(stats.balance)}</div>
                            <p className="text-xs text-green-600 mt-1">Disponível no Mercado Pago</p>
                        </CardContent>
                    </Card>

                    <Card className="border-indigo-200 bg-indigo-50/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-700">Receita (Total)</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-900">{formatCurrency(stats.revenue)}</div>
                            <p className="text-xs text-indigo-600 mt-1">Taxas acumuladas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200 bg-amber-50/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700">Pendentes de Saque</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{formatCurrency(stats.payouts)}</div>
                            <p className="text-xs text-amber-600 mt-1">Aguardando processamento</p>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-red-50/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-700">Estornos</CardTitle>
                            <DollarSign className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900">{formatCurrency(stats.refunds)}</div>
                            <p className="text-xs text-red-600 mt-1">Devoluções realizadas</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Transações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Descrição</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-slate-500">
                                            {format(new Date(tx.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${tx.type === 'platform_fee' ? 'bg-indigo-100 text-indigo-800' : 
                                                  tx.type === 'payment' ? 'bg-green-100 text-green-800' : 
                                                  tx.type === 'withdrawal' ? 'bg-amber-100 text-amber-800' : 
                                                  'bg-red-100 text-red-800'}`}>
                                                {tx.type === 'platform_fee' ? 'Taxa Plataforma' : 
                                                 tx.type === 'payment' ? 'Pagamento' : 
                                                 tx.type === 'withdrawal' ? 'Saque' : 
                                                 tx.type === 'refund' ? 'Estorno' : tx.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-900">
                                            {tx.profiles?.full_name || "N/A"}
                                        </TableCell>
                                        <TableCell className={['withdrawal', 'refund'].includes(tx.type) ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                            {['withdrawal', 'refund'].includes(tx.type) ? '-' : '+'}{formatCurrency(tx.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                  tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                  'bg-red-100 text-red-800'}`}>
                                                {tx.status === 'completed' ? 'Concluído' : 
                                                 tx.status === 'pending' ? 'Pendente' : 'Falha'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm truncate max-w-[200px]">
                                            {tx.description || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
