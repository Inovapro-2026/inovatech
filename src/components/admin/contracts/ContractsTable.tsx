
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, AlertTriangle, FileText, CheckCircle, Clock, XCircle, Flag } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ContractsTableProps {
  filters: any;
}

interface Contract {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  projects?: { title: string; cover_image_url: string; category: string };
  client?: { full_name: string; email: string; avatar_url: string };
  freelancer?: { full_name: string; avatar_url: string; rating: number };
}

export function ContractsTable({ filters }: ContractsTableProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchContracts() {
      setLoading(true);
      try {
        let query = supabase
          .from('contracts')
          .select(`
            *,
            projects(title, cover_image_url, category),
            client:client_id(full_name, email, avatar_url),
            freelancer:freelancer_id(full_name, avatar_url)
          `);

        if (filters.search) {
           // This search is limited due to join complexity, but let's try searching project title
           // Supabase doesn't support complex cross-table OR search easily in one go without raw SQL or embedding filter
           // We'll search project title if possible via embedding filter
           // Or just filter client name if possible
           // For simplicity, let's assume search filters project title
           // query = query.filter('projects.title', 'ilike', `%${filters.search}%`); 
           // Embedding filters:
           // query = query.ilike('projects.title', `%${filters.search}%`); // This syntax depends on library version
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.minAmount) {
          query = query.gte('amount', filters.minAmount);
        }

        if (filters.maxAmount) {
          query = query.lte('amount', filters.maxAmount);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        
        // Normalize data structure if needed
        const formattedData = (data || []).map((c: any) => ({
            ...c,
            projects: Array.isArray(c.projects) ? c.projects[0] : c.projects,
            client: Array.isArray(c.client) ? c.client[0] : c.client,
            freelancer: Array.isArray(c.freelancer) ? c.freelancer[0] : c.freelancer
        }));

        setContracts(formattedData);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar contratos",
          description: "Não foi possível carregar a lista de contratos.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchContracts();
  }, [filters, toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none flex w-fit gap-1 items-center"><CheckCircle size={12} /> Concluído</Badge>;
      case 'delivered':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none shadow-none flex w-fit gap-1 items-center"><CheckCircle size={12} /> Entregue</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none flex w-fit gap-1 items-center"><Clock size={12} /> Em Andamento</Badge>;
      case 'pending_acceptance':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none shadow-none flex w-fit gap-1 items-center"><Clock size={12} /> Pendente</Badge>;
      case 'cancelled_refunded':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none flex w-fit gap-1 items-center"><XCircle size={12} /> Cancelado</Badge>;
      case 'dispute':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none shadow-none flex w-fit gap-1 items-center"><Flag size={12} /> Disputa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Projeto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Freelancer</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {contracts.map((contract) => (
            <TableRow key={contract.id} className="hover:bg-slate-50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 bg-slate-100 rounded overflow-hidden shrink-0">
                    {contract.projects?.cover_image_url ? (
                        <img src={contract.projects.cover_image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-400 text-xs">IMG</div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-slate-900 line-clamp-1 max-w-[150px]">{contract.projects?.title || 'Sem título'}</span>
                    <span className="text-xs text-slate-500">{contract.projects?.category || 'Geral'}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={contract.client?.avatar_url || ''} />
                        <AvatarFallback className="text-[10px]">{contract.client?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-700">{contract.client?.full_name}</span>
                </div>
              </TableCell>
              <TableCell>
                 <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={contract.freelancer?.avatar_url || ''} />
                        <AvatarFallback className="text-[10px]">{contract.freelancer?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-700">{contract.freelancer?.full_name}</span>
                </div>
              </TableCell>
              <TableCell className="font-bold text-slate-900">
                {formatCurrency(contract.amount)}
              </TableCell>
              <TableCell>
                {getStatusBadge(contract.status)}
              </TableCell>
              <TableCell className="text-slate-500 text-xs">
                {format(new Date(contract.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Ver Detalhes">
                    <Eye size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50" title="Intervir">
                    <AlertTriangle size={16} />
                  </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-green-600 hover:bg-green-50" title="Ver Pagamento">
                    <FileText size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {contracts.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                Nenhum contrato encontrado com os filtros selecionados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
