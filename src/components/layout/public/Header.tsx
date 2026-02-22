import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isAdmin, isFreelancer, isClient } = useAuth();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const getDashboardLink = () => {
        if (isAdmin) return '/admin';
        if (isFreelancer) return '/freelas/dashboard';
        if (isClient) return '/marketplace/painel';
        return '/marketplace/painel';
    };

    const navLinks = [
        { href: '/#recursos', label: 'Recursos' },
        { href: '/#como-funciona', label: 'Como Funciona' },
        { href: '/#precos', label: 'Preços' },
        { href: '/marketplace', label: 'Marketplace' },
    ];

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center teal-glow">
                            <Zap className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold gradient-text">INOVAPRO</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            link.href.startsWith('/#') ? (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <Link to={getDashboardLink()}>
                                <Button className="bg-primary hover:bg-primary-light text-primary-foreground rounded-xl h-9 px-5 font-medium">
                                    Meu Painel
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/cliente/login">
                                    <Button variant="ghost" className="rounded-xl h-9 px-4 font-medium text-foreground">
                                        Entrar
                                    </Button>
                                </Link>
                                <Link to="/marketplace">
                                    <Button className="bg-primary hover:bg-primary-light text-primary-foreground rounded-xl h-9 px-5 font-medium teal-glow">
                                        Contratar Agora
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background border-b border-border"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {navLinks.map((link) => (
                                link.href.startsWith('/#') ? (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="block text-sm text-muted-foreground hover:text-foreground py-2"
                                    >
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="block text-sm text-muted-foreground hover:text-foreground py-2"
                                    >
                                        {link.label}
                                    </Link>
                                )
                            ))}
                            <div className="pt-3 flex flex-col gap-2">
                                <Link to="/cliente/login">
                                    <Button variant="outline" className="w-full rounded-xl">Entrar</Button>
                                </Link>
                                <Link to="/marketplace">
                                    <Button className="w-full bg-primary hover:bg-primary-light text-primary-foreground rounded-xl">
                                        Contratar Agora
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
