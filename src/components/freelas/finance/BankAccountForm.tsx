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
import { CreditCard, Landmark, Zap } from 'lucide-react';

interface BankAccountFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: any) => Promise<void>;
}

export function BankAccountForm({ open, onOpenChange, onSave }: BankAccountFormProps) {
    const [type, setType] = useState<'pix' | 'bank'>('pix');
    const [label, setLabel] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [bankName, setBankName] = useState('');
    const [agency, setAgency] = useState('');
    const [account, setAccount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                type,
                label,
                data: type === 'pix' ? { key: pixKey } : { bank: bankName, agency, account },
                is_default: false
            };
            await onSave(payload);
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setLabel('');
        setPixKey('');
        setBankName('');
        setAgency('');
        setAccount('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">
                <div className="px-8 pt-8 pb-6 border-b border-slate-100 bg-slate-50/50">
                    <DialogTitle className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-teal-600" /> Adicionar Método
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                        Configure onde você deseja receber seus ganhos
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-[0.1em] text-slate-500">Tipo de Método</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setType('pix')}
                                className={`flex items-center justify-center gap-2 h-14 rounded-2xl border-2 transition-all font-bold ${type === 'pix' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                    }`}
                            >
                                <Zap className={`w-5 h-5 ${type === 'pix' ? 'text-teal-600' : 'text-slate-400'}`} />
                                PIX
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('bank')}
                                className={`flex items-center justify-center gap-2 h-14 rounded-2xl border-2 transition-all font-bold ${type === 'bank' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                    }`}
                            >
                                <Landmark className={`w-5 h-5 ${type === 'bank' ? 'text-teal-600' : 'text-slate-400'}`} />
                                Bancário
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-[0.1em] text-slate-500">Apelido da Conta</Label>
                        <Input
                            placeholder="Ex: Nubank Pessoal"
                            className="h-12 rounded-xl border-slate-200 font-bold"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            required
                        />
                    </div>

                    {type === 'pix' ? (
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-[0.1em] text-slate-500">Chave PIX</Label>
                            <Input
                                placeholder="CPF, E-mail ou Telefone"
                                className="h-12 rounded-xl border-slate-200 font-bold"
                                value={pixKey}
                                onChange={(e) => setPixKey(e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-[0.1em] text-slate-500">Banco</Label>
                                <Input
                                    placeholder="Ex: Itaú, Bradesco..."
                                    className="h-12 rounded-xl border-slate-200 font-bold"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs uppercase tracking-[0.1em] text-slate-500">Agência</Label>
                                    <Input
                                        placeholder="0001"
                                        className="h-12 rounded-xl border-slate-200 font-bold"
                                        value={agency}
                                        onChange={(e) => setAgency(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs uppercase tracking-[0.1em] text-slate-500">Número da Conta</Label>
                                    <Input
                                        placeholder="12345-6"
                                        className="h-12 rounded-xl border-slate-200 font-bold"
                                        value={account}
                                        onChange={(e) => setAccount(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 rounded-2xl text-base font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all active:scale-95 mt-4"
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar Método'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
