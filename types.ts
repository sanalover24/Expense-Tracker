
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO 8601 format (e.g., "2023-10-27T10:00:00.000Z")
  note: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}