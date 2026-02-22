
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Zap, Menu, X, Bell, LayoutDashboard, Briefcase, MessageSquare,
  Wallet, Settings, FileText, Users, ShieldAlert, LogOut, Search,
  ChevronLeft, ChevronRight, User as UserIcon, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type NavItem = {
  label: string;
  href: string;
  icon: any;
  badge?: number;
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  link?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  type: 'client' | 'freelancer' | 'admin';
}

export default function DashboardLayout({ children, type }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const cleanupNotifications = setupNotificationsRealtime();
      fetchUnreadMessages();
      const cleanupMessages = setupMessagesRealtime();

      return () => {
        cleanupNotifications();
        cleanupMessages();
      };
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const setupNotificationsRealtime = () => {
    const channel = supabase
      .channel(`notifications-${user?.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);

          // Exibir toast para a nova notificação
          toast(newNotif.title, {
            description: newNotif.message,
            action: newNotif.link ? {
              label: 'Ver',
              onClick: () => navigate(newNotif.link!)
            } : undefined
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const fetchUnreadMessages = async () => {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadMessages(count || 0);
    } catch (err) {
      console.error("Erro ao buscar mensagens não lidas:", err);
    }
  };

  const setupMessagesRealtime = () => {
    const channel = supabase
      .channel(`messages-count-${user?.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user?.id}` },
        (payload: any) => {
          const message = payload.new;
          fetchUnreadMessages();

          // Buscar dados do remetente para o toast e notificações
          supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', message.sender_id)
            .single()
            .then(({ data: senderProfile }) => {
              const senderName = senderProfile?.full_name || 'Alguém';
              const senderAvatar = senderProfile?.avatar_url;

              // Adicionar uma notificação virtual para atualizar o sininho imediatamente
              const virtualNotif: Notification = {
                id: Math.random().toString(),
                title: senderName,
                message: message.content.substring(0, 100),
                type: 'info',
                is_read: false,
                created_at: message.created_at,
                link: '/marketplace/painel/mensagens'
              };
              setNotifications(prev => [virtualNotif, ...prev]);

              // Se não estiver na página de mensagens, mostra um toast personalizado
              if (!location.pathname.includes('/mensagens')) {
                toast(senderName, {
                  description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
                  icon: senderAvatar ? (
                    <img src={senderAvatar} className="w-10 h-10 rounded-full object-cover border border-indigo-100 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-sm">
                      {senderName.charAt(0)}
                    </div>
                  ),
                  action: {
                    label: 'Responder',
                    onClick: () => navigate('/marketplace/painel/mensagens')
                  }
                });
              }
            });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Erro ao marcar como lida:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Erro ao limpar notificações:", err);
    }
  };

  const clientNav: NavItem[] = [
    { label: 'Explorar Vitrine', href: '/marketplace', icon: Search },
    { label: 'Visão Geral', href: '/marketplace/painel', icon: LayoutDashboard },
    { label: 'Serviços Fechados', href: '/marketplace/painel/servicos', icon: Briefcase },
    { label: 'Concluídos', href: '/marketplace/painel/concluidos', icon: FileText },
    { label: 'Mensagens', href: '/marketplace/painel/mensagens', icon: MessageSquare, badge: unreadMessages },
    { label: 'Configurações', href: '/marketplace/painel/config', icon: Settings },
  ];

  const freelancerNav: NavItem[] = [
    { label: 'Dashboard', href: '/freelas', icon: LayoutDashboard },
    { label: 'Meus Jobs', href: '/freelas/jobs', icon: Briefcase },
    { label: 'Mensagens', href: '/freelas/messages', icon: MessageSquare },
    { label: 'Portfólio', href: '/freelas/portfolio', icon: FileText },
    { label: 'Financeiro', href: '/freelas/finance', icon: Wallet },
    { label: 'Configurações', href: '/freelas/settings', icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
    { label: 'Usuários', href: '/admin/users', icon: Users },
    { label: 'Projetos', href: '/admin/projects', icon: Briefcase },
    { label: 'Financeiro', href: '/admin/finance', icon: Wallet },
    { label: 'Disputas', href: '/admin/disputes', icon: ShieldAlert, badge: 1 },
    { label: 'Configurações', href: '/admin/settings', icon: Settings },
  ];

  const navItems = type === 'admin' ? adminNav : type === 'freelancer' ? freelancerNav : clientNav;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 shadow-xl",
          sidebarOpen ? "w-64" : "w-20",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 teal-glow">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold gradient-text truncate">INOVAPRO</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md teal-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", !isActive && "group-hover:text-primary transition-colors")} />
                {sidebarOpen && (
                  <span className="font-medium truncate flex-1">{item.label}</span>
                )}

                {item.badge && sidebarOpen && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}

                {!sidebarOpen && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        )}
      >
        {/* Header */}
        <header className="h-16 sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-30 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={
                  type === 'client' ? "Buscar freelancers..." :
                    type === 'freelancer' ? "Buscar projetos..." : "Buscar..."
                }
                className="pl-9 h-9 rounded-xl bg-muted/50 border-none focus:bg-background transition-all"
              />
            </div>
          </div>

          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/cliente/login">
                <Button variant="ghost" className="font-semibold text-slate-600 hidden sm:flex">Entrar</Button>
              </Link>
              <Link to="/cliente/cadastro">
                <Button className="font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl">Criar Conta</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground hover:bg-muted transition-transform active:scale-95">
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive border-2 border-background animate-pulse" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 shadow-2xl border-border overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                    <h3 className="font-bold text-sm">Notificações</h3>
                    <Button
                      variant="ghost"
                      className="h-7 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/10"
                      onClick={markAllAsRead}
                    >
                      Limpar Tudo
                    </Button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-medium">Tudo em dia!</p>
                        <p className="text-xs">Não há novas notificações.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            className={cn(
                              "p-4 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors relative",
                              !notif.is_read && "bg-primary/5"
                            )}
                          >
                            {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                            <div className="flex gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full shrink-0 flex items-center justify-center",
                                notif.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                                  notif.type === 'warning' ? "bg-amber-100 text-amber-600" :
                                    "bg-blue-100 text-blue-600"
                              )}>
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-tight mb-0.5 truncate">{notif.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">{notif.message}</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-1">{new Date(notif.created_at).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-border text-center">
                    <Button variant="ghost" className="w-full h-8 text-xs font-bold text-muted-foreground hover:text-primary">
                      Ver todas as notificações
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 p-0 overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || ''} alt={user?.email || 'User'} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {profile?.full_name?.substring(0, 2).toUpperCase() || 'US'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <span className="text-[10px] font-bold text-primary uppercase mt-1">
                        {type}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/${type === 'client' ? 'marketplace' : 'freelas'}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
