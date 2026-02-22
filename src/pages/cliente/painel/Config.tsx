import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, Shield, Bell, CreditCard, LogOut, FileText, Camera, CheckCircle2, Crown, MapPin, Globe, CreditCard as CardIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ConfigPage() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Profile Form
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        company_name: '',
        cnpj: '',
        timezone: 'America/Sao_Paulo'
    });

    // Password Form
    const [passwordForm, setPasswordForm] = useState({
        new_password: '',
        confirm_password: ''
    });

    // Preferences Form
    const [preferences, setPreferences] = useState({
        email_notifications: true,
        push_notifications: false,
        language: 'pt-BR'
    });

    // Billing History
    const [billingHistory, setBillingHistory] = useState<any[]>([]);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                company_name: profile.company_name || '',
                cnpj: profile.cnpj || '',
                timezone: profile.timezone || 'America/Sao_Paulo'
            });
            setPreferences({
                email_notifications: profile.email_notifications ?? true,
                push_notifications: profile.push_notifications ?? false,
                language: profile.language ?? 'pt-BR'
            });
        }
    }, [profile]);

    useEffect(() => {
        if (user) {
            fetchBillingHistory();
        }
    }, [user]);

    const fetchBillingHistory = async () => {
        try {
            const { data } = await supabase
                .from('contracts')
                .select('id, amount, created_at, status, mercadopago_payment_id, projects(title)')
                .eq('client_id', user!.id)
                .order('created_at', { ascending: false });

            if (data) setBillingHistory(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    company_name: formData.company_name,
                    cnpj: formData.cnpj,
                    timezone: formData.timezone
                })
                .eq('id', user!.id);

            if (error) throw error;
            toast.success('Perfil atualizado com sucesso!');
        } catch (error: any) {
            toast.error('Erro ao salvar perfil: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const filePath = `avatars/${user?.id}_${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user!.id);

            if (updateError) throw updateError;

            toast.success('Foto de perfil atualizada!');
        } catch (error: any) {
            toast.error('Erro ao carregar imagem: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            toast.error('As senhas não coincidem.');
            return;
        }
        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ password: passwordForm.new_password });
            if (error) throw error;
            toast.success('Senha alterada com sucesso!');
            setPasswordForm({ new_password: '', confirm_password: '' });
        } catch (error: any) {
            toast.error('Erro ao alterar senha: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('profiles')
                .update({
                    email_notifications: preferences.email_notifications,
                    push_notifications: preferences.push_notifications,
                    language: preferences.language
                })
                .eq('id', user!.id);

            if (error) throw error;
            toast.success('Preferências salvas com sucesso!');
        } catch (error: any) {
            toast.error('Erro ao salvar preferências.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/cliente/login');
    };

    return (
        <DashboardLayout type="client">
            <div className="max-w-5xl mx-auto pb-20">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Configurações</h1>
                        <p className="text-slate-500 mt-2 font-medium">Controle total sobre sua conta e dados profissionais.</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold rounded-xl"
                        onClick={() => setLogoutModalOpen(true)}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair da Conta
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-3">
                        <Tabs defaultValue="account" orientation="vertical" className="w-full">
                            <TabsList className="flex flex-col h-auto bg-transparent border-none p-0 space-y-1">
                                <TabsTrigger value="account" className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 font-bold transition-all gap-2">
                                    <User className="w-4 h-4" /> Conta
                                </TabsTrigger>
                                <TabsTrigger value="security" className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 font-bold transition-all gap-2">
                                    <Shield className="w-4 h-4" /> Segurança
                                </TabsTrigger>
                                <TabsTrigger value="preferences" className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 font-bold transition-all gap-2">
                                    <Bell className="w-4 h-4" /> Notificações
                                </TabsTrigger>
                                <TabsTrigger value="billing" className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 font-bold transition-all gap-2">
                                    <CreditCard className="w-4 h-4" /> Faturamento
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9">
                        <Tabs defaultValue="account" className="w-full">
                            <TabsContent value="account" className="mt-0">
                                <div className="space-y-6">
                                    {/* Profile Photo Card */}
                                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-black">Foto do Perfil</CardTitle>
                                            <CardDescription>Esta imagem será vista pelos freelancers.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-6">
                                                <div className="relative group">
                                                    <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-xl">
                                                        <AvatarImage src={profile?.avatar_url} />
                                                        <AvatarFallback className="bg-primary text-white text-2xl font-black">
                                                            {profile?.full_name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <button
                                                        onClick={() => avatarInputRef.current?.click()}
                                                        disabled={isUploading}
                                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer group-disabled:cursor-not-allowed"
                                                    >
                                                        <Camera className="text-white w-6 h-6" />
                                                    </button>
                                                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-bold text-slate-800">Mudar Avatar</p>
                                                    <p className="text-xs text-slate-400 max-w-[200px]">JPG, GIF ou PNG. Tamanho máximo de 2MB.</p>
                                                    <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} disabled={isUploading} className="rounded-xl border-primary text-primary hover:bg-primary/5">
                                                        {isUploading ? "Enviando..." : "Upload Novo"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Personal Info Card */}
                                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-black">Informações Pessoais</CardTitle>
                                        </CardHeader>
                                        <form onSubmit={handleSaveProfile}>
                                            <CardContent className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Nome Completo</Label>
                                                        <Input
                                                            value={formData.full_name}
                                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                            className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Email Principal</Label>
                                                        <Input value={user?.email || ''} disabled className="h-12 rounded-2xl bg-slate-100/50 border-transparent text-slate-400 cursor-not-allowed font-medium" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">WhatsApp / Telefone</Label>
                                                        <Input
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            placeholder="(00) 00000-0000"
                                                            className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Fuso Horário</Label>
                                                        <Select value={formData.timezone} onValueChange={(val) => setFormData({ ...formData, timezone: val })}>
                                                            <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-2xl">
                                                                <SelectItem value="America/Sao_Paulo">Brasil (Brasília) - GMT-3</SelectItem>
                                                                <SelectItem value="Europe/Lisbon">Portugal (Lisboa) - GMT+0</SelectItem>
                                                                <SelectItem value="UTC">Universal Time (UTC)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <Separator className="my-6 opacity-30" />

                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-primary" /> Detalhes da Empresa
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Nome da Empresa</Label>
                                                            <Input
                                                                value={formData.company_name}
                                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                                placeholder="Inova Tech LTDA"
                                                                className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">CNPJ / CPF</Label>
                                                            <Input
                                                                value={formData.cnpj}
                                                                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                                                placeholder="00.000.000/0000-00"
                                                                className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="bg-slate-50/50 p-6 flex justify-end">
                                                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dark rounded-2xl px-10 h-12 font-black shadow-lg shadow-primary/20">
                                                    {loading ? "Processando..." : "Salvar Configurações"}
                                                </Button>
                                            </CardFooter>
                                        </form>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="security" className="mt-0">
                                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-black">Segurança da Conta</CardTitle>
                                        <CardDescription>Altere sua senha regularmente para sua proteção.</CardDescription>
                                    </CardHeader>
                                    <form onSubmit={handleUpdatePassword}>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Nova Senha</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordForm.new_password}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                                        className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold"
                                                        required
                                                        minLength={6}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Confirmar Senha</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordForm.confirm_password}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                                        className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all font-bold"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 items-start">
                                                <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-800 leading-relaxed">
                                                    Certifique-se de que a nova senha tenha pelo menos 6 caracteres e inclua números e letras para maior segurança.
                                                </p>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-slate-50/50 p-6 flex justify-end">
                                            <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-black rounded-2xl px-10 h-12 font-black shadow-lg">
                                                {loading ? "Atualizando..." : "Atualizar Senha"}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </TabsContent>

                            <TabsContent value="preferences" className="mt-0">
                                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-black">Centro de Notificações</CardTitle>
                                        <CardDescription>Gerencie como e quando deseja ser alertado.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8 p-8">
                                        <div className="flex items-center justify-between group">
                                            <div className="space-y-1">
                                                <Label className="text-base font-black text-slate-800 group-hover:text-primary transition-colors">Notificações por Email</Label>
                                                <p className="text-xs text-slate-500 font-medium max-w-sm">Receba resumos semanais e alertas imediatos sobre entregas de projetos.</p>
                                            </div>
                                            <Switch
                                                checked={preferences.email_notifications}
                                                onCheckedChange={(checked) => setPreferences({ ...preferences, email_notifications: checked })}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>
                                        <Separator className="opacity-30" />
                                        <div className="flex items-center justify-between group">
                                            <div className="space-y-1">
                                                <Label className="text-base font-black text-slate-800 group-hover:text-primary transition-colors">Mensagens Diretas</Label>
                                                <p className="text-xs text-slate-500 font-medium max-w-sm">Alertas em tempo real quando um freelancer enviar uma nova mensagem.</p>
                                            </div>
                                            <Switch
                                                checked={true}
                                                disabled
                                                className="data-[state=checked]:bg-primary opacity-50"
                                            />
                                        </div>
                                        <Separator className="opacity-30" />
                                        <div className="flex items-center justify-between group">
                                            <div className="space-y-1">
                                                <Label className="text-base font-black text-slate-800 group-hover:text-primary transition-colors">Alertas Push (Navegador)</Label>
                                                <p className="text-xs text-slate-500 font-medium max-w-sm">Notificações diretas na tela do seu computador ou celular.</p>
                                            </div>
                                            <Switch
                                                checked={preferences.push_notifications}
                                                onCheckedChange={(checked) => setPreferences({ ...preferences, push_notifications: checked })}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 mt-6 max-w-xs space-y-3">
                                            <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Idioma da Interface</Label>
                                            <Select
                                                value={preferences.language}
                                                onValueChange={(val) => setPreferences({ ...preferences, language: val })}
                                            >
                                                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    <SelectItem value="pt-BR">Português (BR)</SelectItem>
                                                    <SelectItem value="en-US">English (US)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-slate-50/50 p-6 flex justify-end">
                                        <Button onClick={handleSavePreferences} disabled={loading} className="bg-primary hover:bg-primary-dark rounded-2xl px-10 h-12 font-black shadow-lg">
                                            Salvar Preferências
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="billing" className="mt-0 space-y-8">
                                {/* Plan Summary Card */}
                                <Card className="border-none bg-slate-900 text-white shadow-xl shadow-slate-200/50 rounded-[40px] p-8 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-8 transform group-hover:rotate-12 transition-transform opacity-10">
                                        <Crown className="w-40 h-40" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Crown className="w-8 h-8 text-amber-400" />
                                            <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black rounded-full px-4">CLIENTE VIP</Badge>
                                        </div>
                                        <h3 className="text-3xl font-black mb-2">Plano Profissional</h3>
                                        <p className="text-slate-400 font-medium mb-8">Você possui taxas reduzidas e suporte prioritário.</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-black">Grátis</span>
                                            <span className="text-slate-500 mb-1 font-bold">/ sempre</span>
                                        </div>
                                        <div className="mt-8 pt-8 border-t border-white/10 flex gap-4">
                                            <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black px-6">Ver Benefícios</Button>
                                            <Button variant="ghost" className="text-slate-400 font-bold hover:text-white hover:bg-white/5">Gerenciar Assinatura</Button>
                                        </div>
                                    </div>
                                </Card>

                                {/* Historical Payments Table */}
                                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                                        <div>
                                            <CardTitle className="text-xl font-black">Histórico Financeiro</CardTitle>
                                            <CardDescription>Acesse faturas e recibos de seus pagamentos passados.</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2">
                                            <CardIcon className="w-4 h-4" /> Exportar CSV
                                        </Button>
                                    </CardHeader>
                                    <div className="px-6 pb-6 overflow-x-auto">
                                        {billingHistory.length === 0 ? (
                                            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-400 font-bold">Nenhum registro encontrado</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b">
                                                    <tr>
                                                        <th className="px-6 py-4">Projeto</th>
                                                        <th className="px-6 py-4">Data</th>
                                                        <th className="px-6 py-4 text-right">Valor Pago</th>
                                                        <th className="px-6 py-4 text-center">Status</th>
                                                        <th className="px-6 py-4 text-center">Recibo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {billingHistory.map(row => (
                                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-slate-800 line-clamp-1">{row.projects?.title}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">Ref: {row.mercadopago_payment_id || row.id.slice(0, 8)}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500 font-medium">
                                                                {new Date(row.created_at).toLocaleDateString('pt-BR')}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="font-black text-slate-900">R$ {Number(row.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase bg-emerald-50 px-3 py-1.5 rounded-full">
                                                                    <CheckCircle2 className="w-3 h-3" /> Pago
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary rounded-xl">
                                                                    <FileText className="w-4 h-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-sm">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                            <LogOut className="w-10 h-10 -ml-1" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-black text-slate-800">Sair da Conta?</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium leading-relaxed">
                                Você precisará digitar seu email e senha novamente para acessar o painel.
                            </DialogDescription>
                        </div>
                        <div className="w-full flex flex-col gap-3">
                            <Button variant="destructive" className="w-full h-14 rounded-2xl font-black text-lg bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20" onClick={handleSignOut}>
                                Sim, Sair agora
                            </Button>
                            <Button variant="ghost" className="w-full h-12 text-slate-400 font-bold" onClick={() => setLogoutModalOpen(false)}>
                                Permanecer Conectado
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
