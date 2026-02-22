import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { Share2, Users, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Afiliados() {
    const steps = [
        { icon: Users, title: '1. Cadastre-se', desc: 'Realize o cadastro na nossa plataforma e libere o acesso ao seu painel de parceiro.' },
        { icon: Share2, title: '2. Compartilhe', desc: 'Use seu link único INOVAPRO nas suas redes sociais, blog, canal no Youtube.' },
        { icon: DollarSign, title: '3. Ganhe', desc: 'Receba comissão a cada cliente que contratar um serviço inicial com sua indicação.' },
    ];

    const commissions = [
        { title: 'Cliente novo contrata', value: '10%', desc: 'do valor da primeira transação feita pelo cliente.' },
        { title: 'Freelancer novo cadastra', value: 'R$ 20', desc: 'por freelancer que ativa e começa a usar a plataforma.' },
        { title: 'Assinatura', value: '30%', desc: 'da primeira mensalidade do plano contratado.' },
    ];

    return (
        <PublicLayout>
            <section className="pt-32 pb-20 hero-gradient relative">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Programa de <span className="gradient-text">Afiliados INOVAPRO</span></h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Ganhe comissões atrativas indicando a plataforma que mais cresce para a rede de amigos, contatos ou para seu público de seguidores.
                        </p>
                        <Link to="/cliente/cadastro">
                            <Button size="lg" className="bg-primary text-primary-foreground font-bold rounded-xl px-8 h-12 hover:scale-105 transition-transform teal-glow">
                                Se Inscrever como Afiliado
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-background text-foreground">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Como Funciona o Programa?</h2>
                        <p className="text-muted-foreground text-lg">É super simples multiplicar a sua renda de forma escalável.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((s, i) => (
                            <div key={i} className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center card-hover">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <s.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                                <p className="text-muted-foreground line-clamp-3">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-muted/30">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-10 text-center">Tabela de Comissões</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {commissions.map((c, i) => (
                            <div key={i} className="bg-card p-6 rounded-2xl border border-border">
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">{c.title}</h3>
                                <div className="text-4xl font-extrabold text-foreground mb-4 gradient-text">{c.value}</div>
                                <p className="text-sm text-muted-foreground">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-background">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Quer potencializar as vendas?</h2>
                    <p className="text-xl text-muted-foreground mb-8">Nós daremos todo o suporte criativo (Banners de diversos tamanhos, E-mail marketing modelo, e Copywriters) ao se inscrever no projeto.</p>
                    <div className="flex justify-center">
                        <Link to="/cliente/cadastro">
                            <Button className="h-14 font-semibold text-lg px-8 rounded-xl w-full md:w-auto">
                                Tornar-se Parceiro Agora
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
