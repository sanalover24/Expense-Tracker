import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Trash2Icon, EditIcon, XIcon, ArrowUpDownIcon, FolderIcon, CalendarIcon, FileTextIcon, ArrowRightLeftIcon, ClockIcon, SearchIcon } from '../components/icons';
import { Transaction, TransactionType, Category } from '../types';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import PremierDatePicker, { DateFilter } from '../components/ui/PremierCalendar';
import { toYYYYMMDD, getISODateParts, isSameDay } from '../utils/date';

const EditTransactionForm: React.FC<{ transaction: Transaction; onSubmit: (data: Transaction) => void; categories: Category[]; onClose: () => void; }> = ({ transaction, onSubmit, categories, onClose }) => {
  
  const { date: isoDate, ...restOfTransaction } = transaction;
  const { date: initialDate } = getISODateParts(isoDate);

  const [formData, setFormData] = useState({
    ...restOfTransaction,
    date: initialDate,
  });
  
  const filteredCategories = categories.filter(c => c.type === formData.type);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumberInput = name === 'amount';

    setFormData(prev => ({ 
      ...prev, 
      [name]: isNumberInput ? parseFloat(value) || 0 : value 
    }));
  };

  const handleTypeChange = (newType: TransactionType) => {
    setFormData(prev => ({ ...prev, type: newType, category: '' })); // Reset category on type change
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.date) {
        alert('Please select a category and provide a date.');
        return;
    }
    
    // Preserve original time, but update the date from the form.
    const originalDate = new Date(transaction.date);
    const [year, month, day] = formData.date.split('-').map(Number);
    originalDate.setFullYear(year, month - 1, day); // month is 0-indexed
    const fullIsoDate = originalDate.toISOString();

    const transactionToSubmit: Transaction = {
        id: formData.id,
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        note: formData.note,
        date: fullIsoDate,
    };
    onSubmit(transactionToSubmit);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
        <div className="mt-1 flex rounded-md">
          <button type="button" onClick={() => handleTypeChange('income')} className={`px-4 py-2 rounded-l-md w-1/2 border border-slate-300 dark:border-slate-700 ${formData.type === 'income' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>Income</button>
          <button type="button" onClick={() => handleTypeChange('expense')} className={`px-4 py-2 rounded-r-md w-1/2 border border-slate-300 dark:border-slate-700 -ml-px ${formData.type === 'expense' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>Expense</button>
        </div>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
        <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 sm:text-sm rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" required>
          <option value="" disabled>Select a category</option>
          {filteredCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
        <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="0.00" required />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500" required />
      </div>
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Note</label>
        <textarea name="note" rows={3} value={formData.note} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="Optional details..." />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};


const TransactionsPage: React.FC = () => {
    const { transactions, categories, deleteTransaction, updateTransaction } = useData();
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [dateFilter, setDateFilter] = useState<DateFilter>({
        mode: 'month',
        value: new Date().toISOString().slice(0, 7), // YYYY-MM
    });

    // Modals state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);


    const filteredTransactions = useMemo(() => {
        const { mode, value } = dateFilter;
        
        const results = transactions
            .filter(t => {
                if (!value) return true;

                if (mode === 'month') {
                    const transactionDatePart = toYYYYMMDD(new Date(t.date));
                    return transactionDatePart.startsWith(value as string);
                }
                if (mode === 'day') {
                    const transactionDatePart = toYYYYMMDD(new Date(t.date));
                    const selectedDate = toYYYYMMDD(value as Date);
                    return transactionDatePart === selectedDate;
                }
                if (mode === 'range') {
                    const { start, end } = value as { start: Date | null; end: Date | null };
                    if (start && end) {
                        const transactionTimestamp = new Date(t.date).getTime();
                        const startTimestamp = new Date(start).setHours(0, 0, 0, 0);
                        const endTimestamp = new Date(end).setHours(23, 59, 59, 999);
                        return transactionTimestamp >= startTimestamp && transactionTimestamp <= endTimestamp;
                    }
                    return true;
                }
                return true;
            })
            .filter(t => filterType === 'all' || t.type === filterType)
            .filter(t => filterCategory === 'all' || t.category === filterCategory)
            .filter(t => t.note.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()));

        // Sort the results
        results.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'date-desc':
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });
        
        return results;

    }, [transactions, searchTerm, filterType, filterCategory, dateFilter, sortBy]);
    
    const monthlySummary = useMemo(() => {
        const income = filteredTransactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum, 0);
        const expense = filteredTransactions.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
        return { income, expense, balance: income - expense };
    }, [filteredTransactions]);
    
    const getSummaryTitle = () => {
        const { mode, value } = dateFilter;
        if (!value) return "Summary";
        
        try {
            if (mode === 'month') {
                // Use a safe date like the 2nd to prevent timezone-related month shifts on the 1st
                return `Summary for ${new Date((value as string) + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}`;
            }
            if (mode === 'day') {
                 return `Summary for ${(value as Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})}`;
            }
            if (mode === 'range') {
                const { start, end } = value as { start: Date | null, end: Date | null };
                if (start && end) {
                    if (isSameDay(start, end)) {
                        return `Summary for ${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})}`;
                    }
                    const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                    const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    return `Summary from ${startStr} to ${endStr}`;
                }
            }
        } catch(e) {
            return "Summary"; // Fallback for invalid dates
        }
        return 'Summary';
    };


    // Options for custom selects
    const typeOptions: SelectOption[] = [
        { value: 'all', label: 'All Types' },
        { value: 'income', label: 'Income' },
        { value: 'expense', label: 'Expense' },
    ];

    const categoryOptions: SelectOption[] = useMemo(() => [
        { value: 'all', label: 'All Categories' },
        ...categories
            .filter(c => filterType === 'all' || c.type === filterType)
            .map(c => ({ value: c.name, label: c.name }))
    ], [categories, filterType]);

    const sortOptions: SelectOption[] = [
        { value: 'date-desc', label: 'Date: Newest' },
        { value: 'date-asc', label: 'Date: Oldest' },
        { value: 'amount-desc', label: 'Amount: High to Low' },
        { value: 'amount-asc', label: 'Amount: Low to High' },
    ];

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleUpdateTransaction = (updatedTransaction: Transaction) => {
        updateTransaction(updatedTransaction);
        setIsEditModalOpen(false);
        setEditingTransaction(null);
    };
    
    const handleConfirmDelete = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
        }
    };
    
    const handleViewDetails = (transaction: Transaction) => {
        setViewingTransaction(transaction);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="animate-fade-in-up relative z-30">
                <Card>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <PremierDatePicker
                                value={dateFilter}
                                onChange={setDateFilter}
                            />
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search in notes or category..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        aria-label="Clear search"
                                    >
                                        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <CustomSelect
                                value={filterType}
                                onChange={(value) => { setFilterType(value); setFilterCategory('all'); }}
                                options={typeOptions}
                            />
                            <CustomSelect
                                value={filterCategory}
                                onChange={setFilterCategory}
                                options={categoryOptions}
                                placeholder="All Categories"
                            />
                            <CustomSelect
                                icon={<ArrowUpDownIcon className="w-5 h-5" />}
                                value={sortBy}
                                onChange={setSortBy}
                                options={sortOptions}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <Card>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                       {getSummaryTitle()}
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Income</p>
                            <p className="text-xl font-bold text-emerald-600">Rs. {monthlySummary.income.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Expense</p>
                            <p className="text-xl font-bold text-rose-600">Rs. {monthlySummary.expense.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Balance</p>
                            <p className={`text-xl font-bold ${monthlySummary.balance >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600'}`}>Rs. {monthlySummary.balance.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t, index) => (
                        <div key={t.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up">
                            <Card className={`!p-0 overflow-hidden border-l-4 ${t.type === 'income' ? 'border-emerald-500' : 'border-rose-500'}`}>
                                <div className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => handleViewDetails(t)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{t.category}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                        </div>
                                        <p className={`text-xl font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                                            {t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    {t.note && (
                                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 italic bg-slate-100 dark:bg-slate-800/50 p-2 rounded-md line-clamp-2">
                                           {t.note}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-950/50 px-4 py-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800/50">
                                     <button onClick={() => handleEdit(t)} title="Edit Transaction" className="p-1 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><EditIcon className="w-5 h-5"/></button>
                                     <button onClick={() => setTransactionToDelete(t)} title="Delete Transaction" className="p-1 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                                         <Trash2Icon className="w-5 h-5"/>
                                     </button>
                                </div>
                            </Card>
                        </div>
                    ))
                ) : (
                    <Card className="text-center py-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                         <p className="text-slate-500 dark:text-slate-400">No transactions found for the selected filters.</p>
                    </Card>
                )}
            </div>

            {isDetailsModalOpen && viewingTransaction && (
                <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={handleCloseDetailsModal}>
                    <div style={{animationDuration: '300ms'}} className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Transaction Details</h2>
                            <button onClick={handleCloseDetailsModal} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-6">
                            <div>
                                <p className={`text-4xl font-bold text-center ${viewingTransaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                                    {viewingTransaction.type === 'income' ? '+' : '-'} Rs. {viewingTransaction.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <FolderIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{viewingTransaction.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{new Date(viewingTransaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <ClockIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Time</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{new Date(viewingTransaction.date).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <ArrowRightLeftIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Type</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{viewingTransaction.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <FileTextIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Note</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                                            {viewingTransaction.note || 'No note provided.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                             <div className="flex justify-end pt-4 border-t dark:border-slate-800">
                                <Button variant="secondary" onClick={handleCloseDetailsModal}>Close</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingTransaction && (
                <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
                    <div style={{animationDuration: '300ms'}} className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Transaction</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6">
                            <EditTransactionForm
                                transaction={editingTransaction}
                                onSubmit={handleUpdateTransaction}
                                onClose={() => setIsEditModalOpen(false)}
                                categories={categories}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {transactionToDelete && (
                <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in">
                    <div style={{animationDuration: '300ms'}} className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="p-4 sm:p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50">
                                <Trash2Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-5">Delete Transaction</h3>
                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                <p>Are you sure you want to delete this transaction?</p>
                                <div className="font-semibold text-left mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-md space-y-1">
                                    <p><span className="font-normal">Date:</span> {new Date(transactionToDelete.date).toLocaleDateString()}</p>
                                    <p><span className="font-normal">Category:</span> {transactionToDelete.category}</p>
                                    <p><span className="font-normal">Amount:</span> <span className={transactionToDelete.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>Rs. {transactionToDelete.amount.toLocaleString('en-IN')}</span></p>
                                    {transactionToDelete.note && <p><span className="font-normal">Note:</span> <span className="italic">"{transactionToDelete.note}"</span></p>}
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 flex justify-center gap-3">
                                <Button variant="secondary" onClick={() => setTransactionToDelete(null)}>
                                    Cancel
                                </Button>
                                <Button variant="danger" onClick={handleConfirmDelete}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;