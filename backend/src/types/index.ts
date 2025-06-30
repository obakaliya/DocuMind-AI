export interface User {
  id: number;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  documents_processed_this_month: number;
  email_verified: boolean;
  email_verification_token?: string;
  email_verification_expires?: string;
  created_at: string;
}

export interface Document {
  id: number;
  user_id: number;
  filename: string;
  file_path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_size: number;
  created_at: Date;
}

export interface Analysis {
  id: number;
  document_id: number;
  summary: string;
  key_terms: KeyTerms;
  risks: Risk[];
  deadlines: Deadline[];
  confidence_score: number;
  created_at: Date;
}

export interface KeyTerms {
  parties: Party[];
  financial_terms: FinancialTerm[];
  obligations: Obligation[];
  termination_conditions: string[];
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AnalysisResult {
  summary: string;
  parties: Party[];
  dates: Deadline[];
  financial_terms: FinancialTerm[];
  obligations: Obligation[];
  risks: Risk[];
  termination_conditions: string[];
} 