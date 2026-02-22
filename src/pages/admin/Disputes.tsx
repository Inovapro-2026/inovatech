import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangle, CheckCircle, XCircle, MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function AdminDisputes() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [selectedDispute, setSelectedDispute] = useState<any>(null);
    const [resolution, setResolution] = useState("");

    useEffect(() => {
        fetchDisputes();
    }, []);

    async function fetchDisputes() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('disputes')
                .select(`
                    *,
                    contracts (
                        id,
                        amount,
                        status,
                        projects (title),
                        client:client_id (full_name, email),
                        freelancer:freelancer_id (full_name, email)
                    ),
                    opener:opened_by (full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDisputes(data || []);
        } catch (error) {
            console.error("Error fetching disputes:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleResolve = async (disputeId: string, decision: 'refund_client' | 'release_freelancer' | 'split') => {
        try {
            // Update dispute status
            const { error: disputeError } = await supabase
                .from('disputes')
                .update({
                    status: 'resolved',
                    resolution: `Decisão: ${decision}. Justificativa: ${resolution}`,
                    resolved_at: new Date().toISOString(),
                    // resolved_by: user.id // Need user context here, assuming RLS handles or trigger
                })
                .eq('id', disputeId);

            if (disputeError) throw disputeError;

            // Update contract status based on decision
            let newContractStatus = 'dispute'; // default
            if (decision === 'refund_client') newContractStatus = 'cancelled_refunded';
            if (decision === 'release_freelancer') newContractStatus = 'completed';
            
            if (newContractStatus !== 'dispute') {
                await supabase
                    .from('contracts')
                    .update({ status: newContractStatus })
                    .eq('id', selectedDispute.contracts.id);
            }

            toast({
                title: "Disputa resolvida",
                description: "A decisão foi registrada e o contrato atualizado.",
            });
            
            setSelectedDispute(null);
            fetchDisputes();

        } catch (error) {
            console.error("Error resolving dispute:", error);
            toast({
                variant: "destructive",
                title: "Erro ao resolver disputa",
                description: "Tente novamente.",
            });
        }
    };

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
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mediação de Disputas ⚠️</h1>
                        <p className="text-slate-500">Gerencie conflitos e tome decisões</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {disputes.length === 0 ? (
                        <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                                <h3 className="text-lg font-medium">Tudo tranquilo por aqui!</h3>
                                <p>Nenhuma disputa aberta no momento.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        disputes.map((dispute) => (
                            <Card key={dispute.id} className="border-l-4 border-l-red-500 shadow-sm">
                                <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge variant="outline" className="mb-2 bg-red-100 text-red-700 border-red-200">
                                                {dispute.status === 'pending' ? 'Aguardando Análise' : 
                                                 dispute.status === 'under_review' ? 'Em Análise' : 'Resolvido'}
                                            </Badge>
                                            <CardTitle className="text-lg text-slate-900">
                                                {dispute.contracts?.projects?.title || "Contrato Removido"}
                                            </CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Aberto por <span className="font-medium text-slate-900">{dispute.opener?.full_name}</span> em {format(new Date(dispute.created_at), "dd/MM/yyyy")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-slate-900">
                                                {formatCurrency(dispute.contracts?.amount || 0)}
                                            </div>
                                            <p className="text-xs text-slate-500">Valor em disputa</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900 mb-1">Motivo da Disputa:</h4>
                                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm border border-slate-200">
                                                {dispute.reason}
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="p-3 border rounded-lg bg-white">
                                                <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Cliente</span>
                                                <p className="font-medium">{dispute.contracts?.client?.full_name}</p>
                                                <p className="text-slate-500">{dispute.contracts?.client?.email}</p>
                                            </div>
                                            <div className="p-3 border rounded-lg bg-white">
                                                <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Freelancer</span>
                                                <p className="font-medium">{dispute.contracts?.freelancer?.full_name}</p>
                                                <p className="text-slate-500">{dispute.contracts?.freelancer?.email}</p>
                                            </div>
                                        </div>

                                        {dispute.status !== 'resolved' && (
                                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button onClick={() => setSelectedDispute(dispute)} className="bg-indigo-600 hover:bg-indigo-700">
                                                            Resolver Disputa
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[500px]">
                                                        <DialogHeader>
                                                            <DialogTitle>Resolver Disputa</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">Justificativa da Decisão</label>
                                                                <Textarea 
                                                                    placeholder="Explique o motivo da decisão..." 
                                                                    value={resolution}
                                                                    onChange={(e) => setResolution(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                <Button 
                                                                    onClick={() => handleResolve(dispute.id, 'refund_client')}
                                                                    variant="outline" 
                                                                    className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <ArrowDownLeft className="mr-2 h-4 w-4" /> 
                                                                    Estornar para Cliente (Cancelar)
                                                                </Button>
                                                                <Button 
                                                                    onClick={() => handleResolve(dispute.id, 'release_freelancer')}
                                                                    variant="outline" 
                                                                    className="justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> 
                                                                    Liberar Pagamento (Concluir)
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        )}
                                        
                                        {dispute.status === 'resolved' && (
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                                                <p className="text-sm text-green-800 font-medium flex items-center">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Disputa resolvida em {format(new Date(dispute.resolved_at), "dd/MM/yyyy HH:mm")}
                                                </p>
                                                <p className="text-sm text-green-700 mt-1 pl-6">
                                                    {dispute.resolution}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function ArrowDownLeft({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M17 7 7 17" />
            <path d="M17 17H7V7" />
        </svg>
    )
}
