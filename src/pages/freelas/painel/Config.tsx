import { useState, useEffect } from 'react';
import { FreelasLayout } from '@/components/layout/freelas/FreelasLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User as UserIcon, Lock, Building, Tag, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function FreelasConfig() {
    const { user, profile, refreshProfile } = useAuth();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState('perfil');
    const [loading, setLoading] = useState(false);

    // Perfil State
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [cpf, setCpf] = useState(profile?.cpf || '');
    const [tags, setTags] = useState(['React', 'TypeScript', 'Node.js', 'UI/UX']);
    const [newTag, setNewTag] = useState('');

    // Imagem State
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setBio(profile.bio || '');
            setPhone(profile.phone || '');
            setCpf(profile.cpf || '');
            setAvatarUrl(profile.avatar_url || '');
        }
    }, [profile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    bio,
                    phone,
                    cpf
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas com sucesso.' });
        } catch (error: any) {
            toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;

        setUploadingImage(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        // Usar um nome fixo ou timestamp para evitar lixo, mas permitir sobrescrever
        const fileName = `avatar_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        console.log("Iniciando upload de avatar...", { filePath, size: file.size });

        try {
            // Upload com upsert para evitar erro de arquivo já existente
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error("Erro no upload do Storage:", uploadError);
                throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const newAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`; // Cache busting

            console.log("Imagem enviada. Atualizando perfil com URL:", newAvatarUrl);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: newAvatarUrl })
                .eq('id', user.id);

            if (updateError) {
                console.error("Erro ao atualizar tabela profiles:", updateError);
                throw updateError;
            }

            setAvatarUrl(newAvatarUrl);
            if (refreshProfile) await refreshProfile();

            toast({ title: 'Foto atualizada com sucesso! ✨' });

        } catch (error: any) {
            console.error("Erro fatal no avatar:", error);
            toast({
                title: 'Erro ao atualizar foto',
                description: error.message || 'Verifique sua conexão e tente novamente.',
                variant: 'destructive'
            });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault();
            if (!tags.includes(newTag.trim())) {
                setTags([...tags, newTag.trim()]);
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
        <FreelasLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configurações ⚙️</h1>
                <p className="text-slate-500 mt-1">Gerencie seu perfil público, preferências de conta e segurança.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar de Configurações */}
                <div className="w-full lg:w-64 shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col p-2 space-y-1">
                        <button
                            onClick={() => setActiveTab('perfil')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors w-full text-left ${activeTab === 'perfil' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <UserIcon className="w-5 h-5" /> Perfil Público
                        </button>
                        <button
                            onClick={() => setActiveTab('tags')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors w-full text-left ${activeTab === 'tags' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Tag className="w-5 h-5" /> Habilidades (IA)
                        </button>
                        <button
                            onClick={() => setActiveTab('banco')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors w-full text-left ${activeTab === 'banco' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Building className="w-5 h-5" /> Dados Financeiros
                        </button>
                        <button
                            onClick={() => setActiveTab('seguranca')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors w-full text-left ${activeTab === 'seguranca' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Lock className="w-5 h-5" /> Segurança
                        </button>
                    </div>
                </div>

                {/* Área de Conteúdo */}
                <div className="flex-1">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                        {/* ABA: PERFIL PÚBLICO */}
                        {activeTab === 'perfil' && (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-xl font-extrabold text-slate-900 leading-none mb-1">Perfil Público</h2>
                                    <p className="text-sm text-slate-500">Estas informações são exibidas aos clientes no Marketplace.</p>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Foto */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                                                <AvatarImage src={avatarUrl} className="object-cover" />
                                                <AvatarFallback className="bg-teal-100 text-teal-700 text-3xl font-bold">{fullName.charAt(0) || 'F'}</AvatarFallback>
                                            </Avatar>
                                            <label className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10 text-white">
                                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingImage} />
                                                {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Foto de Perfil</h3>
                                            <p className="text-sm text-slate-500 max-w-sm mt-1">Imagens quadradas, em alta resolução (.jpg, .png). Máx 5MB.</p>
                                        </div>
                                    </div>

                                    {/* Formulário Dados */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-bold">Nome de Apresentação</Label>
                                            <Input className="h-12 rounded-xl focus-visible:ring-teal-500" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">Telefone / WhatsApp</Label>
                                            <Input className="h-12 rounded-xl focus-visible:ring-teal-500" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold">Bio / Apresentação Resumida</Label>
                                        <Textarea
                                            className="h-32 rounded-xl resize-none focus-visible:ring-teal-500"
                                            placeholder="Fale sobre suas experiências, ferramentas de domínio e conquistas..."
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-900">CPF (Para NFe e Pagamentos)</Label>
                                        <Input className="h-12 rounded-xl focus-visible:ring-teal-500 md:w-1/2" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                                    <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 shadow-sm text-white">
                                        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* ABA: HABILIDADES IA */}
                        {activeTab === 'tags' && (
                            <div>
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-xl font-extrabold text-slate-900 leading-none mb-1">Tags Interativas</h2>
                                    <p className="text-sm text-slate-500">Palavras-chave são usadas pelo algoritmo de IA para te recomendar aos clientes.</p>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-3">
                                        <Label className="font-bold text-slate-900">Adicionar Nova Especialidade</Label>
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="Pressione enter para adicionar"
                                                className="h-12 rounded-xl md:w-1/2 focus-visible:ring-teal-500"
                                                value={newTag}
                                                onChange={e => setNewTag(e.target.value)}
                                                onKeyDown={handleAddTag}
                                            />
                                            <Button type="button" onClick={() => handleAddTag({ key: 'Enter', preventDefault: () => { } } as any)} className="h-12 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800">
                                                Adicionar
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-inner flex flex-wrap gap-2 min-h-32 content-start">
                                        {tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="ml-2 hover:bg-teal-200 rounded-full p-0.5 text-teal-900">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </span>
                                        ))}
                                        {tags.length === 0 && <span className="text-slate-400 italic font-medium m-auto">Nenhuma tag cadastrada...</span>}
                                    </div>
                                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 items-start border border-blue-100">
                                        <CheckCircle2 className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                                        <p className="text-sm font-semibold">Dica: Adicione termos que clientes procuram, como "Figma", "Redator SEO", "Node.js", "Tradução Inglês".</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OTHER TABS SIMPLIFIED OR PLACEHOLDERS */}
                        {activeTab === 'banco' && (
                            <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                                <Building className="w-16 h-16 text-slate-300 mb-4" />
                                <h3 className="text-xl font-extrabold text-slate-700 mb-2">Configure no Saque</h3>
                                <p>Os seus dados bancários (Chave PIX) são solicitados a cada operação de saque na aba Financeiro para garantir a máxima segurança da transação.</p>
                            </div>
                        )}

                        {activeTab === 'seguranca' && (
                            <div className="p-8 space-y-6">
                                <div className="border-b border-slate-100 pb-6">
                                    <h2 className="text-xl font-extrabold text-slate-900 mb-1">Mudar Senha</h2>
                                    <p className="text-sm text-slate-500">Lhe enviaremos um link de redefinição para o e-mail: {user?.email}</p>
                                </div>
                                <Button className="h-12 px-6 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800">
                                    <Lock className="w-4 h-4 mr-2" /> Enviar Link de Redefinição
                                </Button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </FreelasLayout>
    );
}
