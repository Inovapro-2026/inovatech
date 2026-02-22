import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { Mic, Download, FileText, Image as ImageIcon, Briefcase, Mail, Phone, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Imprensa() {
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    const assets = [
        { title: 'Kit de Marca Completo', desc: 'Logos, cores, fontes e guia de uso', size: '15 MB', ext: 'ZIP', icon: Briefcase },
        { title: 'Logo Principal (PNG)', desc: 'Fundo transparente, alta resolução', size: '2 MB', ext: 'PNG', icon: ImageIcon },
        { title: 'Logo Vetorial (SVG)', desc: 'Para impressão e grandes formatos', size: '500 KB', ext: 'SVG', icon: FileText },
        { title: 'Ícones e Ilustrações', desc: 'Biblioteca de assets visuais', size: '8 MB', ext: 'ZIP', icon: Briefcase },
    ];

    const gallery = [
        { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop', title: 'Equipe colaborando', dim: '1920x1080' },
        { url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop', title: 'Escritório Matriz', dim: '1920x1080' },
        { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop', title: 'Workspace', dim: '1920x1080' },
        { url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600&auto=format&fit=crop', title: 'Reunião de Alinhamento', dim: '1920x1080' },
        { url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=600&auto=format&fit=crop', title: 'UX Research', dim: '1920x1080' },
        { url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop', title: 'Time de Desenvolvimento', dim: '1920x1080' },
    ];

    const news = [
        { date: '15/02/2026', title: 'INOVAPRO ultrapassa 500 freelancers cadastrados no Brasil' },
        { date: '10/01/2026', title: 'Plataforma lança novo sistema de pagamento em escrow com Mercado Pago' },
        { date: '05/12/2025', title: 'INOVAPRO é fundada com missão de transformar o mercado freelance B2B' },
    ];

    const faqs = [
        { q: 'O que é a INOVAPRO?', a: 'Uma plataforma SaaS que conecta empresas a freelancers verificados de forma segura utilizando Escrow.' },
        { q: 'Quem são os fundadores?', a: 'Fundada por especialistas em tecnologia e operações que enxergaram a carência de segurança no trabalho remoto nacional.' },
        { q: 'Qual a diferença da INOVAPRO para as outras?', a: 'Foco exclusivo B2B, freelancers 100% verificados e pagamento com custódia (Escrow) real, eliminando calotes e fraudes.' },
        { q: 'Posso usar a logo da INOVAPRO no meu blog?', a: 'Sim! Fornecemos um Kit de Marca completo na seção "Assets" abaixo, basta respeitar as margens e paletas de cores.' },
    ];

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="pt-32 pb-24 hero-gradient relative border-b border-border">
                <motion.div className="max-w-4xl mx-auto px-4 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <Mic className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Sala de <span className="gradient-text">Imprensa</span></h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Recursos, informativos e arquivos oficiais para jornalistas, blogueiros e parceiros de mídia.</p>
                </motion.div>
            </section>

            {/* Release Oficial */}
            <section className="py-24 bg-background">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <FileText className="text-primary w-8 h-8" />
                            Release Oficial (Boilerplate)
                        </h2>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground mb-8">
                            <p className="text-lg leading-relaxed">
                                Fundada em São Paulo, a INOVAPRO surgiu como a resposta definitiva para a insegurança nas contratações freelance no Brasil. A plataforma B2B conecta empresas a talentos rigorosamente verificados, utilizando um sistema inovador de pagamento via Escrow (custódia) que garante a segurança financeira de ambas as partes. Até o final de 2026, a startup projeta triplicar a base e se consolidar como o principal hub seguro de outsourcing digital da América Latina.
                            </p>
                        </div>
                        <Button size="lg" className="rounded-xl px-8 h-12 shadow-md hover:scale-105 transition-transform">Baixar PDF do Release Completo</Button>
                    </div>
                </div>
            </section>

            {/* Assets de Marca */}
            <section className="py-24 bg-muted/30 border-y border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Assets de Marca</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {assets.map((a, i) => (
                            <motion.div
                                key={i}
                                className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col h-full card-hover"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-foreground">
                                        <a.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded-md border">{a.ext}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{a.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6 flex-1">{a.desc}</p>
                                <Button variant="outline" className="w-full flex justify-between items-center group">
                                    <span>{a.size}</span>
                                    <Download className="w-4 h-4 group-hover:text-primary transition-colors" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Galeria */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Galeria de Imagens Corporativas</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {gallery.map((g, i) => (
                            <div key={i} className="group relative rounded-2xl overflow-hidden border border-border shadow-sm">
                                <img src={g.url} alt={g.title} className="w-full h-64 object-cover transform group-hover:scale-105 transition-duration-500" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white translate-y-2 group-hover:translate-y-0 transition-all">
                                    <h4 className="font-bold text-lg">{g.title}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-white/70">{g.dim}</span>
                                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8"><Download className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Listagem PR */}
            <section className="py-24 bg-muted/40 border-y border-border">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Releases e Notícias Recentes</h2>
                    <div className="flex flex-col gap-6">
                        {news.map((n, i) => (
                            <div key={i} className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover">
                                <div>
                                    <span className="text-primary text-sm font-bold tracking-widest">{n.date}</span>
                                    <h3 className="text-xl font-bold mt-2">{n.title}</h3>
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    <Button variant="outline" className="rounded-xl">Ler Mais</Button>
                                    <Button className="rounded-xl bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"><Download className="w-4 h-4 mr-2" /> PDF</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ e Contato */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16">
                    {/* FAQ */}
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Perguntas Frequentes (FAQ)</h2>
                        <div className="space-y-4">
                            {faqs.map((f, i) => (
                                <div key={i} className="border border-border rounded-xl bg-card overflow-hidden">
                                    <button
                                        className="w-full flex justify-between items-center p-6 text-left hover:bg-muted/50 transition-colors"
                                        onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                                    >
                                        <span className="font-bold">{f.q}</span>
                                        <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", faqOpen === i ? "rotate-180" : "")} />
                                    </button>
                                    {faqOpen === i && (
                                        <div className="p-6 pt-0 text-muted-foreground bg-card animate-slide-up border-t border-border">
                                            <p className="mt-4">{f.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contato Assessoria */}
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Contato para Imprensa</h2>
                        <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex flex-col gap-4 mb-8 p-6 bg-muted/50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-primary w-5 h-5" />
                                    <a href="mailto:imprensa@inovapro.com.br" className="text-lg font-medium hover:underline">imprensa@inovapro.com.br</a>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Phone className="w-5 h-5" />
                                    <span>(11) 98888-7777 — Maria Santos (Gerente de Comunicação)</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Clock className="w-5 h-5" />
                                    <span>Atendimento Seg-Sex, das 09h às 18h</span>
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                                <h3 className="font-bold text-lg mb-4">Envie uma pauta</h3>
                                <Input placeholder="Seu Nome e Sobrenome" className="h-12 rounded-xl" />
                                <Input type="email" placeholder="Email Comercial" className="h-12 rounded-xl" />
                                <Input placeholder="Veículo de Mídia / Portal" className="h-12 rounded-xl" />
                                <textarea
                                    className="w-full min-h-[120px] p-4 rounded-xl border border-input bg-background text-sm focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                                    placeholder="Resumo da Solicitação..."
                                ></textarea>
                                <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-md">Anotar Solicitação</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
