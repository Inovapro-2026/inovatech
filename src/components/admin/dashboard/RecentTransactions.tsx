
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  type: string;
  status: string;
  profiles?: {
    full_name: string;
  };
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            profiles:user_id(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none flex w-fit gap-1 items-center"><CheckCircle size={12} /> Concluído</Badge>;
      case 'pending':
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none shadow-none flex w-fit gap-1 items-center"><Clock size={12} /> Processando</Badge>;
      default:
        return <Badge variant="destructive" className="flex w-fit gap-1 items-center"><AlertTriangle size={12} /> {status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-slate-200 col-span-1 lg:col-span-2">
        <CardHeader>
           <CardTitle className="text-lg font-bold text-slate-800">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200 col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-slate-800">Últimas Transações</CardTitle>
        <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => window.location.href='/admin/financeiro'}>
           Ver todas <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-slate-600 text-sm">
                  {format(new Date(t.created_at), "dd/MM HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal capitalize">
                    {t.type === 'platform_fee' ? 'Taxa' : t.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-slate-800">
                  {t.profiles?.full_name || 'Usuário'}
                </TableCell>
                <TableCell className={t.type === 'withdrawal' || t.type === 'refund' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                  {t.type === 'withdrawal' || t.type === 'refund' ? '-' : '+'}{formatCurrency(t.amount)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(t.status)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {transactions.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                     Nenhuma transação recente encontrada.
                   </TableCell>
                 </TableRow>
              )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
