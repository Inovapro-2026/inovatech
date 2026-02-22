
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { ProjectFilters } from '@/components/admin/projects/ProjectFilters';
import { ProjectCard } from '@/components/admin/projects/ProjectCard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  status: string;
  cover_image_url: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    minPrice: '',
    maxPrice: '',
  });
  const { toast } = useToast();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles:freelancer_id(full_name, avatar_url)
        `);

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface if necessary (Supabase returns arrays for joins sometimes, but for FK it should be object)
      // If it returns array, we take the first element.
      const formattedData = (data || []).map((p: any) => ({
        ...p,
        profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
      }));

      setProjects(formattedData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar projetos",
        description: "Não foi possível carregar a lista de projetos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleView = (project: Project) => {
    // Open modal (to be implemented)
    console.log('View project', project);
    toast({ title: "Visualizar Projeto", description: `Abrindo detalhes de ${project.title}` });
  };

  const handleEdit = (project: Project) => {
    // Open edit (to be implemented)
    console.log('Edit project', project);
     toast({ title: "Editar Projeto", description: `Editando ${project.title}` });
  };

  const handleDelete = async (project: Project) => {
    // Implement delete logic
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
        try {
            const { error } = await supabase.from('projects').delete().eq('id', project.id);
            if (error) throw error;
            toast({ title: "Projeto excluído", description: "O projeto foi removido com sucesso." });
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            toast({ variant: "destructive", title: "Erro ao excluir", description: "Não foi possível excluir o projeto." });
        }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gerenciamento de Projetos 📦</h1>
            <p className="text-slate-500">Modere e acompanhe todos os projetos publicados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
              <Download className="mr-2 h-4 w-4" /> Exportar Relatório
            </Button>
            <Button variant="outline" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
               <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
            </Button>
          </div>
        </div>

        <ProjectFilters onFilterChange={handleFilterChange} />
        
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 bg-slate-200 rounded-xl animate-pulse"></div>
              ))}
           </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                    <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        )}
        
        {!loading && projects.length === 0 && (
            <div className="text-center py-20 bg-white rounded-lg border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-lg">Nenhum projeto encontrado com os filtros selecionados.</p>
                <Button variant="link" onClick={() => setFilters({ ...filters, search: '', status: 'all', category: 'all' })}>
                    Limpar Filtros
                </Button>
            </div>
        )}
      </div>
    </AdminLayout>
  );
}
