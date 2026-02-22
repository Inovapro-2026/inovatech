
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Heart, ArrowRight, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import ProjectDetailsModal from '@/components/marketplace/ProjectDetailsModal';
import { toast } from 'sonner';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Fallback de public key para o SDK não quebrar. Em prod deve ir para o .env local do usuário.
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-aa4e0a93-7800-412b-a8d3-2ed1ccd9d5bf', { locale: 'pt-BR' });

export default function MarketplaceIndex() {
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [services, setServices] = useState<any[]>([]);
    const [filteredServices, setFilteredServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(true);

    // Mercado Pago states
    const [checkoutPreferenceId, setCheckoutPreferenceId] = useState<string | null>(null);
    const [mpModalOpen, setMpModalOpen] = useState(false);

    // Auth Gate related
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authActionText, setAuthActionText] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    // Handle pending actions after login
    useEffect(() => {
        if (user) {
            const pending = localStorage.getItem('pendingAction');
            if (pending) {
                try {
                    const action = JSON.parse(pending);
                    if (Date.now() - action.timestamp < 3600000) { // 1 hour expiration
                        localStorage.removeItem('pendingAction');
                        // Small delay to ensure smooth transition
                        setTimeout(() => {
                            if (action.type === 'hire') {
                                handleContratar(action.payload);
                            } else if (action.type === 'message') {
                                handleMessage(action.payload);
                            } else if (action.type === 'favorite') {
                                handleFavorite(action.payload);
                            }
                        }, 500);
                    } else {
                        localStorage.removeItem('pendingAction');
                    }
                } catch (e) { }
            }
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [services, searchQuery, selectedCategory, priceRange]);

    const applyFilters = () => {
        let result = [...services];

        if (searchQuery) {
            result = result.filter(s =>
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory && selectedCategory !== 'all') {
            result = result.filter(s => s.category === selectedCategory);
        }

        result = result.filter(s => s.price >= priceRange[0] && s.price <= priceRange[1]);

        setFilteredServices(result);
    };

    const fetchServices = async () => {
        try {
            setLoading(true);

            // 1. Fetch projects
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select(`
                    *,
                    freelancer:profiles!freelancer_id (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('status', 'published');

            if (projectsError) throw projectsError;

            // 2. Fetch all reviews to calculate ratings/counts
            const { data: allReviews } = await supabase
                .from('reviews')
                .select('rated_id, rating');

            // 3. Fetch completed projects count per freelancer
            const { data: allContracts } = await supabase
                .from('contracts')
                .select('freelancer_id')
                .eq('status', 'completed');

            const statsMap: any = {};

            allReviews?.forEach(rev => {
                if (!statsMap[rev.rated_id]) statsMap[rev.rated_id] = { sum: 0, count: 0, projects: 0 };
                statsMap[rev.rated_id].sum += rev.rating;
                statsMap[rev.rated_id].count += 1;
            });

            allContracts?.forEach(cont => {
                if (!statsMap[cont.freelancer_id]) statsMap[cont.freelancer_id] = { sum: 0, count: 0, projects: 0 };
                statsMap[cont.freelancer_id].projects += 1;
            });

            const transformedData = (projects || []).map(item => {
                const stats = statsMap[item.freelancer_id] || { sum: 0, count: 0, projects: 0 };
                const avgRating = stats.count > 0 ? (stats.sum / stats.count).toFixed(1) : 0;

                return {
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    price: Number(item.price) || 0,
                    category: item.category || 'Geral',
                    image: item.cover_image_url || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=400',
                    rating: avgRating,
                    reviews: stats.count,
                    projectsCount: stats.projects,
                    tags: item.image_urls || [],
                    freelancer: {
                        id: item.freelancer?.id,
                        name: item.freelancer?.full_name || 'Profissional',
                        avatar: item.freelancer?.avatar_url || 'https://github.com/shadcn.png',
                        level: stats.projects > 10 ? 'Elite' : 'Premium'
                    }
                };
            });

            setServices(transformedData);
        } catch (error: any) {
            console.error("Erro ao carregar serviços:", error);
            toast.error("Erro ao carregar serviços");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (project: any) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const requireAuth = (actionType: string, actionText: string, actionPayload: any, callback: () => void) => {
        if (!user) {
            localStorage.setItem('pendingAction', JSON.stringify({
                type: actionType,
                payload: actionPayload,
                timestamp: Date.now()
            }));
            navigate('/cliente/cadastro');
        } else {
            callback();
        }
    };

    const handleMessage = (project: any) => {
        requireAuth('message', 'Para enviar uma mensagem, crie sua conta grátis', project, () => {
            navigate('/marketplace/painel/mensagens');
        });
    };

    const handleFavorite = (project: any) => {
        requireAuth('favorite', 'Para salvar aos favoritos, crie sua conta', project, () => {
            toast.success('Projeto salvo nos favoritos!');
        });
    };

    const handleContratar = async (project: any) => {
        const executeCheckout = async () => {
            try {
                setCheckoutLoading(true);
                const { data, error } = await supabase.functions.invoke('mercadopago-checkout', {
                    body: {
                        projectId: project.id,
                        freelancerId: project.freelancer.id,
                        title: project.title,
                        amount: project.price,
                        back_urls: {
                            success: `${window.location.origin}/marketplace/success`,
                            failure: `${window.location.origin}/marketplace`,
                            pending: `${window.location.origin}/marketplace`
                        },
                        auto_return: "approved",
                        success_url: `${window.location.origin}/marketplace/success`,
                        cancel_url: `${window.location.origin}/marketplace`
                    }
                });

                if (error) throw error;
                if (data && data.error) throw new Error(data.error);

                if (data?.preference_id) {
                    setCheckoutPreferenceId(data.preference_id);
                    setMpModalOpen(true);
                } else if (data?.url) {
                    // Fallback se não vier o preference_id por algum motivo
                    window.location.href = data.url;
                } else {
                    throw new Error("Erro ao gerar preferência de pagamento.");
                }
            } catch (error: any) {
                console.error('Checkout Error Details:', error);

                let detailedMessage = error.message;

                // Extrair corpo da resposta da Edge Function se for erro 4xx/5xx
                if (error.context && typeof error.context.json === 'function') {
                    try {
                        const errData = await error.context.json();
                        detailedMessage = errData.error || detailedMessage;
                    } catch (e) {
                        try {
                            const errText = await error.context.text();
                            detailedMessage = errText || detailedMessage;
                        } catch (e2) { }
                    }
                } else if (error.context?.error) {
                    detailedMessage = error.context.error;
                } else if (error.details) {
                    detailedMessage = error.details;
                }

                toast.error("Erro no checkout: " + detailedMessage, {
                    duration: 7000
                });
            } finally {
                setCheckoutLoading(false);
            }
        };

        requireAuth('hire', 'Para contratar este serviço, crie sua conta em menos de 2 minutos', project, executeCheckout);
    };

    return (
        <DashboardLayout type="client">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="O que você está procurando?"
                                className="pl-10 h-11"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="hidden md:flex">
                            <Filter className="w-4 h-4 mr-2" />
                            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden flex">
                            <Filter className="w-4 h-4" />
                        </Button>
                        <Select defaultValue="relevance">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="relevance">Mais Relevantes</SelectItem>
                                <SelectItem value="recent">Mais Recentes</SelectItem>
                                <SelectItem value="price_low">Menor Preço</SelectItem>
                                <SelectItem value="price_high">Maior Preço</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    {showFilters && (
                        <aside className="space-y-6 lg:col-span-1">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground">Categorias</h3>
                                <div className="space-y-2">
                                    {['Design', 'Desenvolvimento', 'Marketing', 'Escrita', 'Vídeo'].map((cat) => (
                                        <div key={cat} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={cat}
                                                checked={selectedCategory === cat}
                                                onCheckedChange={(checked) => {
                                                    setSelectedCategory(checked ? cat : 'all')
                                                }}
                                            />
                                            <label
                                                htmlFor={cat}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {cat}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground">Preço (R$)</h3>
                                <Slider
                                    defaultValue={[0, 5000]}
                                    max={10000}
                                    step={50}
                                    value={priceRange}
                                    onValueChange={setPriceRange}
                                    className="py-4"
                                />
                                <div className="flex items-center justify-between text-sm">
                                    <span>R$ {priceRange[0]}</span>
                                    <span>R$ {priceRange[1]}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground">Nível</h3>
                                <div className="space-y-2">
                                    {['Junior', 'Pleno', 'Senior', 'Especialista'].map((level) => (
                                        <div key={level} className="flex items-center space-x-2">
                                            <Checkbox id={level} />
                                            <label
                                                htmlFor={level}
                                                className="text-sm font-medium leading-none"
                                            >
                                                {level}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button className="w-full" variant="outline">Limpar Filtros</Button>
                        </aside>
                    )}

                    {/* Grid */}
                    <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-muted-foreground animate-pulse">Carregando serviços...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredServices.length > 0 ? filteredServices.map((project, i) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Card className="overflow-hidden card-hover group h-full flex flex-col border-border/50">
                                            {/* Image Area */}
                                            <div className="relative h-48 overflow-hidden pointer-events-none">
                                                <img
                                                    src={project.image}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-auto">
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-primary text-primary-foreground hover:bg-primary-light"
                                                        onClick={() => handleViewDetails(project)}
                                                    >
                                                        Ver Detalhes
                                                    </Button>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleFavorite(project); }}
                                                    className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white hover:text-red-500 transition-colors pointer-events-auto z-10"
                                                >
                                                    <Heart className="w-4 h-4" />
                                                </button>
                                                <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-md text-foreground hover:bg-background z-10">
                                                    {project.category}
                                                </Badge>
                                            </div>

                                            <CardContent className="p-4 flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Avatar className="w-6 h-6 border">
                                                        <AvatarImage src={project.freelancer.avatar} />
                                                        <AvatarFallback>FR</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-medium text-muted-foreground truncate">
                                                        {project.freelancer.name}
                                                    </span>
                                                    <Badge variant="outline" className="ml-auto text-[10px] h-5">
                                                        {project.freelancer.level}
                                                    </Badge>
                                                </div>

                                                <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleViewDetails(project)}>
                                                    {project.title}
                                                </h3>

                                                <div className="flex items-center gap-1 mb-4">
                                                    <Star className={`w-4 h-4 text-yellow-500 ${Number(project.rating) > 0 ? 'fill-yellow-500' : ''}`} />
                                                    <span className="font-bold text-sm">{Number(project.rating) > 0 ? project.rating : "Novo"}</span>
                                                    <span className="text-muted-foreground text-xs">({project.reviews})</span>
                                                    <span className="text-muted-foreground text-[10px] ml-auto">{project.projectsCount}+ projetos</span>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5">
                                                    {project.tags.slice(0, 3).map((tag: string) => (
                                                        <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </CardContent>

                                            <CardFooter className="p-4 pt-0 mt-auto border-t border-border/50 bg-muted/20 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">A partir de</span>
                                                    <span className="text-lg font-extrabold text-foreground">R$ {project.price.toLocaleString('pt-BR')}</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-primary font-semibold hover:text-primary-light hover:bg-primary/10"
                                                    onClick={() => handleContratar(project)}
                                                >
                                                    Contratar <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-bold">Nenhum serviço encontrado</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                            Tente ajustar seus filtros para encontrar o que precisa.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ProjectDetailsModal
                project={selectedProject}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContratar={handleContratar}
                onMessage={handleMessage}
                loading={checkoutLoading}
            />

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                actionText={authActionText}
            />

            <Dialog open={mpModalOpen} onOpenChange={setMpModalOpen}>
                <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                            Finalizar Contratação
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground/80">
                            Escolha a forma de pagamento abaixo (Crédito, Débito ou Pix). O pagamento é protegido.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 w-full">
                        {checkoutPreferenceId ? (
                            <Wallet
                                initialization={{ preferenceId: checkoutPreferenceId }}
                                customization={{ texts: { valueProp: 'smart_option' } }}
                            />
                        ) : (
                            <div className="flex items-center justify-center p-6">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
