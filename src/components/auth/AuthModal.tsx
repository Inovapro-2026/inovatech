import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, User, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    actionText?: string;
    defaultRole?: 'client' | 'freelancer';
    onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, actionText = 'Para continuar, crie sua conta', defaultRole = 'client', onSuccess }: AuthModalProps) {
    const [role, setRole] = useState<'client' | 'freelancer'>(defaultRole);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signUp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setRole(defaultRole);
            setError('');
        }
    }, [isOpen, defaultRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!acceptTerms) {
            setError('Você deve concordar com os Termos de Uso.');
            return;
        }

        setLoading(true);

        const { error: signUpError } = await signUp(email, password, fullName, role);

        if (signUpError) {
            setError(signUpError.message || 'Erro ao criar conta. Tente novamente.');
            setLoading(false);
            return;
        }

        toast.success('Conta criada com sucesso!');
        setLoading(false);
        onClose();
        if (onSuccess) onSuccess();
    };

    const handleLoginClick = () => {
        onClose();
        navigate(role === 'client' ? '/cliente/login' : '/freelas/login');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!loading && !open) onClose();
        }}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                <div className="bg-slate-50 p-6 sm:p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/20">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl font-bold text-slate-800">
                            {actionText}
                        </DialogTitle>
                        <p className="text-center text-slate-500 mt-2 text-sm">
                            Leva menos de 2 minutos e é 100% grátis.
                        </p>
                    </DialogHeader>

                    {/* Toggle Role */}
                    <div className="flex p-1 bg-slate-200/60 rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('client')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                                role === 'client'
                                    ? "bg-white text-teal-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Building2 className="w-4 h-4" />
                            Sou Cliente
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('freelancer')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                                role === 'freelancer'
                                    ? "bg-white text-teal-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <User className="w-4 h-4" />
                            Sou Freelancer
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Ex Silva"
                                required
                                className="h-11 rounded-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email {role === 'client' ? 'Corporativo' : ''}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={role === 'client' ? 'nome@empresa.com' : 'seu@email.com'}
                                required
                                className="h-11 rounded-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="h-11 rounded-lg"
                                minLength={6}
                            />
                        </div>

                        <div className="flex items-start gap-3 pt-2">
                            <Checkbox
                                id="terms"
                                checked={acceptTerms}
                                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                                className="mt-1 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                            />
                            <Label htmlFor="terms" className="text-sm text-slate-600 font-normal leading-snug cursor-pointer">
                                Li e concordo com os Termos de Uso e Política de Privacidade.
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 mt-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-lg shadow-teal-600/20 transition-all duration-300"
                        >
                            {loading ? 'Criando conta...' : 'Criar Conta Gratuitamente'}
                        </Button>
                        <p className="text-center text-xs text-slate-400 mt-2">Sem necessidade de cartão de crédito</p>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                        <p className="text-sm text-slate-500">
                            Já tem conta?{' '}
                            <button type="button" onClick={handleLoginClick} className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                                Entrar
                            </button>
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
