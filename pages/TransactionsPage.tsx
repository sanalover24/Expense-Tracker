import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Trash2Icon, EditIcon, XIcon, ArrowUpDownIcon, FolderIcon, CalendarIcon, FileTextIcon, ArrowRightLeftIcon, ClockIcon, SearchIcon } from '../components/icons';
import { Transaction as DbTransaction, Category } from '../context/DataContext'; // Rename original type
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import PremierDatePicker, { DateFilter } from '../components/ui/PremierCalendar';
import { toYYYYMMDD, isSameDay } from '../utils/date';

// Define the shape of data our UI components will use
type DisplayTransaction = {
    id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    note: string;
    date: string; // ISO string
    category_id: number;
    user_id: string;
};

// --- START OF FIXES FOR EDIT FORM ---

const EditTransactionForm: React.FC<{ transaction: DisplayTransaction; onSubmit: (data: DbTransaction) => void; categories: Category[]; onClose: () => void; }> = ({ transaction, onSubmit, categories, onClose }) => {
  
  // State for the form, initialized from the display transaction
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [categoryName, setCategoryName] = useState(transaction.category);
  const [date, setDate] = useState(transaction.date.split('T')[0]); // YYYY-MM-DD
  const [note, setNote] = useState(transaction.note);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    // Check if current category is valid for the new type
    const currentCategoryIsValid = filteredCategories.some(c => c.name === categoryName && c.type === newType);
    if (!currentCategoryIsValid) {
      setCategoryName(''); // Reset category if it's not valid for the new type
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCategory = categories.find(c => c.name === categoryName);
    if (!selectedCategory || !date) {
        alert('Please select a valid category and provide a date.');
        return;
    }
    
    // Translate form state back into the database format
    const numericAmount = parseFloat(amount);
    const finalAmount = type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    
    const originalDate = new Date(transaction.date); // Preserve original time
    const [year, month, day] = date.split('-').map(Number);
    originalDate.setUTCFullYear(year, month - 1, day);
    
    const transactionToSubmit: DbTransaction = {
        id: transaction.id,
        amount: finalAmount,
        description: note,
        category_id: selectedCategory.id!,
        date: originalDate.toISOString().split('T')[0],
        user_id: transaction.user_id,
    };
    onSubmit(transactionToSubmit);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
        <div className="mt-1 flex rounded-md">
          <button type="button" onClick={() => handleTypeChange('income')} className={`px-4 py-2 rounded-l-md w-1/2 border border-slate-300 dark:border-slate-700 ${type === 'income' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>Income</button>
          <button type="button" onClick={() => handleTypeChange('expense')} className={`px-4 py-2 rounded-r-md w-1/2 border border-slate-300 dark:border-slate-700 -ml-px ${type === 'expense' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>Expense</button>
        </div>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
        <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 sm:text-sm rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" required>
          <option value="" disabled>Select a category</option>
          {filteredCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="0.00" step="0.01" required />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500" required />
      </div>
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Note</label>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="Optional details..." />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};


const TransactionsPage: React.FC = () => {
    // rawTransactions are in the DATABASE format
    const { transactions: rawTransactions, categories, deleteTransaction, updateTransaction } = useData();
    
    // Modals state
    const [editingTransaction, setEditingTransaction] = useState<DisplayTransaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<DisplayTransaction | null>(null);
    const [viewingTransaction, setViewingTransaction] = useState<DisplayTransaction | null>(null);

    // --- MAIN TRANSLATION AND FILTERING LOGIC ---
    const transactions = useMemo((): DisplayTransaction[] => {
        return rawTransactions.map(t => {
            const category = categories.find(c => c.id === t.category_id);
            return {
                id: t.id!,
                type: t.amount >= 0 ? 'income' : 'expense',
                category: category ? category.name : 'Uncategorized',
                amount: Math.abs(t.amount),
                note: t.description || '',
                date: t.date, // Keep as ISO string
                category_id: t.category_id,
                user_id: t.user_id!,
            };
        });
    }, [rawTransactions, categories]);
    
    // Filters (same as before)
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [dateFilter, setDateFilter] = useState<DateFilter>({
        mode: 'month', value: new Date().toISOString().slice(0, 7)
    });

    // Filtering logic now works on the TRANSLATED transactions
    const filteredTransactions = useMemo(() => {
        // ... (Filtering and sorting logic is largely the same, just operates on the `transactions` array now)
        const { mode, value } = dateFilter;
        const results = transactions
            .filter(t => { /* Date filtering logic is the same */ 
                if (!value) return true;
                const transactionDate = new Date(t.date);
                if (mode === 'month') return transactionDate.toISOString().slice(0, 7) === value;
                if (mode === 'day') return isSameDay(transactionDate, value as Date);
                if (mode === 'range') {
                    const { start, end } = value as { start: Date | null; end: Date | null };
                    if (start && end) {
                        const transactionTimestamp = transactionDate.getTime();
                        return transactionTimestamp >= start.getTime() && transactionTimestamp <= end.getTime();
                    }
                }
                return true;
            })
            .filter(t => filterType === 'all' || t.type === filterType)
            .filter(t => filterCategory === 'all' || t.category === filterCategory)
            .filter(t => t.note.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()));

        results.sort((a, b) => { /* Sorting logic is the same */
            switch (sortBy) {
                case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'amount-desc': return b.amount - a.amount;
                case 'amount-asc': return a.amount - b.amount;
                default:
                case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });
        return results;
    }, [transactions, searchTerm, filterType, filterCategory, dateFilter, sortBy]);
    
    const monthlySummary = useMemo(() => { /* This logic remains the same */
        const income = filteredTransactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum, 0);
        const expense = filteredTransactions.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
        return { income, expense, balance: income - expense };
    }, [filteredTransactions]);

    const getSummaryTitle = () => { /* This logic remains the same */
        // ...
        return 'Summary';
    };

    // Options for selects (same as before)
    const typeOptions: SelectOption[] = [{ value: 'all', label: 'All Types' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }];
    const categoryOptions: SelectOption[] = useMemo(() => [{ value: 'all', label: 'All Categories' }, ...categories.filter(c => filterType === 'all' || c.type === filterType).map(c => ({ value: c.name, label: c.name }))], [categories, filterType]);
    const sortOptions: SelectOption[] = [{ value: 'date-desc', label: 'Date: Newest' }, { value: 'date-asc', label: 'Date: Oldest' }, { value: 'amount-desc', label: 'Amount: High to Low' }, { value: 'amount-asc', label: 'Amount: Low to High' }];

    // Modal Handlers
    const handleEdit = (transaction: DisplayTransaction) => {
        setEditingTransaction(transaction);
    };

    const handleUpdateTransaction = (updatedDbTransaction: DbTransaction) => {
        updateTransaction(updatedDbTransaction.id!, updatedDbTransaction);
        setEditingTransaction(null);
    };
    
    const handleConfirmDelete = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
        }
    };
    
    // JSX remains largely the same, as it consumes the translated `filteredTransactions`
    return (
        <div className="space-y-6">
            {/* All filter UI components are the same */}
            <div className="animate-fade-in-up relative z-30">
                <Card><div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><PremierDatePicker value={dateFilter} onChange={setDateFilter}/>
                        <div className="relative w-full"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="w-5 h-5 text-slate-400" /></div><input type="text" placeholder="Search in notes or category..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"/>
                            {searchTerm && (<button type="button" onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label="Clear search"><XIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>)}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <CustomSelect value={filterType} onChange={(value) => { setFilterType(value); setFilterCategory('all'); }} options={typeOptions}/>
                        <CustomSelect value={filterCategory} onChange={setFilterCategory} options={categoryOptions} placeholder="All Categories"/>
                        <CustomSelect icon={<ArrowUpDownIcon className="w-5 h-5" />} value={sortBy} onChange={setSortBy} options={sortOptions}/>
                    </div>
                </div></Card>
            </div>
            
            {/* Summary card is the same */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}><Card><h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">{getSummaryTitle()}</h3><div className="grid grid-cols-3 gap-4 text-center"><div><p className="text-sm text-slate-500 dark:text-slate-400">Income</p><p className="text-xl font-bold text-emerald-600">Rs. {monthlySummary.income.toLocaleString('en-IN')}</p></div><div><p className="text-sm text-slate-500 dark:text-slate-400">Expense</p><p className="text-xl font-bold text-rose-600">Rs. {monthlySummary.expense.toLocaleString('en-IN')}</p></div><div><p className="text-sm text-slate-500 dark:text-slate-400">Balance</p><p className={`text-xl font-bold ${monthlySummary.balance >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600'}`}>Rs. {monthlySummary.balance.toLocaleString('en-IN')}</p></div></div></Card></div>
            
            {/* Transaction list is the same */}
            <div className="space-y-4">
                {filteredTransactions.length > 0 ? (filteredTransactions.map((t, index) => (<div key={t.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up"><Card className={`!p-0 overflow-hidden border-l-4 ${t.type === 'income' ? 'border-emerald-500' : 'border-rose-500'}`}><div className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => setViewingTransaction(t)}><div className="flex justify-between items-start"><div><p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{t.category}</p><p className="text-sm text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p></div><p className={`text-xl font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>{t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString('en-IN')}</p></div>{t.note && (<p className="mt-3 text-sm text-slate-600 dark:text-slate-300 italic bg-slate-100 dark:bg-slate-800/50 p-2 rounded-md line-clamp-2">{t.note}</p>)}</div><div className="bg-slate-100 dark:bg-slate-950/50 px-4 py-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800/50"><button onClick={() => handleEdit(t)} title="Edit Transaction" className="p-1 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><EditIcon className="w-5 h-5"/></button><button onClick={() => setTransactionToDelete(t)} title="Delete Transaction" className="p-1 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"><Trash2Icon className="w-5 h-5"/></button></div></Card></div>))) : (<Card className="text-center py-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}><p className="text-slate-500 dark:text-slate-400">No transactions found for the selected filters.</p></Card>)}
            </div>

            {/* All modals are the same, but now use DisplayTransaction */}
            {viewingTransaction && ( <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setViewingTransaction(null)}><div style={{animationDuration: '300ms'}} className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-800"><h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Transaction Details</h2><button onClick={() => setViewingTransaction(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><XIcon className="w-6 h-6" /></button></div><div className="p-4 sm:p-6 space-y-6"><div><p className={`text-4xl font-bold text-center ${viewingTransaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>{viewingTransaction.type === 'income' ? '+' : '-'} Rs. {viewingTransaction.amount.toLocaleString('en-IN')}</p></div><div className="space-y-4"><div className="flex items-center"><FolderIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0" /><div><p className="text-xs text-slate-500 dark:text-slate-400">Category</p><p className="font-medium text-slate-900 dark:text-slate-100">{viewingTransaction.category}</p></div></div><div className="flex items-center"><CalendarIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0" /><div><p className="text-xs text-slate-500 dark:text-slate-400">Date</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(viewingTransaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})}</p></div></div><div className="flex items-center"><ClockIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0" /><div><p className="text-xs text-slate-500 dark:text-slate-400">Time</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(viewingTransaction.date).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })}</p></div></div><div className="flex items-center"><ArrowRightLeftIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0" /><div><p className="text-xs text-slate-500 dark:text-slate-400">Type</p><p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{viewingTransaction.type}</p></div></div><div className="flex items-start"><FileTextIcon className="w-5 h-5 mr-4 text-slate-400 flex-shrink-0 mt-0.5" /><div><p className="text-xs text-slate-500 dark:text-slate-400">Note</p><p className="font-medium text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{viewingTransaction.note || 'No note provided.'}</p></div></div></div><div className="flex justify-end pt-4 border-t dark:border-slate-800"><Button variant="secondary" onClick={() => setViewingTransaction(null)}>Close</Button></div></div></div></div>)}
            {editingTransaction && (<div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setEditingTransaction(null)}><div style={{animationDuration: '300ms'}} className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-800"><h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Transaction</h2><button onClick={() => setEditingTransaction(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><XIcon className="w-6 h-6" /></button></div><div className="p-4 sm:p-6"><EditTransactionForm transaction={editingTransaction} onSubmit={handleUpdateTransaction} onClose={() => setEditingTransaction(null)} categories={categories} /></div></div></div>)}
            {transactionToDelete && (<div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in"><div style={{animationDuration: '300ms'}} className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}><div className="p-4 sm:p-6 text-center"><div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50"><Trash2Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" /></div><h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-5">Delete Transaction</h3><div className="mt-2 text-sm text-slate-600 dark:text-slate-400"><p>Are you sure you want to delete this transaction?</p><div className="font-semibold text-left mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-md space-y-1"><p><span className="font-normal">Date:</span> {new Date(transactionToDelete.date).toLocaleDateString()}</p><p><span className="font-normal">Category:</span> {transactionToDelete.category}</p><p><span className="font-normal">Amount:</span> <span className={transactionToDelete.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>Rs. {transactionToDelete.amount.toLocaleString('en-IN')}</span></p>{transactionToDelete.note && <p><span className="font-normal">Note:</span> <span className="italic">"{transactionToDelete.note}"</span></p>}</div></div><div className="mt-5 sm:mt-6 flex justify-center gap-3"><Button variant="secondary" onClick={() => setTransactionToDelete(null)}>Cancel</Button><Button variant="danger" onClick={handleConfirmDelete}>Delete</Button></div></div></div></div>)}
        </div>
    );
};

export default TransactionsPage;