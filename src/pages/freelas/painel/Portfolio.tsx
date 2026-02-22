import { useState, useEffect } from 'react';
import { FreelasLayout } from '@/components/layout/freelas/FreelasLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Image as ImageIcon, Briefcase, FileText, DollarSign, Clock, Tag, Trash2, Edit3, Loader2, CheckCircle2 } from 'lucide-react';

export default function FreelasPortfolio() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [deliveryDays, setDeliveryDays] = useState('');
    const [category, setCategory] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchProjects();
    }, [user]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('freelancer_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error: any) {
            toast({ title: 'Erro ao buscar portfólio', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !price || !deliveryDays) return;

        setIsSubmitting(true);
        console.log("Iniciando publicação...", { title, price, deliveryDays, category, hasFile: !!coverFile });

        try {
            let coverUrl = null;

            // Upload Cover Image if selected
            if (coverFile && user) {
                const fileExt = coverFile.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/portfolio/${fileName}`;

                console.log("Fazendo upload da imagem...", filePath);
                const { error: uploadError } = await supabase.storage
                    .from('projects')
                    .upload(filePath, coverFile);

                if (uploadError) {
                    console.error("Erro no upload:", uploadError);
                    throw uploadError;
                }

                const { data: publicUrlData } = supabase.storage.from('projects').getPublicUrl(filePath);
                coverUrl = publicUrlData.publicUrl;
                console.log("Upload concluído. URL:", coverUrl);
            }

            // Insert Project record
            console.log("Inserindo no banco de dados...");
            const { error } = await supabase
                .from('projects')
                .insert({
                    freelancer_id: user?.id,
                    title,
                    description,
                    price: parseFloat(price.toString()),
                    delivery_time_days: parseInt(deliveryDays.toString()),
                    category: category || 'Outros',
                    status: 'published',
                    cover_image_url: coverUrl,
                });

            if (error) {
                console.error("Erro na inserção do projeto:", error);
                throw error;
            }

            console.log("Projeto publicado com sucesso!");
            toast({ title: 'Projeto Publicado!', description: 'Seu serviço já está visível no Marketplace.' });

            // Reset & Reload
            setIsModalOpen(false);
            setTitle('');
            setDescription('');
            setPrice('');
            setDeliveryDays('');
            setCategory('');
            setCoverFile(null);
            fetchProjects();

        } catch (error: any) {
            console.error("Erro fatal na publicação:", error);
            toast({
                title: 'Erro ao publicar',
                description: error.message || 'Erro inesperado ao salvar no banco.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este serviço do portfólio?')) return;

        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;

            toast({ title: 'Excluído com sucesso' });
            setProjects(projects.filter(p => p.id !== id));
        } catch (error: any) {
            toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
        }
    };

    return (
        <FreelasLayout>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meu Portfólio 🎨</h1>
                    <p className="text-slate-500 mt-1">Crie e gerencie os serviços empacotados que você oferece no Marketplace.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="h-12 px-6 rounded-xl shadow-md bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                    <Plus className="w-5 h-5 mr-2" /> Novo Projeto
                </Button>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div>)}
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-teal-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Seu portfólio está vazio</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Os clientes contam com seus serviços. Comece publicando o seu primeiro empacotamento para atrair novos negócios.</p>
                    <Button onClick={() => setIsModalOpen(true)} className="rounded-xl px-8 h-12 font-bold bg-slate-900 text-white hover:bg-slate-800">
                        <Plus className="w-5 h-5 mr-2" /> Criar Primeiro Serviço
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full relative">

                            {/* Status Overlay */}
                            <div className="absolute top-6 right-6 z-10 hidden group-hover:flex items-center gap-2">
                                <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-slate-700 shadow-sm border border-slate-200 hover:text-teal-600">
                                    <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="destructive" size="icon"
                                    className="w-8 h-8 rounded-full shadow-sm hover:bg-red-600 focus:bg-red-700 bg-red-500 text-white"
                                    onClick={() => handleDelete(project.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="h-40 rounded-xl bg-slate-100 mb-4 overflow-hidden relative border border-slate-100">
                                {project.cover_image_url ? (
                                    <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                        <ImageIcon className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                                <span className={`absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${project.status === 'published' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-slate-800/90 text-slate-100 border-slate-700'}`}>
                                    {project.status === 'published' ? 'Ativo' : 'Rascunho'}
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold flex items-center"><Tag className="w-3 h-3 mr-1" /> {project.category || 'Geral'}</span>
                                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold flex items-center"><Clock className="w-3 h-3 mr-1" /> {project.delivery_time_days} dias</span>
                                </div>
                                <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-teal-700 transition-colors">{project.title}</h3>

                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">A partir de</span>
                                        <span className="text-xl font-extrabold text-teal-600">R$ {Number(project.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Criar Projeto */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl gap-0">
                    <div className="p-8 pb-6 bg-slate-50 border-b border-slate-100 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-teal-500" />
                        <DialogTitle className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                            <Briefcase className="w-6 h-6 text-teal-600" /> Novo Serviço (Empacotado)
                        </DialogTitle>
                    </div>

                    <form onSubmit={handleCreateProject} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Cover Image Upload */}
                        <div className="space-y-3">
                            <Label className="font-bold text-slate-900 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-slate-400" /> Imagem de Capa (Obligatória)</Label>
                            <div className="border-2 border-dashed border-slate-200 hover:border-teal-300 bg-slate-50 rounded-2xl p-6 text-center transition-colors relative group h-32 flex flex-col items-center justify-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                    required
                                />
                                {coverFile ? (
                                    <div className="text-emerald-600 font-bold flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" /> Arquivo selecionado: {coverFile.name}
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-slate-300 mb-2 group-hover:text-teal-500 transition-colors" />
                                        <span className="text-sm font-semibold text-slate-600">Clique ou arraste uma imagem 16:9</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="title" className="font-bold text-slate-900">Título Atraente do Serviço</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="title"
                                    placeholder="Ex: Identidade Visual Completa para Startups"
                                    className="pl-9 h-12 rounded-xl border-slate-200 focus-visible:ring-teal-500 font-medium"
                                    value={title} onChange={(e) => setTitle(e.target.value)} required
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="price" className="font-bold text-slate-900">Preço (R$)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="price" type="number" step="0.01" min="10" placeholder="0.00"
                                        className="pl-9 h-12 rounded-xl border-slate-200 focus-visible:ring-teal-500 font-medium"
                                        value={price} onChange={(e) => setPrice(e.target.value)} required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="delivery" className="font-bold text-slate-900">Prazo (Dias)</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="delivery" type="number" min="1" placeholder="Ex: 7"
                                        className="pl-9 h-12 rounded-xl border-slate-200 focus-visible:ring-teal-500 font-medium"
                                        value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="category" className="font-bold text-slate-900">Categoria Principal</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                    <select
                                        id="category"
                                        className="w-full h-12 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus-visible:ring-2 focus-visible:ring-teal-500 outline-none appearance-none"
                                        value={category} onChange={(e) => setCategory(e.target.value)} required
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        <option value="Design">Design & UI/UX</option>
                                        <option value="Desenvolvimento">Desenvolvimento & TI</option>
                                        <option value="Marketing">Marketing Digital</option>
                                        <option value="Escrita">Escrita & Tradução</option>
                                        <option value="Vídeo">Áudio & Vídeo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="desc" className="font-bold text-slate-900">Descrição Detalhada do Serviço</Label>
                            <Textarea
                                id="desc"
                                placeholder="Descreva exatamente o que o cliente irá receber, o que não está incluso e quantas revisões são permitidas..."
                                className="h-32 resize-none rounded-xl border-slate-200 focus-visible:ring-teal-500 p-4 font-medium"
                                value={description} onChange={(e) => setDescription(e.target.value)} required
                            />
                        </div>

                    </form>

                    <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex-col sm:flex-row gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="w-full sm:w-auto h-12 rounded-xl font-bold text-slate-600 border-slate-300">
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleCreateProject} disabled={isSubmitting} className="w-full sm:w-[220px] h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md">
                            {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publicando...</> : 'Publicar no Marketplace'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FreelasLayout>
    );
}
