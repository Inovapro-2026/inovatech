
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
import { Eye, Edit, Ban, Mail, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: string;
}

interface UsersTableProps {
  filters: UserFilters;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string;
  created_at: string;
  is_onboarding_complete: boolean;
  projects?: { count: number }[];
  contracts_client?: { count: number }[];
  contracts_freelancer?: { count: number }[];
  wallets?: { balance: number }[];
}

export function UsersTable({ filters }: UsersTableProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        let query = supabase
          .from('profiles')
          .select(`
            *,
            projects:projects(count),
            contracts_client:contracts!client_id(count),
            contracts_freelancer:contracts!freelancer_id(count),
            wallets:wallets(balance)
          `);

        // Apply filters
        if (filters.search) {
          query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        if (filters.role && filters.role !== 'all') {
          query = query.eq('role', filters.role);
        }

        if (filters.status && filters.status !== 'all') {
           if (filters.status === 'active') {
             query = query.eq('is_onboarding_complete', true); // Example mapping
           } else if (filters.status === 'pending') {
             query = query.eq('is_onboarding_complete', false);
           }
           // 'banned' status handling depends on schema (not yet implemented in profiles status enum, using example logic)
        }

        // Sorting
        switch (filters.sortBy) {
          case 'created_at_desc':
            query = query.order('created_at', { ascending: false });
            break;
          case 'created_at_asc':
            query = query.order('created_at', { ascending: true });
            break;
          case 'full_name_asc':
            query = query.order('full_name', { ascending: true });
            break;
          case 'full_name_desc':
            query = query.order('full_name', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar usuários",
          description: "Não foi possível carregar a lista de usuários.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [filters, toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
            <TableHead>Usuário</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Projetos/Contratos</TableHead>
            <TableHead>Carteira</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {users.map((user) => {
             const projectsCount = user.projects?.[0]?.count || 0;
             const contractsCount = (user.contracts_client?.[0]?.count || 0) + (user.contracts_freelancer?.[0]?.count || 0);
             const balance = user.wallets?.[0]?.balance || 0;

             return (
              <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                      {user.full_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-slate-900">{user.full_name || 'Sem nome'}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'client' ? 'secondary' : user.role === 'admin' ? 'destructive' : 'default'} className="capitalize font-normal">
                    {user.role === 'client' ? 'Cliente' : user.role === 'freelancer' ? 'Freelancer' : 'Admin'}
                  </Badge>
                </TableCell>
                <TableCell>
                   <Badge variant="outline" className={`border-none ${user.is_onboarding_complete ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {user.is_onboarding_complete ? 'Ativo' : 'Pendente'}
                    </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: ptBR }) : '-'}
                </TableCell>
                <TableCell className="text-slate-600 text-sm">
                  <div className="flex flex-col">
                    <span>{projectsCount} Projetos</span>
                    <span className="text-xs text-slate-400">{contractsCount} Contratos</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {formatCurrency(balance)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Ver Perfil">
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Editar">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50" title="Enviar Email">
                      <Mail size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" title="Banir">
                      <Ban size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                Nenhum usuário encontrado com os filtros selecionados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
