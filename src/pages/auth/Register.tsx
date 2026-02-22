import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Eye, EyeOff, AlertCircle, Building2, Code2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type RoleType = 'client' | 'freelancer';

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<RoleType>('client');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(email, password, fullName, role);

    if (signUpError) {
      setError('Erro ao criar conta. Tente novamente.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      if (role === 'freelancer') {
        navigate('/freelas');
      } else {
        navigate('/marketplace');
      }
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background-alt flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Conta criada!</h2>
          <p className="text-muted-foreground">Redirecionando para o seu painel...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-alt flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center teal-glow">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold gradient-text">INOVAPRO</span>
        </Link>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-card-hover">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">Criar conta gratuita</h1>
            <p className="text-muted-foreground text-sm">Junte-se a mais de 500 profissionais</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-foreground mb-3 block">Eu sou...</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  role === 'client'
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                <Building2 className="w-6 h-6" />
                <div className="text-center">
                  <p className="font-semibold text-sm">Empresa / Cliente</p>
                  <p className="text-xs opacity-70">Quero contratar</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  role === 'freelancer'
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                <Code2 className="w-6 h-6" />
                <div className="text-center">
                  <p className="font-semibold text-sm">Freelancer</p>
                  <p className="text-xs opacity-70">Quero trabalhar</p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                placeholder="João Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11 rounded-xl input-focus"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl input-focus"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl pr-12 input-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 rounded-xl input-focus"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-light text-primary-foreground font-semibold teal-glow transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Criando conta...
                </div>
              ) : `Criar conta como ${role === 'client' ? 'Cliente' : 'Freelancer'}`}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Já tem conta?{' '}
            <Link to="/auth/login" className="text-primary hover:text-primary-light font-medium">
              Entrar
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-3">
            Ao criar uma conta, você concorda com os{' '}
            <Link to="#" className="text-primary hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link to="#" className="text-primary hover:underline">Política de Privacidade</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
