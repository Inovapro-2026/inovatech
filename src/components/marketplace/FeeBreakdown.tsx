
import { motion } from 'framer-motion';
import { Shield, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeeBreakdownProps {
    serviceValue: number;
    className?: string;
}

export function FeeBreakdown({ serviceValue, className }: FeeBreakdownProps) {
    const getFeeDetails = (value: number) => {
        if (value <= 500) return { percentage: 15, label: 'Transação Inicial' };
        if (value <= 2000) return { percentage: 10, label: 'Intermediário' };
        return { percentage: 7, label: 'Grande Escala' };
    };

    const { percentage, label } = getFeeDetails(serviceValue);
    const feeAmount = serviceValue * (percentage / 100);
    const totalAmount = serviceValue + feeAmount;

    return (
        <div className={cn("bg-card border border-border rounded-2xl overflow-hidden shadow-sm", className)}>
            <div className="bg-primary/5 p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Resumo do Checkout</span>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Taxa Zero Mensal
                </span>
            </div>

            <div className="p-5 space-y-4">
                {/* Breakdown */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Valor do Serviço</span>
                        <span className="font-medium text-foreground">
                            R$ {serviceValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Taxa de Proteção INOVAPRO</span>
                            <div className="group relative">
                                <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                                    Esta taxa garante o sistema de escrow (salvaguarda), mediação e suporte 24/7.
                                </div>
                            </div>
                        </div>
                        <span className="font-semibold text-rose-500">
                            + R$ {feeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percentage}%)
                        </span>
                    </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-border flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Total a Pagar</span>
                        <span className="text-2xl font-black text-foreground tracking-tighter">
                            R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Proteção Ativa
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 py-3 bg-muted/30 border-t border-border mt-2">
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    * A INOVAPRO não cobra taxas recorrentes. O valor acima é o custo total único para este projeto.
                </p>
            </div>
        </div>
    );
}
