export interface User {
  id: number;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  documents_processed_this_month: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  subscription_end_date?: string;
  created_at: string;
}

export interface Document {
  id: number;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_size: number;
  confidence_score?: number;
  created_at: string;
}

export interface Party {
  name: string;
  role: string;
  type: 'individual' | 'company' | 'organization';
}

export interface FinancialTerm {
  type: 'payment' | 'penalty' | 'fee' | 'amount';
  amount: number;
  currency: string;
  description: string;
  due_date?: string;
}

export interface Obligation {
  party: string;
  obligation: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Risk {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface Deadline {
  type: string;
  date: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
}

export interface Analysis {
  summary: string;
  parties: Party[];
  dates: Deadline[];
  financial_terms: FinancialTerm[];
  obligations: Obligation[];
  risks: Risk[];
  termination_conditions: string[];
  confidence_score: number;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
} 