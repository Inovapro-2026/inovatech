import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { Scale, FileSignature, UploadCloud, Link as LinkIcon, Edit3, Trash2, Unlink, Lock, Send, UserCheck, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Lgpd() {
    const rights = [
        { icon: UserCheck, text: 'Confirmar a existência do tratamento' },
        { icon: Edit3, text: 'Corrigir dados inconsistentes ou soltos' },
        { icon: Trash2, text: 'Excluir definitivamente tudo do sistema' },
        { icon: UploadCloud, text: 'Portabilidade XML/JSON' },
        { icon: Lock, text: 'Acessar seu histórico completo 24h' },
        { icon: Unlink, text: 'Revogar consentimentos de Marketing' },
        { icon: LinkIcon, text: 'Notificar sobre o compartilhamento' },
        { icon: AlertOctagon, text: 'Revisar bloqueios IA de conta (Match)' },
    ];

    const bases = [
        'Consentimento claro e logado em banco',
        'Obrigação Cível, Fiscal e Repasse Tributário',
        'Proteção de fraude judicial',
        'Execução dos Contratos Freelancers em via',
        'Legítimo Interesse de Software B2B'
    ];

    return (
        <PublicLayout>
            <section className="pt-32 pb-24 hero-gradient relative border-b border-border">
                <motion.div className="max-w-4xl mx-auto px-4 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm hover:scale-110 transition-transform">
                        <Scale className="w-8 h-8" />
                    </div>
                    <span className="text-primary font-bold tracking-wider uppercase mb-2 block bg-background px-4 py-1 rounded-full border border-border inline-flex">100% Conforme</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 mt-4">Lei Geral de Proteção de <span className="gradient-text">Dados Pessoais (LGPD)</span></h1>
                    <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto font-medium">Os seus direitos digitais salvaguardados de ponta a ponta conforme as diretrizes legais brasileiras vigentes.</p>
                </motion.div>
            </section>

            {/* Seção 1: Educativo */}
            <section className="py-24 bg-background">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 shadow-sm flex flex-col md:flex-row items-center gap-8 text-left relative overflow-hidden">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 relative z-10">
                            <FileSignature className="w-10 h-10" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-3">O que você precisa saber?</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                A *Lei 13.709/2018 (Brasil)* eleva a proteção das suas informações civis. Na <b>INOVAPRO</b> não existe a prática obscura de comprar listas de contatos ou vender o seu E-mail / Telefone para Spamars de plantão. Tratamos apenas as matrizes estritas necessárias para conectar sua reputação a pagadores reais em um processo B2B idôneo.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* Seção 2: Direitos */}
            <section className="py-24 bg-muted/30 border-y border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Seus Direitos Universais (Art. 18)</h2>
                        <p className="text-muted-foreground text-lg">O que você tem total soberania sob os painéis criptografados INOVAPRO.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        {rights.map((r, i) => (
                            <motion.div
                                key={i}
                                className="bg-card p-6 border border-border shadow-sm rounded-2xl hover:bg-muted/50 transition-colors flex flex-col gap-4 card-hover"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                    <r.icon className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm leading-snug">{r.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seção 3 e 4: Forms e Bases Legais */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16">

                    <div className="bg-card rounded-3xl border border-border p-10 shadow-sm relative">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">Entrar com Recurso Formal</h2>

                        <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Seu Nome de Usuário (Username / CPF)" className="h-14 rounded-xl" />
                                <Input type="email" placeholder="Seu Email Institucional" className="h-14 rounded-xl" />
                            </div>

                            <div className="relative">
                                <select className="w-full h-14 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary text-muted-foreground appearance-none">
                                    <option value="">Selecione a Tipagem de Direito LGPD...</option>
                                    <option value="excluir">Quero Deletar Todos os meus Dados</option>
                                    <option value="copia">Quero Exigir minha Cópia Integral</option>
                                    <option value="revisao">Revisão Humana de Suspensão de Conta</option>
                                </select>
                            </div>

                            <textarea
                                className="w-full h-[150px] p-4 rounded-xl border border-input bg-background text-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                                placeholder="Deixe documentado na integra os detalhes adicionais se houver (o arquivo JSON não processa fotos sensíveis)."
                            ></textarea>

                            <div className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center text-muted-foreground hover:bg-muted/20 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3">
                                <UploadCloud className="w-6 h-6 border rounded-full p-1" />
                                <span className="text-sm font-medium">Arraste aqui um Documento Oficial (PDF / CNH) para prova de vida</span>
                            </div>

                            <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-md font-bold text-foreground">
                                <Send className="w-5 h-5 mr-3" /> Assinar o Formulário Oficialmente
                            </Button>
                        </form>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold mb-8">Bases Legais para Operação</h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            Para que o "Match" entre empresas ocorra e seu Pix possa rodar, operamos as vias transacionais com extrema integridade nas 5 listagens aceitas abaixo:
                        </p>
                        <div className="space-y-4">
                            {bases.map((b, i) => (
                                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border font-medium hover:bg-muted/70 transition-colors">
                                    <span className="text-primary text-xl font-bold">✓</span> {b}
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-8 bg-card border border-border shadow-sm rounded-3xl">
                            <h3 className="font-bold text-xl mb-4 text-foreground">Contato Direto Encarregado</h3>
                            <div className="space-y-2 text-muted-foreground mb-6">
                                <p>João Pedro Silva (CISO & DPO Internacional)</p>
                                <p className="font-mono text-primary text-sm font-bold bg-primary/10 p-2 rounded-lg max-w-max">dpo@inovapro.com.br</p>
                                <p>Rua Exemplo (Matriz Faria Lima), 123 — SP, SP.</p>
                            </div>
                            <Button variant="outline" className="w-full rounded-xl h-12">Baixar Relatório Fiscal PDF</Button>
                        </div>
                    </div>

                </div>
            </section>
        </PublicLayout>
    );
}
