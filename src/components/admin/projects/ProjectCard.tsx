
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Edit, Trash2, Flag, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">Publicado</Badge>;
      case 'draft':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none shadow-none">Rascunho</Badge>;
      case 'archived':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none shadow-none">Arquivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {project.cover_image_url ? (
          <img 
            src={project.cover_image_url} 
            alt={project.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
            Sem imagem
          </div>
        )}
        <div className="absolute top-3 right-3">
          {getStatusBadge(project.status)}
        </div>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mt-1">
            {project.description || 'Sem descrição.'}
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-auto pt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={project.profiles?.avatar_url || ''} />
            <AvatarFallback className="text-[10px]">
              {project.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-slate-600 truncate max-w-[150px]">
            Por: <span className="font-medium text-slate-900">{project.profiles?.full_name || 'Desconhecido'}</span>
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm mt-1">
          <Badge variant="secondary" className="font-normal text-slate-600 bg-slate-100">
            {project.category || 'Geral'}
          </Badge>
          <span className="font-bold text-slate-900">
            {formatCurrency(project.price)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-100 mt-2">
           <div className="text-center">
             <span className="block text-xs text-slate-400">Visitas</span>
             <span className="block text-sm font-bold text-slate-700">234</span>
           </div>
           <div className="text-center border-l border-slate-100">
             <span className="block text-xs text-slate-400">Consultas</span>
             <span className="block text-sm font-bold text-slate-700">12</span>
           </div>
           <div className="text-center border-l border-slate-100">
             <span className="block text-xs text-slate-400">Rating</span>
             <span className="block text-sm font-bold text-yellow-600">4.9</span>
           </div>
        </div>

        <div className="text-xs text-slate-400 flex justify-between items-center mt-1">
           <span>Pub: {formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: ptBR })}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-4 gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => onView(project)}>
          <Eye size={16} />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-full text-slate-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => onEdit(project)}>
          <Edit size={16} />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-full text-slate-500 hover:text-amber-600 hover:bg-amber-50">
          <Flag size={16} />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-full text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(project)}>
          <Trash2 size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
}
