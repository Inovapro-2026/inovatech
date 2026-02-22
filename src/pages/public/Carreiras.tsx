import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Laptop, DollarSign, HeartPulse, Sparkles, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function Carreiras() {
    const [expanded, setExpanded] = useState<number | null>(null);

    const benefits = [
        { icon: DollarSign, text: 'Salário competitivo' },
        { icon: Laptop, text: 'Remoto-first flexível' },
        { icon: Sparkles, text: 'Trilhas de Upskilling' },
        { icon: HeartPulse, text: 'Saúde Física e Mental' },
        { icon: Building2, text: 'Day off e Férias 30d' },
    ];

    const jobs = [
        { title: 'Desenvolvedor Frontend Sênior', dept: 'Engenharia', type: 'PJ', local: 'Remoto' },
        { title: 'UX/UI Designer Pleno', dept: 'Produto', type: 'CLT/PJ', local: 'Remoto' },
        { title: 'Analista de SDR B2B', dept: 'Vendas', type: 'CLT', local: 'São Paulo - SP' },
    ];

    const process = [
        { name: '1. Inscrição e Match de Perfil' },
        { name: '2. Bate-papo de Cultura (People)' },
        { name: '3. Challenge Técnico ou Case de Negócio' },
        { name: '4. Carta Oferta e Onboarding' }
    ];

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="pt-32 pb-20 hero-gradient relative">
                <motion.div
                    className="max-w-4xl mx-auto px-4 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Venha mudar o <span className="gradient-text">Mercado Freelancer</span></h1>
                    <p className="text-xl text-muted-foreground">Aqui na INOVAPRO, entregamos qualidade B2B e crescemos juntos em um ambiente transparente.</p>
                </motion.div>
            </section>

            {/* Cultura */}
            <section className="py-20 bg-background">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Por que trabalhar conosco?</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-12">
                        Nossos talentos importam. Mantemos a cultura flat, orientada por dados, autonomia e inovação. A mesma plataforma que criamos conecta pessoas;
                        nós também somos apaixonados por investir no bem estar do nosso time que constrói tudo isso.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {benefits.map((b, i) => (
                            <div key={i} className="flex flex-col items-center bg-muted/40 p-6 rounded-xl text-center shadow-sm">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                                    <b.icon className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-sm">{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vagas */}
            <section className="py-20 bg-muted/20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">Vagas em Aberto</h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        {jobs.map((j, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "bg-card rounded-xl border border-border overflow-hidden transition-all duration-300",
                                    expanded === i ? "shadow-md" : "hover:shadow-sm"
                                )}
                            >
                                <div
                                    className="p-6 flex flex-col md:flex-row md:items-center justify-between cursor-pointer"
                                    onClick={() => setExpanded(expanded === i ? null : i)}
                                >
                                    <div className="mb-4 md:mb-0">
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{j.title}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {j.dept}</span>
                                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {j.local}</span>
                                            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">{j.type}</span>
                                        </div>
                                    </div>
                                    <Button variant={expanded === i ? "default" : "outline"} className={expanded === i ? "bg-primary" : ""}>
                                        {expanded === i ? "Candidatar-me" : "Ver Detalhes"}
                                    </Button>
                                </div>
                                {expanded === i && (
                                    <div className="px-6 pb-6 pt-2 border-t border-border animate-slide-up">
                                        <p className="text-muted-foreground mb-4">
                                            Essa vaga está aguardando você! Atue em projetos estratégicos com uso de tecnologias modernas.
                                            Buscamos pessoas apaixonadas pelo que fazem e com vontade de aprender constante.
                                        </p>
                                        <Button className="w-full md:w-auto h-11 px-8">Aplicar pelo LinkedIn</Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Processo */}
            <section className="py-20 bg-background border-t border-border">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-10">O Processo Seletivo</h2>
                    <div className="grid md:grid-cols-4 gap-6 text-center">
                        {process.map((p, i) => (
                            <div key={i} className="p-6 border border-border bg-card rounded-2xl relative">
                                {i !== process.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-border z-0" />
                                )}
                                <span className="font-semibold">{p.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 bg-primary/5 p-8 border border-primary/20 rounded-2xl md:mx-auto md:w-1/2">
                        <h3 className="text-xl font-bold mb-3">Não encontrou sua vaga? </h3>
                        <p className="text-muted-foreground mb-6">Estamos de olho em bons talentos em todas as disciplinas, Mande de forma espontânea:</p>
                        <Button variant="outline" className="w-full" size="lg">Enviar Currículo Espontâneo</Button>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
