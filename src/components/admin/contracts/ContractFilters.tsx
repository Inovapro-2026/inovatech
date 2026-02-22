
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface ContractFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function ContractFilters({ onFilterChange }: ContractFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    paymentMethod: 'all',
  });

  const handleChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por projeto, cliente..." 
            className="pl-10" 
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        {/* Status */}
        <Select value={filters.status} onValueChange={(val) => handleChange('status', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Status do Contrato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending_acceptance">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled_refunded">Cancelado</SelectItem>
            <SelectItem value="dispute">Disputa</SelectItem>
          </SelectContent>
        </Select>

        {/* Amount Range */}
        <div className="flex gap-2 items-center">
            <Input 
                placeholder="Min R$" 
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleChange('minAmount', e.target.value)}
            />
            <span className="text-slate-400">-</span>
            <Input 
                placeholder="Max R$" 
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleChange('maxAmount', e.target.value)}
            />
        </div>
        
         {/* Payment Method */}
         <Select value={filters.paymentMethod} onValueChange={(val) => handleChange('paymentMethod', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Forma de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Formas</SelectItem>
            <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
