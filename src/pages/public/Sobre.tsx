import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion, useInView } from 'framer-motion';
import { Target, Eye, Gem, Users, CheckCircle2, PackageSearch, Zap, Headset, LayoutDashboard, ShieldCheck, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';

// Animação de Contador
function Counter({ end, label, prefix = '', suffix = '' }: { end: number, label: string, prefix?: string, suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const duration = 2000;
            const increment = end / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    clearInterval(timer);
                    setCount(end);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [end, isInView]);

    return (
        <div ref={ref} className="text-center p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
                {prefix}{count.toLocaleString('pt-BR')}{suffix}
            </div>
            <div className="text-muted-foreground font-medium">{label}</div>
        </div>
    );
}

export default function Sobre() {
    const timeline = [
        { year: '2024', title: 'Fundação', desc: 'INOVAPRO nasce com a missão de simplificar contratações e conectar talentos globais.' },
        { year: '2024', title: 'Lançamento', desc: 'Primeira versão da plataforma vai ao ar, transformando a forma como empresas contratam.' },
        { year: '2024', title: 'Marco Histórico', desc: 'Ultrapassamos a marca de mais de 500 freelancers verificados cadastrados.' },
        { year: '2025', title: 'Expansão', desc: 'Lançamento de novas funcionalidades B2B, integrações de pagamento e parcerias estratégicas.' },
    ];

    const values = [
        { icon: Target, title: 'Democratizar o trabalho freelance', desc: 'Conectar empresas brasileiras aos melhores profissionais, com segurança e transparência.', label: 'Missão' },
        { icon: Eye, title: 'Ser referência nacional até 2026', desc: 'Liderar o mercado de plataformas de freelancers no Brasil, inovando constantemente.', label: 'Visão' },
        { icon: Gem, title: 'Transparência e Inovação', desc: 'Comunicação clara, tecnologia de ponta e foco absoluto no sucesso do usuário.', label: 'Valores' },
    ];

    const team = [
        { name: 'Maicon', role: 'CEO & Fundador', bio: 'Especialista em negócios e tecnologia.', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
        { name: 'Isabela', role: 'COO', bio: 'Liderando as operações e a comunidade.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' },
        { name: 'Ricardo', role: 'CTO', bio: 'Arquiteto de software com 10 anos de experiência.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
    ];

    const features = [
        { icon: ShieldCheck, title: 'Pagamento em Escrow', desc: 'Seu dinheiro só é liberado após aprovação da entrega.' },
        { icon: PackageSearch, title: 'Match com IA', desc: 'Conexão inteligente entre cliente e freelancer.' },
        { icon: Zap, title: 'Entrega Rápida', desc: 'Prazos definidos e cumpridos com garantia.' },
        { icon: Headset, title: 'Suporte Humanizado', desc: 'Equipe real disponível para ajudar você.' },
        { icon: LayoutDashboard, title: 'Dashboard Completo', desc: 'Acompanhe todas as métricas em um só lugar.' },
        { icon: CheckCircle2, title: 'Mediação de Conflitos', desc: 'Proteção total garantida em caso de disputas.' },
    ];

    const testimonials = [
        { name: "João Silva", role: "CEO da TechCorp", text: "A INOVAPRO transformou como contratamos freelancers. Rápido, seguro e profissional. O sistema de escrow é fantástico.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" },
        { name: "Mariana Costa", role: "UX Designer", text: "Finalmente uma plataforma que valoriza o freelancer. Os clientes são sérios e o pagamento é garantido. Nunca mais tive dor de cabeça.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" },
        { name: "Carlos Mendes", role: "Diretor de Marketing", text: "Conseguimos escalar nossa equipe de conteúdo em semanas. A qualidade dos profissionais aqui é impecável e a plataforma é super intuitiva.", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop" }
    ];

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="pt-32 pb-24 relative overflow-hidden bg-background">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
                            Sobre a <span className="gradient-text block">INOVAPRO</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                            Conectando empresas e talentos desde 2024. A plataforma que está transformando radicalmente o mercado de freelancers no Brasil.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/marketplace">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-xl">Explorar a Vitrine</Button>
                            </Link>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative h-[400px] lg:h-[500px]">
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop" alt="Equipe colaborando" className="rounded-3xl object-cover w-full h-full shadow-2xl border border-border" />
                        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10" />
                    </motion.div>
                </div>
            </section>

            {/* Seção 1: História (Timeline) */}
            <section className="py-24 bg-muted/30 border-y border-border">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossa História</h2>
                        <p className="text-lg text-muted-foreground">O caminho que construímos até aqui.</p>
                    </div>
                    <div className="relative border-l-2 border-primary/20 ml-4 md:ml-1/2">
                        {timeline.map((item, i) => (
                            <motion.div
                                key={i}
                                className="mb-12 ml-8 relative"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="absolute -left-[41px] top-1 w-5 h-5 bg-primary rounded-full ring-4 ring-background" />
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">{item.year}</span>
                                    <h3 className="text-xl font-bold">{item.title}</h3>
                                </div>
                                <p className="text-muted-foreground text-lg">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seção 2: Missão, Visão e Valores */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {values.map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-card p-10 rounded-3xl border shadow-sm hover:shadow-lg transition-all card-hover text-center"
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <v.icon className="w-10 h-10 text-primary" />
                                </div>
                                <span className="text-sm font-bold tracking-widest text-primary uppercase mb-2 block">{v.label}</span>
                                <h3 className="text-2xl font-bold mb-4">{v.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seção 3: Números */}
            <section className="py-24 bg-muted/30 border-y border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-center text-3xl font-bold mb-16">O Tamanho do Nosso Impacto</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <Counter end={500} prefix="+" label="Freelancers Cadastrados" />
                        <Counter end={1000} prefix="+" label="Projetos Publicados" />
                        <Counter end={500} prefix="+R$ " suffix="K" label="Pagos a Profissionais" />
                        <Counter end={98} suffix="%" label="Taxa de Satisfação" />
                    </div>
                </div>
            </section>

            {/* Seção 4: Equipe Fundadora */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Equipe Fundadora</h2>
                    <p className="text-lg text-muted-foreground mb-16">Os visionários por trás da revolução freelance.</p>
                    <div className="flex flex-wrap justify-center gap-8">
                        {team.map((m, i) => (
                            <motion.div
                                key={i}
                                className="w-full max-w-sm bg-card rounded-3xl p-8 border shadow-sm"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <img src={m.img} alt={m.name} className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-background shadow-lg" />
                                <h3 className="text-2xl font-bold mb-1">{m.name}</h3>
                                <p className="text-primary font-medium mb-4">{m.role}</p>
                                <p className="text-muted-foreground mb-6 line-clamp-2">{m.bio}</p>
                                <div className="flex justify-center gap-3">
                                    <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seção 5: Diferenciais */}
            <section className="py-24 bg-muted/40 border-t border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Diferenciais da Plataforma</h2>
                        <p className="text-lg text-muted-foreground">Por que somos a escolha número 1 do Brasil.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                className="bg-background p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all card-hover border border-border flex items-start gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seção 6: Depoimentos */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-16">O Que Dizem Nossos Usuários</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-muted/30 p-8 rounded-3xl border border-border/50 text-left relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={t.img} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                                    <div>
                                        <h4 className="font-bold">{t.name}</h4>
                                        <span className="text-sm text-muted-foreground">{t.role}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 text-yellow-500 mb-4">
                                    {[...Array(5)].map((_, idx) => <span key={idx}>★</span>)}
                                </div>
                                <p className="text-muted-foreground italic leading-relaxed">"{t.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 hero-gradient text-center px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1500&auto=format&fit=crop')] opacity-5 bg-cover bg-center mix-blend-overlay" />
                <motion.div
                    className="max-w-3xl mx-auto relative z-10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">Faça parte dessa revolução</h2>
                    <p className="text-xl text-muted-foreground mb-10">Junte-se a milhares de empresas e freelancers que já confiam na INOVAPRO.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/cliente/cadastro">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl">Criar Conta Empresa</Button>
                        </Link>
                        <Link to="/freelas/cadastro">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl bg-background/50 backdrop-blur-md">Criar Conta Freelancer</Button>
                        </Link>
                    </div>
                </motion.div>
            </section>
        </PublicLayout>
    );
}
