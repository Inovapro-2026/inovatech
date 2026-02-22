
import { motion } from 'framer-motion';
import {
    DollarSign, Briefcase, Star, TrendingUp, Users, Clock,
    ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function FreelasIndex() {
    const { profile } = useAuth();

    const stats = [
        { title: 'Ganhos Totais', value: 'R$ 12.450', change: '+15%', icon: DollarSign, color: 'text-emerald-500' },
        { title: 'Jobs Ativos', value: '3', change: '-1', icon: Briefcase, color: 'text-blue-500' },
        { title: 'Avaliação Média', value: '4.9', change: '+0.1', icon: Star, color: 'text-yellow-500' },
        { title: 'Taxa de Entrega', value: '98%', change: '+2%', icon: TrendingUp, color: 'text-purple-500' },
    ];

    const ongoingJobs = [
        { id: 1, client: "TechCorp Ltd.", project: "Refatoração de API Legacy", deadline: "2 dias", progress: 75, status: "Em Progresso" },
        { id: 2, client: "Studio Design", project: "Identidade Visual Nova", deadline: "5 dias", progress: 30, status: "Revisão" },
    ];

    return (
        <DashboardLayout type="freelancer">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Olá, {profile?.full_name?.split(' ')[0] || 'Freelancer'}! 👋
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Aqui está o resumo da sua atividade hoje.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">Ver Perfil Público</Button>
                        <Button className="bg-primary hover:bg-primary-light text-primary-foreground">
                            Encontrar Novos Jobs
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        <span className={stat.change.startsWith('+') ? "text-emerald-500" : "text-rose-500"}>
                                            {stat.change}
                                        </span>{' '}
                                        em relação ao mês passado
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Ongoing Jobs */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-semibold text-foreground">Projetos em Andamento</h2>
                        <div className="space-y-4">
                            {ongoingJobs.map((job) => (
                                <Card key={job.id} className="card-hover">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base font-bold">{job.project}</CardTitle>
                                                <CardDescription>{job.client}</CardDescription>
                                            </div>
                                            <Badge variant={job.status === "Em Progresso" ? "default" : "secondary"}>
                                                {job.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-4 h-4" /> Prazo: {job.deadline}
                                                </span>
                                                <span className="font-medium">{job.progress}%</span>
                                            </div>
                                            <Progress value={job.progress} className="h-2" />
                                        </div>
                                        <div className="mt-4 flex justify-end gap-2">
                                            <Button variant="ghost" size="sm">Detalhes</Button>
                                            <Button size="sm" className="bg-primary hover:bg-primary-light">
                                                Continuar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Recommendations & Activity */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-foreground">Recomendações da IA</h2>
                        <Card className="bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    Projeto de Alto Valor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-foreground">Desenvolvimento E-commerce VTEX</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Orçamento estimado: R$ 8.000 - R$ 12.000</p>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline">React</Badge>
                                    <Badge variant="outline">VTEX IO</Badge>
                                </div>
                                <Button className="w-full bg-primary hover:bg-primary-light text-primary-foreground">
                                    Candidatar-se com 1 clique
                                </Button>
                            </CardContent>
                        </Card>

                        <h2 className="text-xl font-semibold text-foreground mt-8">Atividade Recente</h2>
                        <div className="space-y-4">
                            {[
                                { text: "Você recebeu uma nova mensagem de Ana", time: "2h atrás", icon: Users },
                                { text: "Pagamento de R$ 350 liberado", time: "5h atrás", icon: DollarSign },
                                { text: "Seu perfil foi visualizado 12 vezes", time: "1d atrás", icon: TrendingUp },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <activity.icon className="w-4 h-4 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground">{activity.text}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
