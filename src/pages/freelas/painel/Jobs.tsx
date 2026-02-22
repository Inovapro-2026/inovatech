import { useState, useEffect } from 'react';
import { FreelasLayout } from '@/components/layout/freelas/FreelasLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, UploadCloud, FileType, CheckCircle2, Clock, Eye, Send, Loader2 } from 'lucide-react';

export default function FreelasJobs() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState('andamento');
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal Delivery State
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<any>(null);
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchJobs();
    }, [user, activeTab]);

    const fetchJobs = async () => {
        setLoading(true);
        let statusFilter = ['in_progress'];

        if (activeTab === 'entregues') {
            statusFilter = ['delivered'];
        } else if (activeTab === 'concluidos') {
            statusFilter = ['completed'];
        }

        try {
            const { data, error } = await supabase
                .from('contracts')
                .select(`
          *,
          projects (title, cover_image_url),
          profiles!contracts_client_id_fkey (full_name, avatar_url)
        `)
                .eq('freelancer_id', user.id)
                .in('status', statusFilter)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error: any) {
            console.error("Erro ao buscar jobs:", error);
            toast({
                title: "Erro ao buscar projetos",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (files.length + newFiles.length > 5) {
                toast({ title: 'Limite excedido', description: 'Máximo de 5 arquivos permitidos.', variant: 'destructive' });
                return;
            }
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDeliverySubmit = async () => {
        if (!selectedContract || !deliveryMessage.trim()) {
            toast({ title: 'Atenção', description: 'Preencha a descrição da entrega.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        const uploadedUrls: string[] = [];

        try {
            // 1. Upload files
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `${user?.id}/${selectedContract.id}/${fileName}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('deliveries')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: publicUrl } = supabase.storage.from('deliveries').getPublicUrl(filePath);
                uploadedUrls.push(publicUrl.publicUrl);
            }

            // 2. Insert Delivery
            const { error: deliveryError } = await supabase
                .from('deliveries')
                .insert({
                    contract_id: selectedContract.id,
                    message: deliveryMessage,
                    files_urls: uploadedUrls
                });

            if (deliveryError) throw deliveryError;

            // 3. Update Contract
            const { error: contractUpdateError } = await supabase
                .from('contracts')
                .update({ status: 'delivered', updated_at: new Date().toISOString() })
                .eq('id', selectedContract.id);

            if (contractUpdateError) throw contractUpdateError;

            // Success
            toast({
                title: 'Entrega enviada com sucesso! 🚀',
                description: 'O cliente foi notificado e revisará seu trabalho em breve.',
            });

            setIsDeliveryModalOpen(false);
            setDeliveryMessage('');
            setFiles([]);
            setSelectedContract(null);
            fetchJobs(); // reload

        } catch (error: any) {
            console.error("Erro no envio da entrega:", error);
            toast({
                title: 'Erro ao enviar entrega',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FreelasLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meus Jobs 💼</h1>
                <p className="text-slate-500 mt-1">Acompanhe seus contratos, faça entregas e gerencie aprovações.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border text-foreground border-slate-200 p-1 w-full md:w-auto inline-flex rounded-xl h-auto mb-6 shadow-sm">
                    <TabsTrigger value="andamento" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 font-semibold text-slate-500 transition-colors">
                        Em Andamento
                        {activeTab === 'andamento' && jobs.length > 0 && <span className="ml-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">{jobs.length}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="entregues" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 font-semibold text-slate-500 transition-colors">
                        Aguardando Aprovação
                        {activeTab === 'entregues' && jobs.length > 0 && <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{jobs.length}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="concluidos" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-semibold text-slate-500 transition-colors">
                        Concluídos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {loading ? (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div>
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">Nenhum projeto encontrado</h3>
                            <p className="text-slate-500 mt-2">Você não possui contratos nesta categoria no momento.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full card-hover group">

                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4 gap-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={job.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${job.profiles?.full_name?.replace(' ', '+')}&bg=0d9488&color=fff`}
                                                alt={job.profiles?.full_name}
                                                className="w-10 h-10 rounded-full border border-slate-100 object-cover shrink-0"
                                            />
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 leading-tight">{job.profiles?.full_name}</h4>
                                                <span className="text-xs text-slate-500 font-medium">Cliente Verificado</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {job.status === 'in_progress' && <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md border border-blue-100 whitespace-nowrap"><Clock className="w-3 h-3 inline mr-1 -mt-0.5" /> Ativo</span>}
                                        {job.status === 'delivered' && <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-1 rounded-md border border-amber-100 whitespace-nowrap"><Clock className="w-3 h-3 inline mr-1 -mt-0.5" /> Revisão</span>}
                                        {job.status === 'completed' && <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md border border-emerald-100 whitespace-nowrap"><CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" /> Pago</span>}
                                    </div>

                                    {/* Thumbnail */}
                                    {job.projects?.cover_image_url && (
                                        <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-slate-100 border border-slate-200 group-hover:border-teal-200 transition-colors">
                                            <img src={job.projects.cover_image_url} alt={job.projects.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}

                                    {/* Info */}
                                    <h3 className="font-extrabold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-teal-700 transition-colors">{job.projects?.title || 'Projeto Autônomo'}</h3>

                                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
                                        <div>
                                            <span className="text-xs text-slate-500 font-medium block mb-1">Valor Bruto</span>
                                            <span className="font-extrabold text-teal-600 text-xl">R$ {Number(job.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>

                                        {job.status === 'in_progress' && (
                                            <Button
                                                className="rounded-xl shadow-sm bg-teal-600 hover:bg-teal-700"
                                                onClick={() => { setSelectedContract(job); setIsDeliveryModalOpen(true); }}
                                            >
                                                Entregar <Send className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                        {job.status === 'delivered' && (
                                            <Button variant="outline" className="rounded-xl font-semibold bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 pointer-events-none">
                                                Aguardando <Clock className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                        {job.status === 'completed' && (
                                            <Button variant="outline" className="rounded-xl text-slate-700 border-slate-300 hover:bg-slate-50">
                                                Ver Detalhes <Eye className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Modal de Conclusão / Entrega */}
            <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl gap-0">
                    <div className="p-8 pb-6 bg-slate-50 border-b border-slate-100 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-teal-500" />
                        <DialogTitle className="text-2xl font-extrabold flex items-center gap-3">
                            <Send className="w-6 h-6 text-teal-600" /> Fazer Entrega Final
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium mt-2">
                            Projeto: <span className="font-bold text-slate-900">{selectedContract?.projects?.title}</span>
                        </DialogDescription>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900 block">Mensagem ao Cliente <span className="text-red-500">*</span></label>
                            <Textarea
                                placeholder="Descreva o que foi feito, as ferramentas utilizadas e anexe os arquivos finais."
                                className="h-32 rounded-2xl resize-none border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                value={deliveryMessage}
                                onChange={(e) => setDeliveryMessage(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900 block flex justify-between">
                                Anexos e Arquivos Finais
                                <span className="text-xs text-slate-500 font-medium">{files.length}/5 arquivos</span>
                            </label>

                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-center relative group">
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    disabled={files.length >= 5 || isSubmitting}
                                />
                                <UploadCloud className="w-8 h-8 text-teal-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <p className="font-semibold text-slate-700">Clique ou arraste até 5 arquivos</p>
                                <p className="text-xs text-slate-400 mt-1">Imagens, Videos, PDFs, ou Zips (Max: 50MB/cada)</p>
                            </div>

                            {/* Lista de Selecionados */}
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileType className="w-5 h-5 text-teal-600 shrink-0" />
                                                <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 rounded-lg">
                                                Remover
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 sm:justify-end gap-3 flex flex-col sm:flex-row">
                        <Button type="button" variant="outline" onClick={() => setIsDeliveryModalOpen(false)} className="rounded-xl h-12 w-full sm:w-auto font-semibold" disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleDeliverySubmit} disabled={isSubmitting} className="rounded-xl h-12 w-full sm:w-auto font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md">
                            {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando Entrega...</> : 'Enviar para Revisão Oficial'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FreelasLayout>
    );
}
