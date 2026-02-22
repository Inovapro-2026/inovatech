import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Blog() {
    const posts = [
        { slug: 'dicas-freelancer-2026', title: '5 Dicas para crescer como Freelancer em 2026', cat: 'Carreira', date: '19 Fev, 2026', author: 'Equipe INOVAPRO' },
        { slug: 'como-contratar-ideal', title: 'O guia definitivo para achar o desenvolvedor B2B perfeito', cat: 'Empresas', date: '15 Fev, 2026', author: 'Isabela (RH)' },
        { slug: 'escrow-pagamento', title: 'O que é Escrow e por que isso muda o mercado?', cat: 'Financeiro', date: '10 Fev, 2026', author: 'Marcelo' },
    ];

    return (
        <PublicLayout>
            <section className="pt-32 pb-16 hero-gradient relative">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Blog <span className="gradient-text">INOVAPRO</span></h1>
                        <p className="text-lg text-muted-foreground mb-8">Dicas, tendências e insights sobre trabalho freelance e contratações ágeis.</p>
                        <div className="relative max-w-lg mx-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input className="pl-10 h-12 rounded-xl text-base bg-card border-border shadow-sm focus:bg-background" placeholder="Buscar artigos..." />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-background text-foreground">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {posts.map((post, i) => (
                            <motion.div
                                key={i}
                                className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer card-hover"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                            >
                                <div className="h-48 bg-muted/50 flex items-center justify-center relative">
                                    <span className="text-muted-foreground opacity-50">Image Placeholder</span>
                                    <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">{post.cat}</span>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h2 className="text-xl font-bold mb-3 hover:text-primary transition-colors">{post.title}</h2>
                                    <p className="text-muted-foreground mb-4 line-clamp-2 flex-1">A INOVAPRO tem orgulho de trazer para a mesa novos guias de melhores práticas no Brasil. Quer saber mais sobre como otimizar isso?</p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
                                        </div>
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {post.date}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Button variant="outline" size="lg" className="rounded-xl px-12">Carregar Mais</Button>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
