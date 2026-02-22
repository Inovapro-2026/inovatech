import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
    { name: 'Jan', earnings: 4000 },
    { name: 'Fev', earnings: 3000 },
    { name: 'Mar', earnings: 2000 },
    { name: 'Abr', earnings: 2780 },
    { name: 'Mai', earnings: 1890 },
    { name: 'Jun', earnings: 2390 },
    { name: 'Jul', earnings: 3490 },
];

export function RevenueChart() {
    return (
        <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black text-slate-900">Evolução de Ganhos</CardTitle>
                <CardDescription>Visualização dos seus rendimentos nos últimos meses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            tickFormatter={(value) => `R$ ${value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Ganhos']}
                        />
                        <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="#0d9488"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEarnings)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
