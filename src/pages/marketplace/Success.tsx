
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MarketplaceSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        if (paymentId) {
            toast.success("Pagamento confirmado com sucesso!");
        }
    }, [paymentId]);

    return (
        <DashboardLayout type="client">
            <div className="max-w-2xl mx-auto pt-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8"
                >
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle2 className="w-16 h-16 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-foreground">Pagamento Confirmado!</h1>
                        <p className="text-muted-foreground text-lg">
                            O seu projeto foi iniciado com sucesso. O freelancer foi notificado e você já pode começar a conversar sobre os próximos passos.
                        </p>
                    </div>

                    <Card className="border-primary/20 bg-primary/5 p-6">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-lg">O que acontece agora?</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4 text-left">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">1</div>
                                <p className="text-sm">O freelancer aceita o contrato e inicia o trabalho.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">2</div>
                                <p className="text-sm">Você acompanha o progresso e troca arquivos pelo dashboard.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">3</div>
                                <p className="text-sm">O pagamento fica seguro na INOVAPRO até você aprovar a entrega final.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            className="bg-primary hover:bg-primary-light h-12 px-8 font-bold text-lg"
                            onClick={() => navigate('/marketplace/painel')}
                        >
                            Ir para Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 px-8 font-bold text-lg"
                            onClick={() => navigate('/marketplace/mensagens')}
                        >
                            Ver Mensagens <MessageSquare className="w-5 h-5 ml-2" />
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        ID do Pagamento: {paymentId}
                    </p>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
