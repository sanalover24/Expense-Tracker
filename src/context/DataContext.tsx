import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { Session, User } from '@supabase/supabase-js';

export interface Transaction {
  id?: number;
  date: string;
  description: string;
  amount: number;
  category_id: number;
  user_id?: string;
}

export interface Category {
  id?: number;
  name: string;
  user_id?: string;
}

interface DataContextType {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  user: User | null;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAndListen = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        subscription?.unsubscribe();
      };
    };

    initializeAndListen();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        setTransactions([]);
        setCategories([]);
        return;
      }

      console.log("User found, attempting to fetch data...");
      setLoading(true);

      const [transactionsResponse, categoriesResponse] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('categories').select('*').eq('user_id', user.id)
      ]);

      const { data: transactionsData, error: transactionsError } = transactionsResponse;
      const { data: categoriesData, error: categoriesError } = categoriesResponse;

      if (transactionsError) {
        console.error('CRITICAL: DATABASE READ ERROR (Transactions):', transactionsError);
      } else {
        console.log("Successfully fetched transactions:", transactionsData);
        setTransactions(transactionsData || []);
      }

      if (categoriesError) {
        console.error('CRITICAL: DATABASE READ ERROR (Categories):', categoriesError);
      } else {
        console.log("Successfully fetched categories:", categoriesData);
        setCategories(categoriesData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) throw new Error("User is not logged in.");

    const newTransaction = { ...transaction, user_id: user.id };
    console.log("Attempting to insert transaction:", newTransaction);

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTransaction])
      .select();

    if (error) {
      console.error('CRITICAL: DATABASE INSERT ERROR (Transaction):', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log("Successfully inserted transaction:", data);
    if (data) {
      setTransactions(current => [...current, ...data]);
    }
  };
  
  const addCategory = async (category: Omit<Category, 'id' | 'user_id'>) => {
    if (!user) throw new Error("User is not logged in.");

    const newCategory = { ...category, user_id: user.id };

    const { data, error } = await supabase
      .from('categories')
      .insert([newCategory])
      .select();

    if (error) {
      console.error('CRITICAL: DATABASE INSERT ERROR (Category):', error);
      throw new Error(error.message);
    }
    
    if (data) {
      setCategories(current => [...current, ...data]);
    }
  };

  const value = { transactions, categories, loading, user, addTransaction, addCategory };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};