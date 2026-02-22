import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Save, Settings, CreditCard, Mail, Shield, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminConfig() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [settings, setSettings] = useState<any>({
        fees: {
            service_fee_free: 20,
            service_fee_pro: 10,
            service_fee_premium: 5,
            plan_pro_price: 29.90,
            plan_premium_price: 59.90
        },
        payment: {
            mp_access_token: '',
            mp_public_key: '',
            mp_webhook_url: '',
            mp_fee_percent: 4.99
        },
        rules: {
            project_max_days: 30,
            approval_days: 7,
            min_project_value: 50,
            max_withdrawal_daily: 5000
        },
        maintenance: {
            enabled: false,
            message: 'Estamos em manutenção para melhorias. Voltamos logo!'
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*');

            if (error) throw error;

            if (data) {
                const newSettings = { ...settings };
                data.forEach(item => {
                    if (item.key === 'fees') newSettings.fees = item.value;
                    if (item.key === 'payment') newSettings.payment = item.value;
                    if (item.key === 'rules') newSettings.rules = item.value;
                    if (item.key === 'maintenance') newSettings.maintenance = item.value;
                });
                setSettings(newSettings);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    }

    async function saveSettings(section: string, data: any) {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('platform_settings')
                .upsert({
                    key: section,
                    value: data,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            toast({
                title: "Configurações salvas",
                description: "As alterações foram aplicadas com sucesso.",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: "Tente novamente.",
            });
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (section: string, field: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações da Plataforma ⚙️</h1>
                        <p className="text-slate-500">Gerencie taxas, pagamentos e regras globais</p>
                    </div>
                </div>

                <Tabs defaultValue="fees" className="space-y-4">
                    <TabsList className="bg-white border border-slate-200 p-1 rounded-lg">
                        <TabsTrigger value="fees" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">Taxas Marketplace</TabsTrigger>
                        <TabsTrigger value="payment" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">Pagamentos</TabsTrigger>
                        <TabsTrigger value="rules" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">Regras</TabsTrigger>
                        <TabsTrigger value="maintenance" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">Manutenção</TabsTrigger>
                    </TabsList>

                    <TabsContent value="fees">
                        <Card>
                            <CardHeader>
                                <CardTitle>Taxas Progressivas</CardTitle>
                                <CardDescription>Configure as porcentagens aplicadas em cada faixa de valor de projeto.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Até R$ 500 (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={settings.fees.tier1_percent || 15}
                                                onChange={(e) => handleChange('fees', 'tier1_percent', Number(e.target.value))}
                                                className="text-lg font-bold"
                                            />
                                            <span className="font-bold text-slate-400">%</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400">Taxa para micro-projetos</p>
                                    </div>
                                    <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Label className="text-xs font-bold uppercase text-slate-400">R$ 501 - R$ 2.000 (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={settings.fees.tier2_percent || 10}
                                                onChange={(e) => handleChange('fees', 'tier2_percent', Number(e.target.value))}
                                                className="text-lg font-bold"
                                            />
                                            <span className="font-bold text-slate-400">%</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400">Taxa intermediária</p>
                                    </div>
                                    <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Acima de R$ 2.000 (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={settings.fees.tier3_percent || 7}
                                                onChange={(e) => handleChange('fees', 'tier3_percent', Number(e.target.value))}
                                                className="text-lg font-bold"
                                            />
                                            <span className="font-bold text-slate-400">%</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400">Taxa para grandes projetos</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-4">
                                    <Shield className="w-5 h-5 text-indigo-600 mt-1" />
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-indigo-900">Modelo Transacional Ativo</h4>
                                        <p className="text-xs text-indigo-700 leading-relaxed">
                                            O sistema de assinaturas foi desativado. Agora a plataforma gera receita exclusivamente através destas taxas aplicadas no checkout.
                                            O valor é calculado automaticamente sobre o preço base do serviço.
                                        </p>
                                    </div>
                                </div>

                                <Button onClick={() => saveSettings('fees', settings.fees)} disabled={loading} className="bg-indigo-600 h-12 px-8 rounded-xl font-bold">
                                    <Save className="mr-2 h-4 w-4" /> Salvar Configurações de Taxas
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payment">
                        <Card>
                            <CardHeader>
                                <CardTitle>Integração Mercado Pago</CardTitle>
                                <CardDescription>Configurações da API de pagamentos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Public Key</Label>
                                    <Input
                                        type="text"
                                        value={settings.payment.mp_public_key}
                                        onChange={(e) => handleChange('payment', 'mp_public_key', e.target.value)}
                                        placeholder="TEST-..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Access Token</Label>
                                    <Input
                                        type="password"
                                        value={settings.payment.mp_access_token}
                                        onChange={(e) => handleChange('payment', 'mp_access_token', e.target.value)}
                                        placeholder="TEST-..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Webhook URL</Label>
                                    <Input
                                        type="text"
                                        value={settings.payment.mp_webhook_url}
                                        onChange={(e) => handleChange('payment', 'mp_webhook_url', e.target.value)}
                                        readOnly
                                        className="bg-slate-50"
                                    />
                                    <p className="text-xs text-slate-500">Configure esta URL no painel do Mercado Pago.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Taxa do Gateway (%)</Label>
                                    <Input
                                        type="number"
                                        value={settings.payment.mp_fee_percent}
                                        onChange={(e) => handleChange('payment', 'mp_fee_percent', Number(e.target.value))}
                                    />
                                </div>

                                <Button onClick={() => saveSettings('payment', settings.payment)} disabled={loading} className="bg-indigo-600">
                                    <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rules">
                        <Card>
                            <CardHeader>
                                <CardTitle>Regras da Plataforma</CardTitle>
                                <CardDescription>Limites e prazos globais.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Prazo Máximo de Projeto (dias)</Label>
                                        <Input
                                            type="number"
                                            value={settings.rules.project_max_days}
                                            onChange={(e) => handleChange('rules', 'project_max_days', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Prazo para Aprovação Automática (dias)</Label>
                                        <Input
                                            type="number"
                                            value={settings.rules.approval_days}
                                            onChange={(e) => handleChange('rules', 'approval_days', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Valor Mínimo de Projeto (R$)</Label>
                                        <Input
                                            type="number"
                                            value={settings.rules.min_project_value}
                                            onChange={(e) => handleChange('rules', 'min_project_value', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Limite Diário de Saque (R$)</Label>
                                        <Input
                                            type="number"
                                            value={settings.rules.max_withdrawal_daily}
                                            onChange={(e) => handleChange('rules', 'max_withdrawal_daily', Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <Button onClick={() => saveSettings('rules', settings.rules)} disabled={loading} className="bg-indigo-600">
                                    <Save className="mr-2 h-4 w-4" /> Salvar Regras
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="maintenance">
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-700 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" /> Modo Manutenção
                                </CardTitle>
                                <CardDescription>Bloqueie o acesso à plataforma temporariamente.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-medium text-red-900">Ativar Manutenção</Label>
                                        <p className="text-sm text-red-600">Apenas administradores poderão acessar.</p>
                                    </div>
                                    <Switch
                                        checked={settings.maintenance.enabled}
                                        onCheckedChange={(checked) => handleChange('maintenance', 'enabled', checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Mensagem de Aviso</Label>
                                    <Textarea
                                        value={settings.maintenance.message}
                                        onChange={(e) => handleChange('maintenance', 'message', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <Button onClick={() => saveSettings('maintenance', settings.maintenance)} disabled={loading} variant="destructive">
                                    <Save className="mr-2 h-4 w-4" /> Atualizar Status
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
