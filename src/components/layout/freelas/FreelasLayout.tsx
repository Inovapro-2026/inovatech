import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    BarChart3,
    Briefcase,
    MessageSquare,
    FolderOpen,
    Wallet,
    Settings,
    LogOut,
    Menu,
    Bell,
    Search,
    ChevronLeft,
    ChevronRight,
    User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FreelasLayoutProps {
    children: React.ReactNode;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
    link?: string;
}

export function FreelasLayout({ children }: FreelasLayoutProps) {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);

    useEffect(() => {
        if (profile?.id) {
            fetchNotifications();
            const cleanupNotifications = setupNotificationsRealtime();
            fetchUnreadMessages();
            const cleanupMessages = setupMessagesRealtime();

            return () => {
                cleanupNotifications();
                cleanupMessages();
            };
        }
    }, [profile?.id]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', profile?.id)
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
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile?.id}` },
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
                .eq('receiver_id', profile?.id)
                .eq('is_read', false);

            if (error) throw error;
            setUnreadMessages(count || 0);
        } catch (err) {
            console.error("Erro ao buscar mensagens não lidas:", err);
        }
    };

    const setupMessagesRealtime = () => {
        const channel = supabase
            .channel('messages-count-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile?.id}` },
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
                                link: '/freelas/mensagens'
                            };
                            setNotifications(prev => [virtualNotif, ...prev]);

                            // Se não estiver na página de mensagens, mostra um toast personalizado
                            if (!location.pathname.includes('/mensagens')) {
                                toast(senderName, {
                                    description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
                                    icon: senderAvatar ? (
                                        <img src={senderAvatar} className="w-10 h-10 rounded-full object-cover border border-teal-100 shadow-sm" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-black shadow-sm">
                                            {senderName.charAt(0)}
                                        </div>
                                    ),
                                    action: {
                                        label: 'Responder',
                                        onClick: () => navigate('/freelas/mensagens')
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
                .eq('user_id', profile?.id)
                .eq('is_read', false);

            if (error) throw error;
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error("Erro ao limpar notificações:", err);
        }
    };

    const menuItems = [
        { icon: BarChart3, label: 'Dashboard', path: '/freelas/dashboard', badge: 0 },
        { icon: Briefcase, label: 'Meus Jobs', path: '/freelas/jobs', badge: 0 },
        { icon: MessageSquare, label: 'Mensagens', path: '/freelas/mensagens', badge: unreadMessages },
        { icon: FolderOpen, label: 'Portfólio', path: '/freelas/portfolio', badge: 0 },
        { icon: Wallet, label: 'Financeiro', path: '/freelas/financeiro', badge: 0 },
        { icon: Settings, label: 'Configurações', path: '/freelas/config', badge: 0 },
    ];

    const handleLogout = async () => {
        await signOut();
        navigate('/freelas/login');
    };

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-800">
            {/* SIDEBAR DESKTOP */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-20'} hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out relative z-30 shadow-sm`}
            >
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-teal-600 shadow-sm hover:shadow-md transition-all z-50 group"
                >
                    {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                <div className="h-24 flex items-center justify-center border-b border-slate-100 px-6">
                    <Link to="/freelas/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-black shadow-lg shadow-teal-200 transform group-hover:scale-110 transition-transform">
                            I
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col animate-in fade-in duration-500">
                                <span className="font-black text-xl tracking-tight text-slate-900 leading-none">INOVAPRO</span>
                                <span className="text-[10px] font-bold text-teal-600 tracking-widest uppercase">Freelancer</span>
                            </div>
                        )}
                    </Link>
                </div>

                <div className="flex-1 py-8 flex flex-col gap-2 px-4 overflow-y-auto custom-scrollbar">
                    {isSidebarOpen && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Menu Principal</p>
                    )}

                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={!isSidebarOpen ? item.label : ''}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-teal-600'} transition-colors`} />
                                {isSidebarOpen && <span className="flex-1 font-bold text-[14px]">{item.label}</span>}
                                {item.badge > 0 && (
                                    <span className={`flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black shadow-sm ${isActive ? 'bg-white text-teal-600' : 'bg-red-500 text-white'}`}>
                                        {item.badge}
                                    </span>
                                )}
                                {!isSidebarOpen && isActive && <div className="absolute left-0 w-1.5 h-6 bg-teal-600 rounded-r-full" />}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-6 mt-auto">
                    {isSidebarOpen ? (
                        <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-4 border border-slate-100 shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-teal-50 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Seu Status</p>
                                    <p className="text-xs font-black text-teal-700">Disponível para Jobs</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full h-9 rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm">
                                Alterar Status
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm animate-pulse" />
                        </div>
                    )}
                </div>
            </aside>

            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* SIDEBAR MOBILE */}
            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="h-20 flex items-center px-6 border-b border-slate-100 justify-between">
                    <Link to="/freelas/dashboard" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">I</div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-900">INOVAPRO</span>
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive
                                    ? 'bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600'
                                    : 'text-slate-500 hover:bg-slate-50 border-l-4 border-transparent'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                <span className="flex-1">{item.label}</span>
                                {item.badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* HEADER SUPERIOR */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-20">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="md:hidden text-slate-500 hover:text-slate-900"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Buscar projetos, mensagens ou arquivos..."
                                className="pl-10 h-10 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-500 rounded-full w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 rounded-full h-10 w-10 transition-transform active:scale-95">
                                    <Bell className="w-5 h-5" />
                                    {notifications.filter(n => !n.is_read).length > 0 && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-bounce" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 shadow-2xl border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 text-sm">Notificações</h3>
                                    <Button
                                        variant="ghost"
                                        className="h-7 text-[10px] font-black uppercase tracking-wider text-teal-600 hover:bg-teal-50"
                                        onClick={() => markAllAsRead()}
                                    >
                                        Limpar Tudo
                                    </Button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {loadingNotifications ? (
                                        <div className="p-8 text-center"><span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block" /></div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Bell className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400">Tudo limpo por aqui!</p>
                                            <p className="text-xs text-slate-300">Você não tem novas notificações.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors relative ${!notif.is_read ? 'bg-teal-50/30' : ''}`}
                                                >
                                                    {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />}
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                                            notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            <Bell className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 leading-tight mb-0.5 truncate">{notif.title}</p>
                                                            <p className="text-xs text-slate-500 line-clamp-2 leading-snug">{notif.message}</p>
                                                            <p className="text-[10px] font-medium text-slate-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t border-slate-100 text-center">
                                    <Button variant="ghost" className="w-full h-8 text-xs font-bold text-slate-500 hover:text-teal-600">
                                        Ver todas as notificações
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-auto p-1 pl-2 pr-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={profile?.avatar_url || ''} />
                                        <AvatarFallback className="bg-teal-100 text-teal-700 font-bold">{profile?.full_name?.charAt(0) || 'F'}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden md:block">
                                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">{profile?.full_name || 'Freelancer'}</p>
                                        <p className="text-xs font-medium text-teal-600 leading-none">PRO</p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild><Link to="/freelas/config" className="cursor-pointer"><UserIcon className="w-4 h-4 mr-2" /> Perfil</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link to="/freelas/financeiro" className="cursor-pointer"><Wallet className="w-4 h-4 mr-2" /> Ganhos</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer font-medium">
                                    <LogOut className="w-4 h-4 mr-2" /> Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
