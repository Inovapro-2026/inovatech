import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { PaymentMethod } from '@/types/financial';
import { useToast } from '@/hooks/use-toast';

interface WithdrawModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableBalance: number;
    paymentMethods: PaymentMethod[];
    onRequestWithdraw: (amount: number, method: PaymentMethod) => Promise<void>;
}

export function WithdrawModal({
    open,
    onOpenChange,
    availableBalance,
    paymentMethods,
    onRequestWithdraw
}: WithdrawModalProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState('');
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(amount.replace(',', '.'));
        const method = paymentMethods.find(m => m.id === selectedMethodId);

        if (!numAmount || numAmount < 50) {
            toast({ title: "Valor inválido", description: "O valor mínimo para saque é R$ 50,00", variant: "destructive" });
            return;
        }

        if (numAmount > availableBalance) {
            toast({ title: "Saldo insuficiente", description: "Você não possui saldo suficiente para este saque", variant: "destructive" });
            return;
        }

        if (!method) {
            toast({ title: "Método inválido", description: "Selecione um método de recebimento", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            await onRequestWithdraw(numAmount, method);
            onOpenChange(false);
            setAmount('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">
                <div className="px-8 pt-8 pb-6 border-b border-slate-100 bg-slate-50/50">
                    <DialogTitle className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                        <Building className="w-6 h-6 text-teal-600" /> Solicitar Saque
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                        Retirada de fundos para sua conta
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                        <span className="text-emerald-700 font-bold text-sm">Disponível:</span>
                        <span className="text-emerald-600 font-black text-xl tabular-nums">R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-[0.1em] text-slate-500">Valor do Saque</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-emerald-600" />
                            <Input
                                type="text"
                                placeholder="0,00"
                                className="pl-10 h-14 rounded-2xl text-xl font-black focus-visible:ring-teal-500 border-slate-200"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setAmount(availableBalance.toString())}
                                className="absolute right-4 top-4.5 text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest"
                            >
                                Máximo
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-[0.1em] text-slate-500">Destino do Pagamento</Label>
                        <Select value={selectedMethodId} onValueChange={setSelectedMethodId} required>
                            <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold">
                                <SelectValue placeholder="Selecione uma conta..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200">
                                {paymentMethods.map(m => (
                                    <SelectItem key={m.id} value={m.id} className="cursor-pointer font-bold py-3">
                                        <div className="flex flex-col text-left">
                                            <span>{m.label}</span>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.type === 'pix' ? `PIX: ${m.data.key}` : `${m.data.bank} - ${m.data.account}`}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                                {paymentMethods.length === 0 && (
                                    <div className="p-4 text-center text-xs text-slate-400 font-bold">
                                        Nenhum método cadastrado
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                        <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-slate-500 leading-normal">
                            Processamento estimado em <strong className="text-slate-700">2 a 3 dias úteis</strong>.
                            Para saques via PIX, o prazo é de até <strong className="text-slate-700">1 hora útil</strong>.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting || availableBalance < 50}
                        className="w-full h-14 rounded-2xl text-base font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all active:scale-95"
                    >
                        {isSubmitting ? 'Processando...' : 'Confirmar Solicitação'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
