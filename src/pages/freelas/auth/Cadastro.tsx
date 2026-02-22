import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Lock, Mail, User, FolderOpen, Loader2, Zap, CheckCircle2 } from 'lucide-react';

export default function FreelasCadastro() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [category, setCategory] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { signUp, user, loading, isFreelancer, isClient, isAdmin } = useAuth();
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

    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length > 7) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^a-zA-Z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = getPasswordStrength(password);

    const getStrengthUI = () => {
        if (password.length === 0) return { bg: 'bg-slate-200', text: 'slate-500', label: '' };
        if (strength <= 1) return { bg: 'bg-red-500', text: 'red-500', label: 'Fraca' };
        if (strength === 2) return { bg: 'bg-amber-500', text: 'amber-500', label: 'Razoável' };
        if (strength >= 3) return { bg: 'bg-emerald-500', text: 'emerald-500', label: 'Forte' };
        return { bg: 'bg-emerald-500', text: 'emerald-500', label: 'Muito Forte' };
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: 'Senhas não conferem',
                description: 'Verifique as senhas digitadas e tente novamente.',
                variant: 'destructive',
            });
            return;
        }

        if (!termsAccepted) {
            toast({
                title: 'Termos não aceitos',
                description: 'Você precisa concordar com os Termos de Uso e Política de Privacidade.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await signUp(email, password, fullName, 'freelancer');

            if (error) {
                toast({
                    title: 'Erro ao criar conta',
                    description: error.message,
                    variant: 'destructive',
                });
                return;
            }

            toast({
                title: 'Conta criada com sucesso! 🎉',
                description: 'Bem-vindo à Inovapro. Redirecionando para seu painel...',
            });

            // Temporary redirection directly to dashboard. 
            // Replace with onboarding if needed later.
            navigate('/freelas/dashboard');
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
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 overflow-y-auto bg-background relative">
                <Link
                    to="/"
                    className="absolute top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">INOVAPRO</span>
                </Link>

                <div className="w-full max-w-md mx-auto mt-16 md:mt-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold mb-2 text-slate-800 dark:text-slate-100">Crie sua conta grátis 🚀</h1>
                        <p className="text-slate-500">Leva menos de 2 minutos. Sem cartão de crédito.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="fullName"
                                    placeholder="Seu nome completo"
                                    className="pl-10 h-12 rounded-xl focus-visible:ring-teal-600"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

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
                            <Label htmlFor="category">Área de Atuação Principal</Label>
                            <div className="relative">
                                <FolderOpen className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <select
                                    id="category"
                                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus-visible:ring-1 focus-visible:ring-teal-600 focus-visible:outline-none appearance-none"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Selecione uma área</option>
                                    <option value="design">Design & UI/UX</option>
                                    <option value="desenvolvimento">Desenvolvimento & TI</option>
                                    <option value="marketing">Marketing & Vendas</option>
                                    <option value="escrita">Escrita & Tradução</option>
                                    <option value="audio_video">Áudio & Vídeo</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mín. 8 caracteres"
                                        className="pl-10 pr-10 h-12 rounded-xl focus-visible:ring-teal-600"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {/* Força da Senha */}
                                {password.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                            <div className={`h-full transition-all duration-300 ${getStrengthUI().bg}`} style={{ width: `${Math.max((strength / 4) * 100, 15)}%` }} />
                                        </div>
                                        <span className={`text-xs font-medium text-${getStrengthUI().text}`}>{getStrengthUI().label}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Repita a senha"
                                        className="pl-10 h-12 rounded-xl focus-visible:ring-teal-600"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 py-2">
                            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} className="mt-1 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600" />
                            <Label htmlFor="terms" className="text-sm font-normal text-slate-500 leading-relaxed">
                                Li e concordo com os <Link to="/termos-de-uso" className="text-teal-600 hover:underline">Termos de Uso</Link> e a <Link to="/privacidade" className="text-teal-600 hover:underline">Política de Privacidade</Link> da plataforma.
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md transition-all mt-4"
                            disabled={isLoading || !termsAccepted || (!password || password !== confirmPassword)}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                'Criar Conta Gratuitamente'
                            )}
                        </Button>
                        <p className="text-xs text-center text-slate-400 mt-2">Ao criar a conta, você aceita as nossas diretrizes comunitárias.</p>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500 pb-8">
                        Já tem conta?{' '}
                        <Link to="/freelas/login" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline">
                            Faça login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Imagem e Benefícios */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 border-l border-border flex-col justify-end p-16">
                <div className="absolute inset-0 bg-teal-900/60 mix-blend-multiply z-10" />
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1500&auto=format&fit=crop"
                    alt="Time Inovapro"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700 object-center"
                />

                <div className="relative z-20 max-w-lg">
                    <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Junte-se a +500 profissionais e comece a faturar
                    </h2>
                    <ul className="space-y-4 text-emerald-50 mb-8">
                        <li className="flex items-center gap-3 text-lg font-medium"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Pagamento garantido via Escrow</li>
                        <li className="flex items-center gap-3 text-lg font-medium"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Trabalhe de onde quiser</li>
                        <li className="flex items-center gap-3 text-lg font-medium"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Escolha seus próprios horários</li>
                        <li className="flex items-center gap-3 text-lg font-medium"><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Clientes reais e verificados B2B</li>
                    </ul>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex -space-x-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-slate-300 border-2 border-slate-900 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-white">
                                <div className="flex text-amber-400 text-sm">★★★★★</div>
                                <span className="font-semibold text-sm">Trust Score de 4.9/5</span>
                            </div>
                        </div>
                        <p className="text-teal-100 text-sm opacity-90">"Desde que entrei na plataforma, consegui 3 clientes recorrentes. O pagamento escrow tira todo o meu medo de tomar calote de clientes frios. Incrível." — Mariana F., UI Designer.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
