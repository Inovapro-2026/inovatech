import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, User, Briefcase, CreditCard, Smartphone, CheckCircle, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function Privacidade() {
    const steps = [
        { text: 'Dados que Coletamos', delay: 0 },
        { text: 'Como Usamos', delay: 0.1 },
        { text: 'Com quem Compartilhamos', delay: 0.2 },
        { text: 'Seus Direitos', delay: 0.3 },
    ];

    const dataCards = [
        { icon: User, title: 'Dados de Cadastro', desc: 'Nome complexo CPF CNPJ, email de trabalho, telefone e endereço.' },
        { icon: Briefcase, title: 'Dados Profissionais', desc: 'Habilidades taggeadas, perfis de portfólio GitHub e histórico educacional.' },
        { icon: CreditCard, title: 'Dados de Pagamento', desc: 'Tokenizados e processados em repouso absoluto pelo Mercado Pago.' },
        { icon: Smartphone, title: 'Dados de Uso', desc: 'Logs de navegador, acessos à Dashboard, analytics gerais (Google Analytics).' },
    ];

    const uses = [
        'Para fornecer serviços fluidos do escopo original de conexões talentos-empresas.',
        'Para processar transações financeiras e liquidar repasses judiciais.',
        'Para auditar problemas e refinar UX/UI nos aplicativos e sistema.',
        'Para suporte corporativo na criação da plataforma B2B.',
        'Para conformidade integral perante às instâncias fiscais, STF e CVM.',
    ];

    const sharing = [
        { to: 'Freelancers e Parceiros B2B', why: 'Apenas após Match Voluntário', what: 'Nome fantasia, descrição do app, escopo' },
        { to: 'Mercado Pago e Stripe Institucional', why: 'Para Pagamentos, Retenção e Escrow', what: 'CPF base e Endereço Físico Fiscal' },
        { to: 'Autoridades Federal/Estado', why: 'Mediante intimação policial/oficial', what: 'Todos os logs solicitados base legal.' },
    ];

    const rights = [
        { icon: '📋', title: 'Acesso', desc: 'Solicite uma cópia digital imediata dos seus dados brutos em nossa plataforma.' },
        { icon: '✏️', title: 'Correção', desc: 'Peça a retificação de qualquer nome inconsistente em sua listagem.' },
        { icon: '🗑️', title: 'Exclusão', desc: 'Elimine 100% registros irreversíveis perante nosso servidor cloud Supabase.' },
        { icon: '📤', title: 'Portabilidade', desc: 'Transfira seu histórico B2B para XML visando usar em outras suítes SaaS.' },
        { icon: '🚫', title: 'Revogação', desc: 'Desative emails massivos e e-learning.' },
    ];

    return (
        <PublicLayout>
            <section className="pt-32 pb-24 hero-gradient relative border-b border-border">
                <motion.div className="max-w-4xl mx-auto px-4 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm hover:scale-110 transition-transform">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Política de <span className="gradient-text">Privacidade</span></h1>
                    <p className="text-xl text-muted-foreground mt-4">Transparência em como protegemos e processamos a jornada da sua conta na Inovapro.</p>
                    <p className="text-sm font-bold bg-primary/10 text-primary border border-primary/20 inline-flex px-4 py-2 mt-6 rounded-full">Atualizado em 01 de Março de 2026</p>
                </motion.div>
            </section>

            {/* Seção 1: Infográfico Fluxo */}
            <section className="py-24 bg-background border-b border-border overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-12 text-center text-muted-foreground tracking-widest uppercase text-sm">A Vida Útil dos Dados</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        {steps.map((s, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-6"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: s.delay }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-card px-6 py-4 rounded-xl border border-border font-bold text-center min-w-[200px] shadow-sm teal-glow relative z-10">
                                    {s.text}
                                </div>
                                {i !== steps.length - 1 && (
                                    <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                                )}
                                {i !== steps.length - 1 && (
                                    <div className="w-px h-6 bg-border md:hidden" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seção 2: Dados Coletados */}
            <section className="py-24 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Que dados Coletamos?</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {dataCards.map((c, i) => (
                            <div key={i} className="bg-background border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow card-hover">
                                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-xl mb-6">
                                    <c.icon className="text-primary w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-xl mb-3">{c.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seção 3 e 4: Como Usamos e Compartilhamento */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16">
                    {/* Usos */}
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Como Usamos seus Dados</h2>
                        <div className="space-y-4">
                            {uses.map((useText, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                                    <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                                    <p className="text-muted-foreground font-medium">{useText}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabela de Compartilhamento */}
                    <div>
                        <h2 className="text-3xl font-bold mb-8 items-center flex gap-3">Parcerias e API</h2>
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="p-4 border-b">Destinatário</th>
                                        <th className="p-4 border-b">O que enviamos?</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {sharing.map((s, i) => (
                                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-foreground">{s.to}</p>
                                                <span className="text-xs font-semibold text-muted-foreground uppercase">{s.why}</span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">{s.what}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seção 5: Seus Direitos */}
            <section className="py-24 bg-muted/40 border-y border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Seus Direitos Universais Naturais</h2>
                        <p className="text-muted-foreground text-lg">Inovapro prioriza a cartilha internacional digital.</p>
                    </div>

                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
                        {rights.map((r, i) => (
                            <div key={i} className="bg-card p-6 border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all">
                                <div className="text-4xl mb-4">{r.icon}</div>
                                <h3 className="font-bold text-lg mb-2">{r.title}</h3>
                                <p className="text-muted-foreground text-sm">{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seção 6 e 7: Segurança e DPO */}
            <section className="py-24 bg-background">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12">
                    <div className="bg-card p-10 rounded-3xl border border-border shadow-sm">
                        <div className="flex items-center gap-4 mb-6 text-primary">
                            <ShieldCheck className="w-10 h-10" />
                            <h2 className="text-2xl font-bold text-foreground">Infraestrutura Blindada</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            A hospedagem se dá com ponta a ponta criptografada (`SSL` grade militar SHA-256 e WebSockets fechados). A base de dados do usuário (PostgreSQL via Supabase) possui restrições RLS, logo ninguém além de você acessa seu Token.
                        </p>
                    </div>

                    <div className="bg-primary/5 p-10 rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
                        <h2 className="text-2xl font-bold mb-2">Oficial de Dados (DPO)</h2>
                        <p className="text-muted-foreground text-sm mb-6">Em caso de dúvidas com o Comitê Interno Compliance:</p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 font-semibold text-lg bg-background border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                <Mail className="w-5 h-5 text-primary" /> dpo@inovapro.com.br
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground text-sm bg-background/50 border rounded-xl p-3">
                                <MapPin className="w-5 h-5" /> Torre Sul B2B Corporate — São Paulo, SP.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </PublicLayout>
    );
}
