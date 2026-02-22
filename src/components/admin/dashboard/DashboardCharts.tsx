
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const revenueData = [
  { month: 'Jan', revenue: 4000, gmv: 24000 },
  { month: 'Fev', revenue: 3000, gmv: 13980 },
  { month: 'Mar', revenue: 2000, gmv: 9800 },
  { month: 'Abr', revenue: 2780, gmv: 39080 },
  { month: 'Mai', revenue: 1890, gmv: 4800 },
  { month: 'Jun', revenue: 2390, gmv: 3800 },
  { month: 'Jul', revenue: 3490, gmv: 4300 },
  { month: 'Ago', revenue: 4000, gmv: 24000 },
  { month: 'Set', revenue: 5000, gmv: 30000 },
  { month: 'Out', revenue: 6000, gmv: 36000 },
  { month: 'Nov', revenue: 7000, gmv: 42000 },
  { month: 'Dez', revenue: 8000, gmv: 48000 },
];

const categoryData = [
  { name: 'Design', value: 400 },
  { name: 'Dev', value: 300 },
  { name: 'Marketing', value: 300 },
  { name: 'Redação', value: 200 },
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const funnelData = [
  { name: 'Visitantes', value: 5234 },
  { name: 'Cadastros', value: 847 },
  { name: 'Perfis Completos', value: 571 },
  { name: 'Projetos', value: 342 },
  { name: 'Contratos', value: 67 },
];

const activityData = [
  { hour: '00', value: 12 }, { hour: '02', value: 5 }, { hour: '04', value: 2 },
  { hour: '06', value: 10 }, { hour: '08', value: 45 }, { hour: '10', value: 89 },
  { hour: '12', value: 76 }, { hour: '14', value: 120 }, { hour: '16', value: 105 },
  { hour: '18', value: 90 }, { hour: '20', value: 65 }, { hour: '22', value: 34 },
];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Revenue Evolution */}
      <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Evolução de Receitas e GMV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#4f46e5" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Receita Plataforma" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="gmv" name="GMV Total" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Category Distribution */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Categorias Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Funnel */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#64748b', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
       {/* Chart 4: Activity */}
       <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Atividade por Hora (Média)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
