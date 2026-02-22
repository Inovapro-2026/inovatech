import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { useParams } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';

export default function BlogPost() {
    const { slug } = useParams();

    return (
        <PublicLayout>
            <article className="pt-32 pb-20 bg-background text-foreground min-h-screen">
                <header className="max-w-3xl mx-auto px-4 text-center mb-12 animate-slide-up">
                    <span className="text-primary font-bold tracking-wider uppercase mb-4 block">Artigo</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 capitalize">{slug?.replace(/-/g, ' ')}</h1>
                    <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm font-medium">
                        <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Equipe INOVAPRO</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> 19 Fev, 2026</span>
                        <span>5 min leitura</span>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 mb-16">
                    <div className="w-full h-80 md:h-[500px] bg-muted/60 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-sm">
                        <span className="text-muted-foreground font-semibold text-lg">Capa do Artigo Placeholder</span>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 prose dark:prose-invert lg:prose-lg leading-relaxed text-muted-foreground">
                    <p className="lead text-xl font-medium text-foreground">
                        Inovando o mercado freelance: como estruturar métodos eficientes no Brasil e crescer rapidamente no trabalho remoto.
                    </p>
                    <p>
                        O mercado de trabalho autônomo e de projetos pontuais vem tomando proporções inéditas em todo o mundo. Especialmente
                        no Brasil, a flexibilidade aliada à segurança e velocidade transformaram não só a vida de freelancers mas também o
                        caixa financeiro de grandes empresas B2B. A INOVAPRO, liderando esse cenário, implementa rotinas de confiança dupla.
                    </p>
                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">A importância da proteção de fundos (Escrow)</h2>
                    <p>
                        A tecnologia atua de forma clara: nenhum serviço começa sem o montante aprovado e depositado de forma protegida
                        na cloud. O desenvolvedor/designer não recebe calotes e, simultaneamente, o gestor de projeto tem seu investimento
                        guardado; nenhum pagamento sai da conta segura sem o aceite definitivo na entrega do Job.
                    </p>
                    <blockquote className="border-l-4 border-primary pl-4 italic my-8 text-foreground bg-primary/5 p-6 rounded-r-2xl">
                        A melhor prevenção de litígios começa com ferramentas blindadas e combinados exatos antes mesmo da primeira linha de código ser escrita.
                    </blockquote>
                    <p>
                        Para os novos freelances da plataforma, a melhor dica que podemos oferecer é a comunicação consistente: relatórios diários
                        ou a cada mileston. Não há erro para quem preza por alinhar expectativas. Boa sorte em suas próximas jornadas!
                    </p>
                </div>
            </article>
        </PublicLayout>
    );
}
