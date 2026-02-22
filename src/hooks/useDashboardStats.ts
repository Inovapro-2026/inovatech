
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  gmv: number;
  revenue: number;
  ticket: number;
  users: {
    total: number;
    freelancers: number;
    clients: number;
    newLast30Days: number;
  };
  projects: {
    total: number;
    published: number;
    drafts: number;
  };
  contracts: {
    active: number;
    completed: number;
    total: number;
  };
  disputes: {
    active: number;
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    gmv: 0,
    revenue: 0,
    ticket: 0,
    users: { total: 0, freelancers: 0, clients: 0, newLast30Days: 0 },
    projects: { total: 0, published: 0, drafts: 0 },
    contracts: { active: 0, completed: 0, total: 0 },
    disputes: { active: 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Users
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: freelancers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'freelancer');
      const { count: clients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: newUsers } = await supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Projects
      const { count: totalProjects } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      const { count: publishedProjects } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'published');
      const { count: draftProjects } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'draft');

      // Contracts
      const { count: totalContracts } = await supabase.from('contracts').select('*', { count: 'exact', head: true });
      const { count: activeContracts } = await supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('status', 'in_progress');
      const { count: completedContracts } = await supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('status', 'completed');

      // Disputes
      const { count: activeDisputes } = await supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['pending_info', 'under_review']);

      // Financials (Mocked for now as transactions table might be empty or complex)
      // Ideally: sum amount from transactions where type='payment'
      // const { data: transactions } = await supabase.from('transactions').select('amount, type');
      // Calculate GMV etc.
      
      setStats({
        gmv: 45250.00, // Mocked as per guide for visual consistency initially
        revenue: 6787.50, // Mocked
        ticket: 452.50, // Mocked
        users: {
          total: totalUsers || 0,
          freelancers: freelancers || 0,
          clients: clients || 0,
          newLast30Days: newUsers || 0
        },
        projects: {
          total: totalProjects || 0,
          published: publishedProjects || 0,
          drafts: draftProjects || 0
        },
        contracts: {
          active: activeContracts || 0,
          completed: completedContracts || 0,
          total: totalContracts || 0
        },
        disputes: {
          active: activeDisputes || 0
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refresh: fetchStats };
}
