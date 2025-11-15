import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Transaction } from '../context/DataContext'; // Assuming Transaction type is exported
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import PremierDatePicker, { DateFilter } from '../components/ui/PremierCalendar';
import { XIcon } from '../components/icons';

// Define TransactionType if it's not globally available
type TransactionType = 'income' | 'expense';

const AddTransactionPage: React.FC = () => {
  const { categories, addTransaction } = useData();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [type, setType] = useState<TransactionType>('expense');
  const [categoryName, setCategoryName] = useState(''); // State to hold the selected category NAME
  const [amount, setAmount] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ mode: 'day', value: new Date() });
  const [note, setNote] = useState('');

  // The UI filtering logic remains the same
  const filteredCategories = useMemo(() => categories.filter(c => c.type === type), [categories, type]);
  const categoryOptions: SelectOption[] = useMemo(() => filteredCategories.map(c => ({ value: c.name, label: c.name })), [filteredCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !amount || !dateFilter.value) {
        addToast("Please fill in all required fields.", 'error');
        return;
    }

    // --- START OF FIXES ---

    // FIX 1: Find the category OBJECT based on the selected NAME
    const selectedCategory = categories.find(c => c.name === categoryName);
    if (!selectedCategory || !selectedCategory.id) {
        addToast("Selected category is not valid. Please try again.", 'error');
        return;
    }
    const categoryId = selectedCategory.id;

    // FIX 2: Calculate the final amount based on the transaction type
    const numericAmount = parseFloat(amount);
    const finalAmount = type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    // FIX 3: Format the date correctly for the database 'date' column
    const selectedDate = dateFilter.value as Date;
    // We only need the YYYY-MM-DD part, setting timezone to UTC avoids off-by-one day errors
    selectedDate.setMinutes(selectedDate.getMinutes() - selectedDate.getTimezoneOffset());
    const isoDateString = selectedDate.toISOString().split('T')[0];

    // FIX 4: Create the object that matches the database table structure
    const transactionToSave = {
      description: note,      // The 'note' from the form maps to the 'description' column
      amount: finalAmount,    // The calculated positive/negative amount
      date: isoDateString,    // The correctly formatted date string
      category_id: categoryId // The numeric ID of the selected category
    };
    
    // --- END OF FIXES ---

    try {
      await addTransaction(transactionToSave);
      addToast('Transaction added successfully!', 'success');
      navigate('/transactions');
    } catch (error: any) {
      console.error("Failed to add transaction:", error);
      addToast(`Error: ${error.message || 'Could not save transaction.'}`, 'error');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <Card className="relative">
        <button
          type="button"
          onClick={() => navigate('/transactions')}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
          aria-label="Cancel and close"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <div className="mt-1 flex rounded-md">
              <button
                type="button"
                onClick={() => { setType('income'); setCategoryName('')}}
                className={`px-4 py-2 rounded-l-md w-1/2 transition-colors border border-slate-300 dark:border-slate-700 ${type === 'income' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => { setType('expense'); setCategoryName('')}}
                className={`px-4 py-2 rounded-r-md w-1/2 transition-colors border border-slate-300 dark:border-slate-700 -ml-px ${type === 'expense' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                Expense
              </button>
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <CustomSelect
                value={categoryName}
                onChange={setCategoryName}
                options={categoryOptions}
                placeholder="Select a category"
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
            <input
              type="number" id="amount" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="0.00" step="0.01" required
            />
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <PremierDatePicker value={dateFilter} onChange={setDateFilter} allowRangeSelection={false} />
            </div>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Note</label>
            <textarea
              id="note" rows={3} value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Optional details..."
            />
          </div>

          <div className="flex justify-end animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <Button type="submit">Add Transaction</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddTransactionPage;