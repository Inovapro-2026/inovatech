import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Mail, Loader2, Zap } from 'lucide-react';

export default function FreelasLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { signIn, user, loading, isFreelancer, isClient, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const from = (location.state as any)?.from?.pathname || '/freelas/dashboard';

    useEffect(() => {
        if (user && !loading) {
            if (isFreelancer || isAdmin) {
                navigate(from, { replace: true });
            } else if (isClient) {
                navigate('/marketplace/painel', { replace: true });
            } else {
                navigate('/');
            }
        }
    }, [user, loading, isFreelancer, isClient, isAdmin, navigate, from]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await signIn(email, password);

            if (error) {
                toast({
                    title: 'Erro ao entrar',
                    description: error.message === 'Invalid login credentials'
                        ? 'Email ou senha inválidos. Verifique e tente novamente.'
                        : 'Ocorreu um erro ao tentar entrar. Tente novamente mais tarde.',
                    variant: 'destructive',
                });
                return;
            }

            toast({
                title: 'Bem-vindo de volta!',
                description: 'Login realizado com sucesso.',
            });

        } catch (error) {
            toast({
                title: 'Erro no sistema',
                description: 'Não foi possível conectar ao servidor.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-foreground">
            {/* Lado Esquerdo - Formulário */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-background relative">
                <Link
                    to="/"
                    className="absolute top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">INOVAPRO</span>
                </Link>

                <div className="w-full max-w-md mt-16 lg:mt-0">
                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold mb-2 text-slate-800 dark:text-slate-100">Bem-vindo de volta, Freelancer! 👋</h1>
                        <p className="text-slate-500">Acesse sua conta e continue conquistando projetos</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="pl-10 h-12 rounded-xl focus-visible:ring-teal-600"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link to="/auth/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Sua senha"
                                    className="pl-10 pr-10 h-12 rounded-xl focus-visible:ring-teal-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar como Freelancer'
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Não tem conta ainda?{' '}
                        <Link to="/freelas/cadastro" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline">
                            Crie agora
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Imagem */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 border-l border-border">
                <div className="absolute inset-0 bg-teal-900/40 mix-blend-multiply z-10" />
                <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1500&auto=format&fit=crop"
                    alt="Freelancer trabalhando remoto"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />

                <div className="relative z-20 flex flex-col justify-end p-16 w-full h-full">
                    <div className="max-w-xl">
                        <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-sm font-semibold mb-6 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            +500 freelancers ativos
                        </span>
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Monetize suas habilidades
                        </h2>
                        <p className="text-lg text-slate-300">
                            Trabalhe com liberdade, escolha seus projetos e receba com a proteção da garantia de pagamento Inovapro.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
