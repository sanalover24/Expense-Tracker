import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Category, User } from '../types';
import { dummyUser, dummyCategories, dummyTransactions } from '../data';

type DataContextType = {
  user: User;
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (newTransaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (updated: Transaction) => void;
  addCategory: (newCategory: Omit<Category, 'id'>) => boolean;
  deleteCategory: (id: string) => void;
  updateCategory: (updated: Category) => void;
  resetToDefaults: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User>(dummyUser);

  // Load initial state from localStorage or use dummy data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : dummyTransactions;
    } catch {
      return dummyTransactions;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('categories');
      return saved ? JSON.parse(saved) : dummyCategories;
    } catch {
      return dummyCategories;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transactionWithId: Transaction = {
      ...newTransaction,
      id: new Date().getTime().toString() + Math.random().toString(36).substring(2, 9), // simple unique id
    };
    setTransactions(prev => [transactionWithId, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const addCategory = (newCategory: Omit<Category, 'id'>): boolean => {
    if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase() && c.type === newCategory.type)) {
      return false;
    }
    const categoryWithId: Category = {
      ...newCategory,
      id: new Date().getTime().toString() + Math.random().toString(36).substring(2, 9),
    };
    setCategories(prev => [...prev, categoryWithId]);
    return true;
  };

  const deleteCategory = (id: string) => {
    const categoryToDelete = categories.find(c => c.id === id);
    if (!categoryToDelete) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    // Also delete transactions with this category
    setTransactions(prev => prev.filter(t => t.category !== categoryToDelete.name));
  };

  const updateCategory = (updated: Category) => {
    const oldCategory = categories.find(c => c.id === updated.id);
    if (!oldCategory) return;

    setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    
    // If category name changed, update transactions
    if (oldCategory.name !== updated.name) {
        setTransactions(prev => prev.map(t => t.category === oldCategory.name ? { ...t, category: updated.name } : t));
    }
  };
  
  const resetToDefaults = () => {
    setTransactions(dummyTransactions);
    setCategories(dummyCategories);
  };


  return (
    <DataContext.Provider
      value={{
        user,
        transactions,
        categories,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addCategory,
        deleteCategory,
        updateCategory,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};