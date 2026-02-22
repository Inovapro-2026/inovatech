import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, FinancialStats, WithdrawalRequest, PaymentMethod } from '@/types/financial';

export function useFinancialData() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<FinancialStats>({
        available: 0,
        monthly: 0,
        total: 0,
        pending: 0,
    });

    const fetchFinancialData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Fetch Transactions
            const { data: transData, error: transError } = await supabase
                .from('transactions')
                .select('*, contract:contracts(projects(title))')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (transError) throw transError;
            setTransactions(transData || []);

            // Calculate Stats
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            let available = 0;
            let monthly = 0;
            let total = 0;
            let pending = 0;

            transData?.forEach((t) => {
                if (t.status === 'completed') {
                    if (t.type === 'earnings' || t.type === 'bonus') {
                        total += t.amount;
                        available += t.amount;
                        if (new Date(t.created_at) >= firstDayOfMonth) {
                            monthly += t.amount;
                        }
                    } else if (t.type === 'withdrawal') {
                        available -= t.amount;
                    } else if (t.type === 'refund') {
                        available -= t.amount;
                    }
                } else if (t.status === 'pending' || t.status === 'processing') {
                    if (t.type === 'earnings') {
                        pending += t.amount;
                    }
                }
            });

            setStats({ available, monthly, total, pending });
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancialData();

        // Realtime subscription
        const channel = supabase
            .channel('financial_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user?.id}` }, () => {
                fetchFinancialData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    return { loading, transactions, stats, refresh: fetchFinancialData };
}

export function useWithdrawals() {
    const { user } = useAuth();
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWithdrawals = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('withdrawal_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('requested_at', { ascending: false });

            if (error) throw error;
            setWithdrawals(data || []);
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    const requestWithdrawal = async (amount: number, bankData: any) => {
        if (!user) return { error: 'User not authenticated' };
        try {
            const { data, error } = await supabase
                .from('withdrawal_requests')
                .insert([{
                    user_id: user.id,
                    amount,
                    bank_account_data: bankData,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) throw error;

            // Also create a pending transaction of type withdrawal
            await supabase.from('transactions').insert([{
                user_id: user.id,
                type: 'withdrawal',
                amount,
                status: 'pending',
                description: `Saque solicitado para ${bankData.label || 'conta bancária'}`
            }]);

            fetchWithdrawals();
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [user?.id]);

    return { withdrawals, loading, requestWithdrawal, refresh: fetchWithdrawals };
}

export function useBankAccounts() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAccounts = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            if (error) throw error;
            setAccounts(data || []);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const addAccount = async (accountData: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) return { error: 'User not authenticated' };
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .insert([{ ...accountData, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            fetchAccounts();
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [user?.id]);

    return { accounts, loading, addAccount, refresh: fetchAccounts };
}
