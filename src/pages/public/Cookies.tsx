import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { Cookie, Settings, ShieldCheck, CheckSquare, Square, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Cookies() {
    const [prefs, setPrefs] = useState({ essenciais: true, analiticos: false, marketing: false });

    const types = [
        { type: 'Essenciais', purpose: 'Acesso e navegação segura pelo painel da plataforma. (Auth)', time: 'Duração: Sessão / 24h' },
        { type: 'Analíticos', purpose: 'Ajudar a equipe a medir cliques e uso para refinar botões (Google).', time: 'Duração: 2 anos' },
        { type: 'Marketing', purpose: 'Mostrar campanhas direcionadas de desconto do plano Hub Pro.', time: 'Duração: 1 ano' },
    ];

    const details = [
        { name: 'sb-auth-token', prov: 'Supabase / INOVAPRO', freq: 'Essencial', dur: 'Sessão / 2 anos local' },
        { name: '_ga / _gid', prov: 'Google Analytics', freq: 'Analíticos', dur: '2 anos' },
        { name: 'mp_router', prov: 'Mercado Pago Checkout', freq: 'Segurança KYC', dur: 'Sessão' },
    ];

    return (
        <PublicLayout>
            <section className="pt-32 pb-24 hero-gradient relative border-b border-border">
                <motion.div className="max-w-4xl mx-auto px-4 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
                        <Cookie className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Política de <span className="gradient-text">Cookies e Sessão</span></h1>
                    <p className="text-xl text-muted-foreground mt-4">Entenda a infraestrutura invisível que melhora seu aplicativo.</p>
                </motion.div>
            </section>

            {/* Seções 1 e 2: O que são / Tipos */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12">
                    <div className="bg-card p-10 rounded-3xl border border-border shadow-sm flex flex-col justify-center">
                        <h2 className="text-3xl font-bold flex items-center gap-3 mb-6"><Info className="text-primary w-8 h-8" /> O que é um cookie?</h2>
                        <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                            Arquivos diminutos armazenados localmente e criptografados no cache do seu `Navegador Google/Safari` sempre que você usa nossa plataforma. Eles evitam que você precise colocar senha a cada clique.
                        </p>
                        <div className="bg-primary/5 border border-primary/20 text-primary-foreground text-sm px-6 py-4 rounded-xl flex gap-4 w-full">
                            <span className="font-bold text-foreground">💡 Super Dica:</span>
                            <span className="text-muted-foreground font-medium">Você sempre pode limpar seu cache via (Ctrl+Shift+Del). Mas ao fazer isso, você sofrerá logout de todas as sessões ativas da web.</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Categorias Operacionais</h2>
                        <div className="grid gap-4">
                            {types.map((t, i) => (
                                <div key={i} className="flex flex-col bg-muted/40 border border-border p-6 rounded-2xl hover:bg-muted/60 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-foreground">{t.type}</h3>
                                        <span className="text-xs bg-background border px-3 py-1 rounded-full text-muted-foreground font-medium">{t.time}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{t.purpose}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Seção 3 e 4: Details Tabela e Preferências */}
            <section className="py-24 bg-muted/20 border-y border-border">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16">

                    <div className="bg-card border border-border rounded-3xl shadow-sm p-8">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><Settings className="text-primary w-8 h-8" /> Central de Controle</h2>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 opacity-70">
                                <CheckSquare className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h4 className="font-bold">Protocolos Essenciais (Obrigatório)</h4>
                                    <p className="text-sm text-muted-foreground">Tokens Supabase/Node não podem ser desativados para roteamento seguro.</p>
                                </div>
                            </div>

                            <div
                                className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 cursor-pointer border border-transparent hover:border-border transition-all"
                                onClick={() => setPrefs(p => ({ ...p, analiticos: !p.analiticos }))}
                            >
                                {prefs.analiticos ? <CheckSquare className="w-6 h-6 text-primary mt-1" /> : <Square className="w-6 h-6 text-muted-foreground mt-1" />}
                                <div>
                                    <h4 className="font-bold">Métricas Analíticas (Opcional)</h4>
                                    <p className="text-sm text-muted-foreground">Coleta de heatmaps e telas para o time de UI/UX Inovapro.</p>
                                </div>
                            </div>

                            <div
                                className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 cursor-pointer border border-transparent hover:border-border transition-all"
                                onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                            >
                                {prefs.marketing ? <CheckSquare className="w-6 h-6 text-primary mt-1" /> : <Square className="w-6 h-6 text-muted-foreground mt-1" />}
                                <div>
                                    <h4 className="font-bold">Pixels de Marketing (Opcional)</h4>
                                    <p className="text-sm text-muted-foreground">Sugestão de afiliados e banners direcionados.</p>
                                </div>
                            </div>
                        </div>

                        <Button size="lg" className="h-14 w-full rounded-2xl text-lg font-bold shadow-md">Salvar Preferências Atuais</Button>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold mb-8 items-center flex gap-3">Transparência dos Arquivos</h2>
                        <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm pt-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="p-4 border-b font-medium">Variável Key</th>
                                        <th className="p-4 border-b font-medium">Vendor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {details.map((d, i) => (
                                        <tr key={i} className="hover:bg-muted/10 transition-colors">
                                            <td className="p-4">
                                                <p className="font-mono text-xs font-bold text-primary mb-1">{d.name}</p>
                                                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{d.dur}</span>
                                            </td>
                                            <td className="p-4 text-sm">
                                                <p className="font-semibold text-foreground mb-1">{d.prov}</p>
                                                <span className="text-xs text-muted-foreground">{d.freq}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 flex gap-4 text-sm font-medium text-muted-foreground justify-end">
                            <span>Limpar nativamente: </span>
                            <a href="https://support.google.com/chrome/answer/95647" className="hover:text-primary transition-colors underline">Chrome</a>
                            <a href="https://support.apple.com/pt-br/guide/safari/sfri11471/" className="hover:text-primary transition-colors underline">Safari</a>
                        </div>
                    </div>

                </div>
            </section>
        </PublicLayout>
    );
}
