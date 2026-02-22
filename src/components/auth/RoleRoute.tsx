import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowRight, LogOut, Home } from 'lucide-react';

interface RoleRouteProps {
  children: React.ReactNode;
  role: 'client' | 'freelancer' | 'admin';
  redirectTo?: string;
}

export function RoleRoute({ children, role, redirectTo }: RoleRouteProps) {
  const { user, profile, isAdmin, isFreelancer, isClient, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [expectedArea, setExpectedArea] = useState('');

  useEffect(() => {
    if (loading || !user || !profile) return;

    let hasAccess = false;
    let areaName = '';

    switch (role) {
      case 'admin':
        hasAccess = isAdmin;
        areaName = 'Administradores';
        break;
      case 'freelancer':
        hasAccess = isFreelancer;
        areaName = 'Freelancers';
        break;
      case 'client':
        hasAccess = isClient;
        areaName = 'Clientes/Empresas';
        break;
    }

    if (!hasAccess) {
      setExpectedArea(areaName);
      setShowModal(true);
    }
  }, [loading, user, profile, isAdmin, isFreelancer, isClient, role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, redireciona para o login correspondente
  if (!user || !profile) {
    const loginPath = role === 'admin' ? '/admin/login' :
      role === 'freelancer' ? '/freelas/login' : '/auth/login';

    // Usar window.location para evitar problemas de recursão se o componente for remontado
    window.location.href = loginPath;
    return null;
  }

  const handleGoToCorrectDashboard = () => {
    if (isAdmin) navigate('/admin');
    else if (isFreelancer) navigate('/freelas/dashboard');
    else if (isClient) navigate('/marketplace/painel');
    else navigate('/');
    setShowModal(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setShowModal(false);
  };

  // Se o modal estiver aberto, mostramos apenas o modal e um overlay
  if (showModal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Dialog open={showModal} onOpenChange={() => { }}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
            <div className="bg-red-600 p-8 flex flex-col items-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-2xl font-extrabold text-white text-center">
                Acesso Restrito
              </DialogTitle>
              <DialogDescription className="text-red-100 text-center mt-2 font-medium">
                Esta área é exclusiva para {expectedArea}.
              </DialogDescription>
            </div>

            <div className="p-6 space-y-3 bg-white">
              <p className="text-slate-600 text-sm text-center mb-4">
                Você está logado como <strong>{profile.role === 'freelancer' ? 'Freelancer' : profile.role === 'client' ? 'Cliente' : 'Administrador'}</strong>. Escolha como deseja prosseguir:
              </p>

              <Button
                onClick={handleGoToCorrectDashboard}
                className="w-full h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-between px-6"
              >
                <span>Ir para meu Painel</span>
                <ArrowRight className="w-5 h-5" />
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Link to="/">
                    <Home className="w-4 h-4" /> Início
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Verifica acesso final sincronamente para evitar flicker
  let hasAccess = false;
  switch (role) {
    case 'admin': hasAccess = isAdmin; break;
    case 'freelancer': hasAccess = isFreelancer; break;
    case 'client': hasAccess = isClient; break;
  }

  if (!hasAccess) return null;

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute role="admin">{children}</RoleRoute>;
}
