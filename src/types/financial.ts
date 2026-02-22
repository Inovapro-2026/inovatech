export type TransactionType = 'earnings' | 'withdrawal' | 'refund' | 'bonus';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'processing';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';

export interface Transaction {
    id: string;
    user_id: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    description: string;
    contract_id?: string;
    created_at: string;
    processed_at?: string;
    contract?: {
        projects?: {
            title: string;
        }
    };
}

export interface WithdrawalRequest {
    id: string;
    user_id: string;
    amount: number;
    status: WithdrawalStatus;
    bank_account_data: any;
    requested_at: string;
    processed_at?: string;
    admin_notes?: string;
}

export interface PaymentMethod {
    id: string;
    user_id: string;
    type: 'pix' | 'bank';
    label: string;
    data: any;
    is_default: boolean;
    created_at: string;
}

export interface FinancialStats {
    available: number;
    monthly: number;
    total: number;
    pending: number;
}
