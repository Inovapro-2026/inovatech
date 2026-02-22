import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { motion } from 'framer-motion';
import { ScrollText, ExternalLink, Code2, Database, LayoutTemplate, Box, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Licencas() {
    const [openLic, setOpenLic] = useState<number | null>(null);

    const mainTechs = [
        { icon: Code2, name: 'React UI', type: 'MIT License', ref: 'Meta OSS / Vercel' },
        { icon: Database, name: 'Supabase', type: 'Apache 2.0 / PostgreSQL', ref: 'Supabase Inc.' },
        { icon: LayoutTemplate, name: 'Tailwind CSS', type: 'MIT License', ref: 'Tailwind Labs' },
        { icon: Box, name: 'Mercado Pago SDK', type: 'Free Commercial API', ref: 'Mercado Libre / Meli' },
    ];

    const dependencies = [
        { name: 'framer-motion', lic: 'MIT', link: 'https://github.com/framer/motion' },
        { name: 'lucide-react', lic: 'ISC', link: 'https://lucide.dev/license' },
        { name: 'react-router-dom', lic: 'MIT', link: 'https://github.com/remix-run/react-router' },
        { name: 'shadcn/ui', lic: 'MIT', link: 'https://ui.shadcn.com' },
        { name: 'clsx / tailwind-merge', lic: 'MIT', link: 'https://github.com/lukeed/clsx' },
        { name: 'react-hook-form', lic: 'MIT', link: 'https://react-hook-form.com/' },
        { name: 'zod', lic: 'MIT', link: 'https://github.com/colinhacks/zod' },
    ];

    const fullTexts = [
        { name: 'The MIT License', text: 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.' },
        { name: 'Apache License 2.0', text: 'Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0' },
        { name: 'ISC License', text: 'Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.' }
    ];

    return (
        <PublicLayout>
            <section className="pt-32 pb-24 hero-gradient relative border-b border-border">
                <motion.div className="max-w-4xl mx-auto px-4 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm hover:scale-110 transition-transform">
                        <ScrollText className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 mt-4">Licenças de <span className="gradient-text">Software (OSS)</span></h1>
                    <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto font-medium">A Inovapro é construída sobre os ombros de gigantes open-source e APIs robustas de terceiros.</p>
                </motion.div>
            </section>

            {/* Seção 1: Top Techs */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Núcleo da Aplicação</h2>
                        <p className="text-muted-foreground text-lg">Bibliotecas estruturais que sustentam a aplicação rodando a 60FPS constantes.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        {mainTechs.map((t, i) => (
                            <motion.div
                                key={i}
                                className="bg-card p-8 border border-border shadow-sm rounded-3xl hover:border-primary/50 transition-colors flex flex-col justify-between card-hover group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div>
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                        <t.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-1">{t.name}</h3>
                                    <span className="text-muted-foreground text-sm font-medium">{t.ref}</span>
                                </div>
                                <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                                    <span className="bg-muted text-xs font-bold px-3 py-1 rounded-full uppercase text-foreground">{t.type}</span>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors cursor-pointer" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seção 2: Tabelas Secundarias */}
            <section className="py-24 bg-muted/20 border-y border-border">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Bibliotecas Secundárias (NPM)</h2>
                        <p className="text-muted-foreground text-lg">As amarrações de segurança e design atreladas aos botões.</p>
                    </div>

                    <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden text-left">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted">
                                <tr className="text-foreground text-sm">
                                    <th className="p-4 md:p-6 border-b">Dependência (Pacote)</th>
                                    <th className="p-4 md:p-6 border-b text-center">Licença Oficial</th>
                                    <th className="p-4 md:p-6 border-b text-right">Repositório</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {dependencies.map((d, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 md:p-6 font-mono font-bold text-sm text-foreground">{d.name}</td>
                                        <td className="p-4 md:p-6 text-center text-xs font-semibold"><span className="bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">{d.lic}</span></td>
                                        <td className="p-4 md:p-6 text-right">
                                            <Button variant="ghost" size="sm" className="h-8 group" asChild>
                                                <a href={d.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                    Abrir <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </a>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Seção 3: Textos Crus */}
            <section className="py-24 bg-background">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Textos na Íntegra (Boilerplates)</h2>

                    <div className="space-y-4">
                        {fullTexts.map((f, i) => (
                            <div key={i} className="border border-border rounded-2xl bg-card overflow-hidden">
                                <button
                                    className="w-full flex justify-between items-center p-6 md:p-8 text-left hover:bg-muted/50 transition-colors"
                                    onClick={() => setOpenLic(openLic === i ? null : i)}
                                >
                                    <span className="font-bold text-lg">{f.name}</span>
                                    <ChevronDown className={cn("w-6 h-6 text-muted-foreground transition-transform", openLic === i ? "rotate-180" : "")} />
                                </button>
                                {openLic === i && (
                                    <div className="p-6 md:p-8 pt-0 border-t border-border bg-card animate-slide-up">
                                        <p className="font-mono text-sm text-muted-foreground leading-relaxed mt-4 italic">{f.text}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
