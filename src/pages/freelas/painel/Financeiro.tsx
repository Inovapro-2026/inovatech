import { useState } from 'react';
import { FreelasLayout } from '@/components/layout/freelas/FreelasLayout';
import {
    ArrowDownToLine,
    Zap,
    Building,
    Filter,
    Plus,
    FileText as FileTextIcon,
    Download as DownloadIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';

// Custom Hooks
import { useFinancialData, useWithdrawals, useBankAccounts } from '@/hooks/useFinancialData';

// Components
import { BalanceCard } from '@/components/freelas/finance/BalanceCard';
import { RevenueChart } from '@/components/freelas/finance/RevenueChart';
import { TransactionTable } from '@/components/freelas/finance/TransactionTable';
import { WithdrawModal } from '@/components/freelas/finance/WithdrawModal';
import { BankAccountForm } from '@/components/freelas/finance/BankAccountForm';
import { InvoiceList } from '@/components/freelas/finance/InvoiceList';

// Export CSV helper
const exportToCSV = (transactions: any[], filename: string) => {
    const headers = ['Data', 'Descricao', 'Tipo', 'Valor', 'Status'];
    const rows = transactions.map(t => [
        new Date(t.created_at).toLocaleDateString('pt-BR'),
        t.description || t.contract?.projects?.title || 'Transacao',
        t.type,
        t.amount.toString(),
        t.status
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default function FreelasFinanceiro() {
    const { toast } = useToast();
    const { loading: loadingData, transactions, stats, refresh: refreshData } = useFinancialData();
    const { withdrawals, requestWithdrawal } = useWithdrawals();
    const { accounts, addAccount } = useBankAccounts();

    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
    const [filterType, setFilterType] = useState<string>('all');

    const handleWithdrawRequest = async (amount: number, method: any) => {
        const { error } = await requestWithdrawal(amount, method);
        if (error) {
            toast({ title: "Erro ao solicitar saque", description: error, variant: "destructive" });
        } else {
            toast({ title: "Saque solicitado!", description: "Sua solicitação está sendo processada.", variant: "default" });
            refreshData(); // Refresh stats
        }
    };

    const handleAddAccount = async (data: any) => {
        const { error } = await addAccount(data);
        if (error) {
            toast({ title: "Erro ao salvar conta", description: error, variant: "destructive" });
        } else {
            toast({ title: "Conta salva!", description: "Seu novo método de pagamento foi cadastrado.", variant: "default" });
        }
    };

    const handleExportCSV = () => {
        const filtered = filterType === 'all'
            ? transactions
            : transactions.filter(t => t.type === filterType);

        exportToCSV(filtered, `extrato_inovapro_${new Date().toISOString().split('T')[0]}.csv`);
        toast({ title: "Exportação iniciada", description: "O arquivo CSV do seu extrato está sendo baixado." });
    };

    const filteredTransactions = transactions.filter(t => {
        if (filterType === 'all') return true;
        return t.type === filterType;
    });

    return (
        <FreelasLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Financeiro <span className="text-emerald-500">💰</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-wider">Gestão de Ganhos e Fluxo de Caixa</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => setIsWithdrawOpen(true)}
                        className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-xl shadow-teal-100 transition-all active:scale-95"
                    >
                        <ArrowDownToLine className="w-5 h-5 mr-3" /> Solicitar Saque
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full space-y-8">
                <TabsList className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto flex overflow-x-auto h-auto">
                    <TabsTrigger value="overview" className="flex-1 md:flex-none px-8 py-3 rounded-xl data-[state=active]:bg-teal-600 data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">Visão Geral</TabsTrigger>
                    <TabsTrigger value="statement" className="flex-1 md:flex-none px-8 py-3 rounded-xl data-[state=active]:bg-teal-600 data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">Extrato</TabsTrigger>
                    <TabsTrigger value="methods" className="flex-1 md:flex-none px-8 py-3 rounded-xl data-[state=active]:bg-teal-600 data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">Contas</TabsTrigger>
                    <TabsTrigger value="invoices" className="flex-1 md:flex-none px-8 py-3 rounded-xl data-[state=active]:bg-teal-600 data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">Faturas</TabsTrigger>
                </TabsList>

                {/* TAB: VISÃO GERAL */}
                <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                    <BalanceCard stats={stats} loading={loadingData} />

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <RevenueChart />

                            <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-black text-slate-900">Movimentações Recentes</CardTitle>
                                        <Badge className="bg-white text-slate-500 font-bold border-slate-200">{transactions.length} Total</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <TransactionTable transactions={transactions.slice(0, 5)} loading={loadingData} />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            {/* Projeção de Ganhos / Metas */}
                            <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-3xl shadow-xl overflow-hidden border-none relative">
                                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                                    <Zap className="w-40 h-40" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg font-black tracking-tight">Projeção do Mês</CardTitle>
                                    <CardDescription className="text-teal-100 font-medium">Baseado na sua média atual</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <h2 className="text-4xl font-black">R$ {(stats.monthly * 1.2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                            <span>Meta Mensal</span>
                                            <span>75%</span>
                                        </div>
                                        <div className="h-2 bg-white/20 rounded-full">
                                            <div className="h-full bg-white rounded-full w-3/4 shadow-sm" />
                                        </div>
                                    </div>
                                    <Button className="w-full bg-white text-teal-700 hover:bg-teal-50 font-black rounded-xl h-12 shadow-md">
                                        Configurar Meta
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Próximos Pagamentos */}
                            <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-base font-black text-slate-900">Próximos Saques</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="px-6 pb-6 space-y-4">
                                        {withdrawals.filter(w => w.status === 'pending' || w.status === 'processing').length === 0 ? (
                                            <div className="text-center py-4">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nenhum saque em análise</p>
                                            </div>
                                        ) : (
                                            withdrawals.filter(w => w.status === 'pending' || w.status === 'processing').map(w => (
                                                <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                            <Building className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900">R$ {w.amount.toLocaleString('pt-BR')}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">Em análise</p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-tight border-none">Análise</Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: EXTRATO COMPLETO */}
                <TabsContent value="statement" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                    <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900 mb-1">Extrato Histórico</CardTitle>
                                    <CardDescription className="font-bold text-slate-400 text-xs uppercase tracking-widest">Acompanhe cada centavo que entra e sai</CardDescription>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 h-11">
                                        <Filter className="w-4 h-4 text-slate-400" />
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
                                        >
                                            <option value="all">Todos os tipos</option>
                                            <option value="earnings">Ganhos</option>
                                            <option value="withdrawal">Saques</option>
                                            <option value="refund">Estornos</option>
                                            <option value="bonus">Bônus</option>
                                        </select>
                                    </div>
                                    <Button onClick={handleExportCSV} variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95">
                                        Exportar CSV
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <TransactionTable transactions={filteredTransactions} loading={loadingData} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: CONTAS / MÉTODOS */}
                <TabsContent value="methods" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configurações de Recebimento</h2>
                            <p className="text-slate-500 font-medium text-sm">Onde o dinheiro cairá após a aprovação</p>
                        </div>
                        <Button onClick={() => setIsAddMethodOpen(true)} className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg shadow-slate-200">
                            <Plus className="w-5 h-5 mr-2" /> Novo Método
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accounts.map(method => (
                            <div key={method.id} className={`p-6 rounded-3xl border transition-all hover:shadow-lg ${method.is_default ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200 bg-white'} shadow-sm relative group`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        {method.type === 'pix' ? <Zap className="w-6 h-6 text-amber-500" /> : <Building className="w-6 h-6 text-slate-600" />}
                                    </div>
                                    {method.is_default && (
                                        <Badge className="bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest border-none">Padrão</Badge>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg leading-tight">{method.label}</h3>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                            {method.type === 'pix' ? 'Chave PIX' : 'Conta Bancária'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                        {method.type === 'pix' ? (
                                            <p className="font-mono text-slate-700 font-bold break-all">{method.data.key}</p>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-600 font-bold"><span className="text-slate-400 font-medium">Banco:</span> {method.data.bank}</p>
                                                <p className="text-xs text-slate-600 font-bold"><span className="text-slate-400 font-medium">CC:</span> {method.data.account}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {accounts.length === 0 && (
                            <div className="md:col-span-2 lg:col-span-3 p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                                <p className="text-slate-500 font-bold">Nenhum método cadastrado ainda.</p>
                                <Button variant="link" onClick={() => setIsAddMethodOpen(true)} className="text-teal-600 font-black mt-2">Cadastrar agora</Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* TAB: FATURAS */}
                <TabsContent value="invoices" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                    <InvoiceList transactions={transactions} loading={loadingData} />
                </TabsContent>
            </Tabs>

            {/* Modais */}
            <WithdrawModal
                open={isWithdrawOpen}
                onOpenChange={setIsWithdrawOpen}
                availableBalance={stats.available}
                paymentMethods={accounts}
                onRequestWithdraw={handleWithdrawRequest}
            />

            <BankAccountForm
                open={isAddMethodOpen}
                onOpenChange={setIsAddMethodOpen}
                onSave={handleAddAccount}
            />
        </FreelasLayout>
    );
}
