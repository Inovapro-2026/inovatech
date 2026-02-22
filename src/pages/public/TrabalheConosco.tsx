
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    ArrowRight,
    Briefcase,
    DollarSign,
    Shield,
    Zap,
    Globe,
    TrendingUp,
    Laptop,
    Code2,
    Palette,
    Smartphone,
    PenTool,
    Video,
    Languages,
    Star,
    Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PublicLayout } from '@/components/layout/public/PublicLayout';

// Icon helper since Target is not exported by lucide-react in all versions, using Crosshair instead or custom
const TargetIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

export default function TrabalheConosco() {
    return (
        <PublicLayout>
            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-6">
                                <Briefcase className="w-4 h-4" />
                                Vagas abertas para freelancers
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                                Trabalhe como Freelancer na <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">INOVAPRO</span>
                            </h1>
                            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                                Conecte-se com as melhores empresas do Brasil, trabalhe de onde quiser e receba com garantia. Sua liberdade profissional começa aqui.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-10">
                                <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                                    <span>+500 empresas contratando</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                                    <span>Pagamento 100% garantido</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                                    <span>Trabalhe remotamente</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/freelas/cadastro">
                                    <Button size="lg" className="h-14 px-8 text-lg bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-105 transition-all duration-300">
                                        Começar Agora — É Grátis
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                                <img
                                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop"
                                    alt="Freelancer trabalhando"
                                    className="w-full h-full object-cover"
                                />

                                {/* Floating Card 1 */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute bottom-8 left-8 z-20 bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl max-w-xs"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Pagamento Recebido</p>
                                            <p className="text-white font-bold">R$ 4.250,00</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-green-400 h-full w-full animate-pulse" />
                                    </div>
                                </motion.div>

                                {/* Floating Card 2 */}
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute top-8 right-8 z-20 bg-slate-800/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-xl flex items-center gap-3"
                                >
                                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                                    <p className="text-sm font-medium text-white">Novo projeto compatível!</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Benefits Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-teal-600 font-semibold tracking-wide uppercase text-sm">Vantagens</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Por que escolher a INOVAPRO?</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Benefícios exclusivos para freelancers que querem crescer na carreira com segurança e previsibilidade.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: DollarSign,
                                title: "Pagamento Garantido",
                                description: "Seu trabalho sempre será remunerado. O cliente paga antecipado e você recebe com segurança, sem calotes."
                            },
                            {
                                icon: Laptop,
                                title: "Trabalho Remoto",
                                description: "Trabalhe de casa, do café ou da praia. Você escolhe quando e onde trabalhar com total liberdade geográfica."
                            },
                            {
                                icon: TargetIcon,
                                title: "Projetos Qualificados",
                                description: "Conecte-se com empresas sérias e projetos desafiadores que valorizam seu talento e pagam o valor justo."
                            },
                            {
                                icon: TrendingUp,
                                title: "Crescimento Profissional",
                                description: "Construa um portfólio sólido, ganhe avaliações positivas e aumente seu valor de mercado constantemente."
                            },
                            {
                                icon: Shield,
                                title: "Proteção Total",
                                description: "Mediação justa em caso de disputas e suporte dedicado para resolver qualquer problema durante o projeto."
                            },
                            {
                                icon: Zap,
                                title: "Saque Rápido",
                                description: "Receba seus ganhos em até 2 dias úteis. Transparência total sobre taxas e prazos de recebimento."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center mb-6">
                                    <item.icon className="w-7 h-7 text-teal-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. How It Works Section */}
            <section className="py-24 bg-gradient-to-b from-teal-50/50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Como Funciona</h2>
                        <p className="text-lg text-slate-600">Comece a faturar em 4 passos simples</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-200" />

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                            {[
                                {
                                    step: "01",
                                    icon: PenTool,
                                    title: "Crie seu Perfil",
                                    description: "Cadastre-se em menos de 2 minutos. Preencha suas habilidades, experiência e portfólio."
                                },
                                {
                                    step: "02",
                                    icon: Briefcase,
                                    title: "Receba Matches",
                                    description: "Nossa IA conecta você com projetos que combinam com seu perfil. Sem propostas manuais."
                                },
                                {
                                    step: "03",
                                    icon: CheckCircle2,
                                    title: "Aceite o Projeto",
                                    description: "Analise os detalhes, valor e prazo. Aceite quando estiver pronto para começar."
                                },
                                {
                                    step: "04",
                                    icon: DollarSign,
                                    title: "Entregue e Receba",
                                    description: "Trabalhe no projeto, entregue e receba com garantia. Construa sua reputação!"
                                }
                            ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-full bg-white border-4 border-teal-100 flex items-center justify-center mb-6 shadow-sm relative">
                                        <step.icon className="w-10 h-10 text-teal-600" />
                                        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm border-4 border-white">
                                            {step.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                                    <p className="text-slate-600 text-sm">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-16">
                        <Link to="/freelas/cadastro">
                            <Button size="lg" variant="outline" className="h-12 px-8 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold rounded-xl">
                                Quero Começar Agora
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. High Demand Areas */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Áreas em Alta Demanda</h2>
                        <p className="text-lg text-slate-600">Empresas estão buscando profissionais nestas categorias</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Palette, title: "Design Gráfico", vagas: "+120 vagas" },
                            { icon: Code2, title: "Programação/Dev", vagas: "+200 vagas" },
                            { icon: Smartphone, title: "Marketing Digital", vagas: "+95 vagas" },
                            { icon: PenTool, title: "Redação/Copywriting", vagas: "+75 vagas" },
                            { icon: Video, title: "Vídeo/Animação", vagas: "+60 vagas" },
                            { icon: Languages, title: "Tradução", vagas: "+40 vagas" }
                        ].map((cat, i) => (
                            <div key={i} className="group bg-slate-50 p-6 rounded-xl hover:bg-white hover:border-teal-600 border border-transparent hover:shadow-lg transition-all duration-300 cursor-default">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white rounded-lg group-hover:bg-teal-50 transition-colors">
                                        <cat.icon className="w-6 h-6 text-slate-700 group-hover:text-teal-600" />
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                                        {cat.vagas}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Testimonials */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Histórias de Sucesso</h2>
                        <p className="text-lg text-slate-400">Veja o que nossos freelancers estão conquistando</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Ana Silva",
                                role: "Designer UI/UX",
                                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
                                text: "Consegui transformar minha paixão em renda fixa. Em 3 meses, já faturava mais do que no meu emprego anterior. A INOVAPRO mudou minha vida!"
                            },
                            {
                                name: "Carlos Mendes",
                                role: "Dev Full-Stack",
                                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
                                text: "Trabalho 100% remoto, escolho meus projetos e recebo sempre em dia. Finalmente tenho a liberdade que sempre quis."
                            },
                            {
                                name: "Mariana Costa",
                                role: "Redatora Publicitária",
                                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
                                text: "O sistema de pagamento garantido me deu segurança para largar o CLT. Hoje ganho 3x mais trabalhando como freelancer."
                            }
                        ].map((t, i) => (
                            <div key={i} className="bg-slate-800 p-8 rounded-2xl relative">
                                <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-700" />
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-teal-500" />
                                    <div>
                                        <h4 className="font-bold">{t.name}</h4>
                                        <p className="text-sm text-slate-400">{t.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-300 leading-relaxed italic">"{t.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. FAQ Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Perguntas Frequentes</h2>
                        <p className="text-lg text-slate-600">Tire suas dúvidas sobre trabalhar na INOVAPRO</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <Accordion type="single" collapsible className="w-full">
                            {[
                                {
                                    q: "Quanto custa para ser freelancer na INOVAPRO?",
                                    a: "O cadastro é 100% gratuito! Você só paga uma taxa de proteção por projeto. A taxa é progressiva e justa: 15% para projetos até R$ 500, 10% para projetos entre R$ 501 e R$ 2.000, e apenas 7% para projetos acima de R$ 2.000."
                                },
                                {
                                    q: "Como recebo meu pagamento?",
                                    a: "O cliente paga antecipado e o valor fica retido com segurança na plataforma (escrow). Após sua entrega e aprovação do cliente, o saldo fica disponível para saque imediato."
                                },
                                {
                                    q: "Preciso ter experiência?",
                                    a: "Não! Freelancers iniciantes são bem-vindos. O importante é ter habilidades e vontade de aprender. Comece com projetos menores e construa sua reputação aos poucos."
                                },
                                {
                                    q: "Posso trabalhar quantas horas quiser?",
                                    a: "Sim! A liberdade é total. Você escolhe quais projetos aceitar e quantas horas trabalhar por semana. Muitos freelancers trabalham meio período enquanto estudam ou têm outro emprego."
                                },
                                {
                                    q: "E se o cliente não gostar do trabalho?",
                                    a: "Nossa plataforma oferece mediação em caso de disputas. Antes de começar, alinhe bem o escopo com o cliente. Se houver problemas, nossa equipe intervém para encontrar uma solução justa."
                                },
                                {
                                    q: "Quais formas de pagamento vocês aceitam?",
                                    a: "Os clientes pagam via cartão de crédito, PIX ou boleto através do Mercado Pago. Você recebe o valor líquido (após taxas) na sua conta bancária cadastrada."
                                }
                            ].map((item, i) => (
                                <AccordionItem key={i} value={`item-${i}`}>
                                    <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-teal-600 transition-colors">
                                        {item.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-slate-600 leading-relaxed">
                                        {item.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* 7. Final CTA */}
            <section className="py-24 bg-gradient-to-br from-teal-600 to-emerald-600 text-white text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Pronto para Começar sua Jornada?</h2>
                        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                            Junte-se a +500 profissionais que já estão faturando com liberdade.
                            Crie sua conta grátis em menos de 2 minutos.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm font-medium">
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-teal-200" /> Cadastro 100% gratuito</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-teal-200" /> Sem taxa de adesão</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-teal-200" /> Comece hoje mesmo</span>
                        </div>

                        <Link to="/freelas/cadastro">
                            <Button size="lg" className="h-16 px-12 text-lg bg-white text-teal-700 hover:bg-slate-100 hover:text-teal-800 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                Criar Conta Grátis Agora
                                <ArrowRight className="w-6 h-6 ml-2" />
                            </Button>
                        </Link>

                        <p className="mt-6 text-sm text-white/70">
                            Não pedimos cartão de crédito • Cancele quando quiser • Suporte dedicado
                        </p>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
}
