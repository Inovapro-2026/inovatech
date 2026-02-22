import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, BookOpen, User, AlertTriangle, Copyright, DollarSign, Scale, Scroll, ShieldAlert, Ban, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function Termos() {
    const [activeHash, setActiveHash] = useState('');

    useEffect(() => {
        const handleHash = () => setActiveHash(window.location.hash);
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const indices = [
        { id: '#aceitacao', title: '1. Aceitação dos Termos' },
        { id: '#definicoes', title: '2. Definições' },
        { id: '#cadastro', title: '3. Cadastro e Conta' },
        { id: '#condutas', title: '4. Condutas Proibidas' },
        { id: '#propriedade', title: '5. Propriedade Intelectual' },
        { id: '#pagamentos', title: '6. Pagamentos e Taxas' },
        { id: '#responsabilidades', title: '7. Responsabilidades' },
        { id: '#limitacao', title: '8. Limitação de Resp.' },
        { id: '#rescisao', title: '9. Rescisão' },
        { id: '#alteracoes', title: '10. Alterações' },
        { id: '#foro', title: '11. Lei Aplicável e Foro' },
    ];

    const sections = [
        {
            id: 'aceitacao',
            title: '1. Aceitação dos Termos',
            icon: CheckCircle2,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6 rounded-r-lg font-medium text-foreground">
                        Ao acessar ou usar a INOVAPRO, você concorda expressamente com todos os termos e condições deste documento. Se não concordar, por favor, não utilize a plataforma.
                    </div>
                    <p>Este Termo de Uso estabelece as regras básicas que orientam e protegem tanto as empresas contratantes quanto os profissionais que usam os nossos serviços, garantindo a lisura fiscal e compliance de software exigidos pela lei Pátria Geral do Trabalhador brasileiro.</p>
                </div>
            )
        },
        {
            id: 'definicoes',
            title: '2. Definições',
            icon: BookOpen,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <table className="w-full text-left border-collapse border border-border mt-4">
                        <thead className="bg-muted text-foreground">
                            <tr><th className="p-3 border">Termo</th><th className="p-3 border">Definição Operacional</th></tr>
                        </thead>
                        <tbody>
                            <tr><td className="p-3 border font-semibold">Plataforma</td><td className="p-3 border">O software INOVAPRO (Site, WebApp e App Mobile)</td></tr>
                            <tr><td className="p-3 border font-semibold">Cliente</td><td className="p-3 border">Pessoa física ou jurídica B2B inscrita para contratação</td></tr>
                            <tr><td className="p-3 border font-semibold">Freelancer</td><td className="p-3 border">Prestador de serviço autônomo verificado aprovado pelo nosso KYC</td></tr>
                            <tr><td className="p-3 border font-semibold">Escrow</td><td className="p-3 border">Conta-Sombra jurídica com autorização BACEN onde o dinheiro fica retido</td></tr>
                        </tbody>
                    </table>
                </div>
            )
        },
        {
            id: 'cadastro',
            title: '3. Cadastro e Conta',
            icon: User,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <ul className="list-disc pl-6 mb-6">
                        <li>É estritamente necessário utilizar dados cíveis consistentes (CPF/CNPJ).</li>
                        <li>As informações bancárias e fiscais devem bater com a titularidade base da conta.</li>
                        <li>Você é o principal mantenedor do segredo do seu token e senha.</li>
                    </ul>
                    <div className="bg-destructive/10 text-destructive p-4 border border-destructive/20 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        Para gerenciar depósitos, em ambos os pólos, o usuário deve declarar obrigatoriamente sob as penas da lei ter mais de 18 (dezoito) anos completos na vigência do cadastro.
                    </div>
                </div>
            )
        },
        {
            id: 'condutas',
            title: '4. Condutas Proibidas',
            icon: Ban,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p>São terminantemente proibidas as seguintes atitudes, com penalidade sumária de banimento irreversível da plataforma e representação em juízo federal:</p>
                    <ul className="mt-4 space-y-3">
                        <li className="flex items-center gap-3 text-destructive font-medium"><span className="text-xl">❌</span> Compartilhar informações cadastrais falsas de forma premeditada.</li>
                        <li className="flex items-center gap-3 text-destructive font-medium"><span className="text-xl">❌</span> Tentar burlar ou driblar as taxas enviando cobranças via WhatsApp para o cliente.</li>
                        <li className="flex items-center gap-3 text-destructive font-medium"><span className="text-xl">❌</span> Assediar, proferir discursos racistas, xenofóbicos ou misóginos na plataforma.</li>
                        <li className="flex items-center gap-3 text-destructive font-medium"><span className="text-xl">❌</span> Violar patentes publicadas, direitos autorais e códigos-fontes com NDA sigiloso.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'propriedade',
            title: '5. Propriedade Intelectual',
            icon: Copyright,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p>As marcas comerciais "INOVAPRO", logos subjacentes, ilustrações 3D da hero, código-fonte (SaaS e Backends) e identidade da marca hospedados nestes domínios são patentes registradas. Os serviços prestados de forma livre (entre Cliente e Freelancer) têm seus NDAs garantidos entre as partes com transferência de IP imediata ao pagamento final.</p>
                </div>
            )
        },
        {
            id: 'pagamentos',
            title: '6. Pagamentos e Taxas',
            icon: DollarSign,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <table className="w-full text-left border-collapse border border-border mt-4">
                        <thead className="bg-primary/5 text-foreground">
                            <tr><th className="p-3 border">Faixa de Valor (Projeto)</th><th className="p-3 border">Taxa de Proteção INOVAPRO</th></tr>
                        </thead>
                        <tbody>
                            <tr><td className="p-3 border font-semibold">Até R$ 500,00</td><td className="p-3 border">15% (Taxa Mínima de Operação)</td></tr>
                            <tr><td className="p-3 border font-semibold">R$ 501,00 até R$ 2.000,00</td><td className="p-3 border">10% (Taxa Intermediária)</td></tr>
                            <tr><td className="p-3 border font-semibold">Acima de R$ 2.000,00</td><td className="p-3 border">7% (Taxa para Grandes Projetos)</td></tr>
                        </tbody>
                    </table>
                    <p className="mt-6 text-sm">A INOVAPRO não cobra taxas de cadastro, mensalidades ou anuidades. A receita da plataforma provém exclusivamente das taxas de proteção aplicadas sobre transações concluídas com sucesso.</p>
                    <p className="mt-6 text-sm">O repasse para o freelancer é processado com exclusividade pelo <b>Mercado Pago Checkout</b> oficial do Brasil, efetuado instantaneamente via PIX Escrow ou via TED Bancário D+1.</p>
                </div>
            )
        },
        {
            id: 'responsabilidades',
            title: '7. Responsabilidades',
            icon: ShieldAlert,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p>A plataforma atua puramente como "Match, Hospedagem e Seguradora Financeira". Não empregamos CLT, não assinamos carteira como despachante para empresas sediadas no exterior e não gerenciamos impostos municipais (ISS) se o contratante usar nota-fiscal internacional.</p>
                </div>
            )
        },
        {
            id: 'limitacao',
            title: '8. Limitação de Responsabilidade',
            icon: Scale,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p>Em nenhum momento, se provado na câmara de arbitragem, a indenização da INOVAPRO ultrapassará os totais repassados pelos serviços das taxas (a base de cálculos nunca será sobre fundos custodiados em escrow, o qual já é imune e repassado pela Seguradora Mercado Livre S.A).</p>
                </div>
            )
        },
        {
            id: 'rescisao',
            title: '9. Rescisão',
            icon: Scroll,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p>As contas podem vir a ser suspensas unilateralmente pela gestão e com encerramento de escrows automáticos de volta para a carteira de origem nos casos dos arts. 4 e 5 sem chance de restauração (salvo erro material contábil apurado no suporte ticket 42 ou e-mail).</p>
                </div>
            )
        },
        {
            id: 'alteracoes',
            title: '10. Alterações nos Termos',
            icon: RefreshCcw,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p>Estes termos podem e vão sofrer minutas anuais de adaptação a jurisprudências Cíveis/Criminais/Trabalhistas. Enviaremos notificações push para a dashboard e por e-mail quando qualquer alteração substantiva ocorrer. O continuado uso após 30 dias define Aceitação Tácita.</p>
                </div>
            )
        },
        {
            id: 'foro',
            title: '11. Lei Aplicável e Foro',
            icon: Scale,
            content: (
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p>Apesar da operação Web abranger múltiplos países latinos, a jurisdição destes Termos é subordinada fielmente às normativas da República Federativa do Brasil e LGPD, elegendo-se de forma absoluta e irrevogável o <b>Foro Central da Comarca da Capital de São Paulo - Estado de São Paulo</b>, abdicando qualquer outro, por mais favorecido.</p>
                </div>
            )
        },
    ];

    return (
        <PublicLayout>
            <section className="pt-32 pb-24 hero-gradient relative border-b border-border">
                <motion.div className="max-w-4xl mx-auto px-4 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Termos de <span className="gradient-text">Uso Corporativo</span></h1>
                    <p className="text-xl text-muted-foreground border border-border inline-flex items-center gap-2 px-6 py-2 rounded-full mt-4 bg-background shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Atualizado Oficialmente em: 01 de Março de 2026
                    </p>
                </motion.div>
            </section>

            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-4 gap-12 relative">

                    {/* Sticky Sidebar Index */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-28 bg-card rounded-2xl border border-border p-6 shadow-sm overflow-hidden">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Índice</h3>
                            <nav className="flex flex-col space-y-2">
                                {indices.map(nav => (
                                    <a
                                        key={nav.id}
                                        href={nav.id}
                                        className={cn(
                                            "text-sm transition-colors py-1 hover:text-primary",
                                            activeHash === nav.id ? "text-primary font-bold pl-2 border-l-2 border-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {nav.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="lg:col-span-3">
                        <div className="flex flex-col gap-16">
                            {sections.map((sec) => (
                                <div key={sec.id} id={sec.id} className="scroll-mt-32">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                                            <sec.icon className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold">{sec.title}</h2>
                                    </div>
                                    <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-foreground">
                                        {sec.content}
                                    </div>
                                    <div className="text-right mt-4">
                                        <a href="#" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
                                            ↑ Voltar ao Índice
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
