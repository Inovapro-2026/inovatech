import { FileText, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/financial';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@/contexts/AuthContext';

interface InvoiceListProps {
    transactions: Transaction[];
    loading: boolean;
}

export function InvoiceList({ transactions, loading }: InvoiceListProps) {
    const { profile } = useAuth();

    // Filtrar apenas ganhos concluídos para simular faturas
    const invoices = transactions.filter(t => t.type === 'earnings' && t.status === 'completed');

    const generatePDF = (inv: Transaction, index: number) => {
        const doc = new jsPDF();
        const invoiceNumber = `INV-${new Date(inv.created_at).getFullYear()}-${String(index + 1).padStart(3, '0')}`;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(13, 148, 136); // Teal 600
        doc.text('INOVAPRO', 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text('Plataforma de Freelancers', 20, 26);

        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.text('FATURA DE PRESTAÇÃO DE SERVIÇO', 20, 45);

        // Horizontal line
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 50, 190, 50);

        // Info blocks
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('PRESTADOR:', 20, 60);
        doc.setTextColor(15, 23, 42);
        doc.text(profile?.full_name || 'Freelancer', 20, 66);
        doc.text(profile?.email || '', 20, 71);

        doc.setTextColor(100, 116, 139);
        doc.text('DADOS DA FATURA:', 120, 60);
        doc.setTextColor(15, 23, 42);
        doc.text(`Número: ${invoiceNumber}`, 120, 66);
        doc.text(`Data: ${new Date(inv.created_at).toLocaleDateString('pt-BR')}`, 120, 71);
        doc.text(`Status: PAGA`, 120, 76);

        // Table
        autoTable(doc, {
            startY: 90,
            head: [['Descrição do Serviço', 'Data de Conclusão', 'Valor']],
            body: [
                [
                    inv.description || inv.contract?.projects?.title || 'Serviço Prestado',
                    new Date(inv.created_at).toLocaleDateString('pt-BR'),
                    `R$ ${inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                ]
            ],
            headStyles: { fillColor: [13, 148, 136] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 90 }
        });

        // Total
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('VALOR TOTAL LÍQUIDO:', 120, finalY);
        doc.text(`R$ ${inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 170, finalY, { align: 'right' });

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Esta é uma fatura gerada automaticamente pela plataforma INOVAPRO.', 105, 280, { align: 'center' });

        doc.save(`${invoiceNumber}.pdf`);
    };

    if (loading) return <div className="p-8 text-center">Carregando faturas...</div>;

    if (invoices.length === 0) {
        return (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Nenhuma fatura disponível</h3>
                <p className="text-slate-500 text-sm">Faturas são geradas automaticamente após a conclusão de projetos.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {invoices.map((inv, index) => (
                <div key={inv.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                            <FileText className="w-6 h-6 text-slate-400 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-black text-slate-900">Fatura #INV-{new Date(inv.created_at).getFullYear()}-{String(index + 1).padStart(3, '0')}</h4>
                                <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border-none">Paga</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(inv.created_at).toLocaleDateString('pt-BR')}</span>
                                <span className="text-slate-300">•</span>
                                <span>{inv.description || "Serviço Prestado"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Valor Total</p>
                            <p className="text-lg font-black text-slate-900">R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <Button
                            onClick={() => generatePDF(inv, index)}
                            variant="ghost" className="h-12 w-12 rounded-2xl p-0 hover:bg-teal-50 hover:text-teal-600 transition-all active:scale-90"
                        >
                            <Download className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
