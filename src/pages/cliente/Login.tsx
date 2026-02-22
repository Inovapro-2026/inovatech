import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClienteLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const { user, loading, signIn, isClient, isFreelancer, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/marketplace/painel';

    useEffect(() => {
        if (user && !loading) {
            if (isClient || isAdmin) {
                navigate(from, { replace: true });
            } else if (isFreelancer) {
                navigate('/freelas/dashboard', { replace: true });
            } else {
                navigate('/');
            }
        }
    }, [user, loading, isClient, isFreelancer, isAdmin, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitLoading(true);

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
            setError('Email ou senha incorretos. Verifique suas credenciais.');
            setSubmitLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 mb-8 group">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">
                            INOVAPRO
                        </span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel do Cliente</h1>
                        <p className="text-slate-500">Entre para gerenciar seus projetos e freelancers</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-sm text-red-600">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 rounded-xl border-slate-200 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</Label>
                                <Link
                                    to="/auth/forgot-password"
                                    className="text-sm text-teal-600 hover:text-teal-500 transition-colors"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-slate-200 pr-12 focus:ring-teal-500 focus:border-teal-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={submitLoading}
                            className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base transition-all duration-300"
                        >
                            {submitLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Entrando...
                                </div>
                            ) : 'Entrar como Cliente'}
                        </Button>

                        <div className="flex justify-center gap-4 mt-6">
                            <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                                Google
                            </Button>
                            <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                                LinkedIn
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            Não tem uma conta para sua empresa?{' '}
                            <Link to="/cliente/cadastro" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
                                Crie agora
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Right Panel - Visual */}
            <div className="hidden lg:flex flex-1 bg-teal-600 items-center justify-center relative overflow-hidden backdrop-blur-md">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

                <div className="relative z-10 text-center text-white p-12 max-w-lg">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4 tracking-tight">Encontre os melhores talentos para sua empresa</h2>
                    <p className="text-teal-50 text-lg leading-relaxed mb-8">
                        Uma plataforma exclusiva para conectar o seu negócio com profissionais qualificados, gerenciando pagamentos e entregas com segurança.
                    </p>

                    <div className="flex -space-x-4 justify-center mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <img key={i} className="w-12 h-12 rounded-full border-4 border-teal-600 object-cover" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Avatar" />
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-teal-600 bg-teal-500 flex items-center justify-center text-sm font-bold shadow-lg text-white">
                            +10k
                        </div>
                    </div>
                    <p className="text-sm font-medium text-teal-100">Junte-se a 10.000+ empresas crescendo rapidamente</p>
                </div>
            </div>
        </div>
    );
}
