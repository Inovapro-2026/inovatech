import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, CheckCircle2, TrendingUp, Presentation, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ParaEmpresas() {
    const benefits = [
        { icon: Zap, title: 'Contratação Rápida', desc: 'Publique um projeto e receba matches em até 24h' },
        { icon: ShieldCheck, title: 'Pagamento Seguro', desc: 'Seu dinheiro só é liberado após aprovação da entrega' },
        { icon: CheckCircle2, title: 'Profissionais Verificados', desc: 'Todos os freelancers passam por validação de habilidades' },
        { icon: Presentation, title: 'Gestão Centralizada', desc: 'Acompanhe todos os projetos em um único painel' },
        { icon: TrendingUp, title: 'Suporte Dedicado', desc: 'Equipe disponível para ajudar em cada etapa' },
        { icon: FileText, title: 'Nota Fiscal', desc: 'Emissão de NF para empresas e dedução de impostos' },
    ];

    const steps = [
        { num: '1', title: 'Publique o Projeto', desc: 'Descreva sua necessidade de forma simples e rápida' },
        { num: '2', title: 'Receba Matches', desc: 'Nossa inteligência artificial encontra os melhores perfis' },
        { num: '3', title: 'Contrate com Segurança', desc: 'Escolha o profissional e faça o pagamento via escrow seguro' },
        { num: '4', title: 'Avalie o Trabalho', desc: 'Receba a entrega, valide, aprove e libere o pagamento' },
    ];

    return (
        <PublicLayout>
            <section className="pt-32 pb-20 hero-gradient relative">
                <motion.div
                    className="max-w-4xl mx-auto px-4 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-primary font-bold tracking-wider uppercase mb-4 block">B2B INOVAPRO</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-foreground">
                        Encontre talentos qualificados para sua empresa em minutos
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                        Contrate freelancers verificados, com pagamento seguro e garantia de entrega. A solução ideal para empresas de todos os tamanhos.
                    </p>
                    <Link to="/cliente/cadastro">
                        <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl teal-glow hover:scale-105 transition-transform bg-primary text-primary-foreground">
                            Começar Agora Gratuitamente
                        </Button>
                    </Link>
                </motion.div>
            </section>

            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Benefícios para Empresas</h2>
                        <p className="text-muted-foreground text-lg">Soluções feitas do processo ao pagamento.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((b, i) => (
                            <motion.div
                                key={i}
                                className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                                    <b.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{b.title}</h3>
                                <p className="text-muted-foreground">{b.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-16">Como Funciona</h2>
                    <div className="grid md:grid-cols-4 gap-8 text-left relative">
                        <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary to-accent z-0" />
                        {steps.map((s, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary font-bold text-2xl mb-6 shadow-sm">
                                    {s.num}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                                <p className="text-muted-foreground text-sm">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-background relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-extrabold mb-8">Pronto para contratar os melhores talentos?</h2>
                    <Link to="/cliente/cadastro">
                        <Button size="lg" className="h-14 px-10 text-lg rounded-xl">Criar Conta Empresa</Button>
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
