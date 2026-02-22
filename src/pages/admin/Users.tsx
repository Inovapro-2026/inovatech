
import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Download, UserPlus, Mail } from 'lucide-react';
import { UserFilters } from '@/components/admin/users/UserFilters';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AdminUsers() {
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'created_at_desc'
  });
  const { toast } = useToast();

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleExportCSV = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .csv();
      
      if (error) throw error;
      
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString()}.csv`;
      a.click();
      
      toast({
        title: "Exportação Concluída",
        description: "O arquivo CSV foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo CSV.",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gerenciamento de Usuários 👥</h1>
            <p className="text-slate-500">Administre todos os usuários da plataforma</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
              <Mail className="mr-2 h-4 w-4" /> Enviar Email
            </Button>
             <Button variant="outline" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar Admin
            </Button>
          </div>
        </div>

        <UserFilters onFilterChange={handleFilterChange} />
        
        <UsersTable filters={filters} />
      </div>
    </AdminLayout>
  );
}
