import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { DollarSign, Home, TrendingUp, Target, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function ParaFreelancers() {
    const [hours, setHours] = useState(20);
    const [rate, setRate] = useState(50);

    const benefits = [
        { icon: DollarSign, title: 'Pagamento Garantido', desc: 'Seu trabalho será remunerado pelo escrow' },
        { icon: Home, title: 'Trabalhe de Casa', desc: 'Escolha seus horários e seus projetos' },
        { icon: TrendingUp, title: 'Crescimento', desc: 'Construa portfólio na plataforma' },
        { icon: Target, title: 'Matches Inteligentes', desc: 'Receba projetos que combinam com seu perfil' },
        { icon: Shield, title: 'Proteção Total', desc: 'Mediação justa em caso de disputas' },
        { icon: CreditCard, title: 'Saque Rápido', desc: 'Receba nas suas contas via checkout oficial' },
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
                    <span className="text-primary font-bold tracking-wider uppercase mb-4 block">Para Freelancers</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                        Trabalhe com <span className="gradient-text">liberdade</span> e ganhe mais
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                        Conecte-se com empresas sérias, receba pagamentos garantidos e construa sua reputação na maior plataforma de freelancers do Brasil.
                    </p>
                    <Link to="/cliente/cadastro">
                        <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl bg-primary text-primary-foreground hover:scale-105 transition-transform teal-glow">
                            Começar como Freelancer
                        </Button>
                    </Link>
                </motion.div>
            </section>

            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4">
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
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8">Calculadora de Ganhos</h2>
                    <div className="bg-card p-8 rounded-3xl border border-border shadow-md">
                        <div className="mb-6 text-left">
                            <label className="block text-sm font-medium mb-2">Horas por semana: <span className="text-primary font-bold">{hours}h</span></label>
                            <input type="range" min="5" max="60" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full accent-primary" />
                        </div>
                        <div className="mb-8 text-left">
                            <label className="block text-sm font-medium mb-2">Valor da sua hora (R$): <span className="text-primary font-bold">R$ {rate}/h</span></label>
                            <input type="range" min="15" max="300" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full accent-primary" />
                        </div>
                        <div className="pt-6 border-t border-border space-y-4">
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Faturamento Bruto</span>
                                <span className="font-semibold text-foreground">R$ {(hours * rate * 4).toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-500 text-sm">
                                <span>Taxa de Proteção INOVAPRO</span>
                                <span>
                                    {hours * rate * 4 <= 500 ? '-15%' : hours * rate * 4 <= 2000 ? '-10%' : '-7%'}
                                </span>
                            </div>
                            <div className="pt-4 border-t border-border/50">
                                <p className="text-muted-foreground mb-2 text-sm italic">Você recebe (estimado)</p>
                                <p className="text-5xl font-extrabold gradient-text">
                                    R$ {(
                                        (hours * rate * 4) *
                                        (hours * rate * 4 <= 500 ? 0.85 : hours * rate * 4 <= 2000 ? 0.90 : 0.93)
                                    ).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
