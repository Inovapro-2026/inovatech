import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Twitter, Linkedin, Instagram, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
    const [email, setEmail] = useState('');

    const links = {
        produto: [
            { name: 'Marketplace', path: '/marketplace' },
            { name: 'Como Funciona', path: '/#como-funciona' },
            { name: 'Preços', path: '/#precos' },
            { name: 'Para Empresas', path: '/para-empresas' },
            { name: 'Para Freelancers', path: '/para-freelancers' },
        ],
        empresa: [
            { name: 'Sobre nós', path: '/sobre-nos' },
            { name: 'Imprensa', path: '/imprensa' },
            { name: 'Trabalhe Conosco', path: '/trabalhe-conosco' },
        ],
        legal: [
            { name: 'Termos de Uso', path: '/termos-de-uso' },
            { name: 'Privacidade', path: '/privacidade' },
            { name: 'Cookies', path: '/cookies' },
            { name: 'LGPD', path: '/lgpd' },
            { name: 'Licenças', path: '/licencas' },
        ],
    };

    return (
        <footer className="bg-sidebar text-sidebar-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                                <Zap className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-white">INOVAPRO</span>
                        </div>
                        <p className="text-sidebar-foreground/60 text-sm leading-relaxed mb-6">
                            O marketplace de freelancers mais confiável do Brasil. Conectando empresas e talentos.
                        </p>
                        <div className="flex gap-3">
                            {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/60 hover:text-primary hover:bg-primary/10 transition-all duration-200"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(links).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-white font-semibold mb-4 capitalize">{category}</h4>
                            <ul className="space-y-2.5">
                                {items.map((item) => (
                                    <li key={item.name}>
                                        {item.path.startsWith('/#') ? (
                                            <a href={item.path} className="text-sidebar-foreground/60 hover:text-primary text-sm transition-colors">
                                                {item.name}
                                            </a>
                                        ) : (
                                            <Link to={item.path} className="text-sidebar-foreground/60 hover:text-primary text-sm transition-colors">
                                                {item.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter + Status */}
                <div className="border-t border-sidebar-border pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-sm text-sidebar-foreground/60">Todos os serviços operacionais</span>
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
                        className="flex gap-2 w-full max-w-sm"
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="flex-1 h-9 px-3 rounded-lg bg-sidebar-accent border border-sidebar-border text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:border-primary"
                        />
                        <Button type="submit" size="sm" className="bg-primary hover:bg-primary-light text-primary-foreground rounded-lg">
                            <Mail className="w-4 h-4" />
                        </Button>
                    </form>

                    <p className="text-sidebar-foreground/40 text-xs">
                        © 2025 INOVAPRO. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
