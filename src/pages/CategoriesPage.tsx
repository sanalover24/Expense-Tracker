import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TransactionType, Category } from '../../types';
import { Trash2Icon, EditIcon, XIcon, ArrowUpDownIcon } from '../components/icons';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import { useToast } from '../context/ToastContext';


const EditCategoryForm: React.FC<{ category: Category; onSubmit: (data: Category) => void; onClose: () => void; }> = ({ category, onSubmit, onClose }) => {
    const [formData, setFormData] = useState(category);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                disabled
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Category type cannot be changed to maintain data integrity.</p>
            </div>
            <div className="flex justify-end pt-4 gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
};


const CategoriesPage: React.FC = () => {
  const { categories, transactions, addCategory, deleteCategory, updateCategory } = useData();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [sortCategoriesBy, setSortCategoriesBy] = useState('name-asc');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const success = addCategory({ name, type });
    if (success) {
      addToast('Category added successfully!', 'success');
      setName('');
    } else {
      addToast(`A category named "${name}" for ${type} already exists.`, 'error');
    }
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
        deleteCategory(categoryToDelete.id);
        addToast('Category and associated transactions deleted!', 'success');
        setCategoryToDelete(null);
    }
  };
  
  const categoryInUse = useMemo(() => {
    if (!categoryToDelete) return false;
    return transactions.some(t => t.category === categoryToDelete.name);
  }, [transactions, categoryToDelete]);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    updateCategory(updatedCategory);
    addToast('Category updated successfully!', 'success');
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };
  
  const sortOptions: SelectOption[] = [
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
    { value: 'type-asc', label: 'Type (Income first)' },
    { value: 'type-desc', label: 'Type (Expense first)' },
  ];
  
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
        switch (sortCategoriesBy) {
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'type-asc':
                return a.type.localeCompare(b.type);
            case 'type-desc':
                return b.type.localeCompare(a.type);
            case 'name-asc':
            default:
                return a.name.localeCompare(b.name);
        }
    });
  }, [categories, sortCategoriesBy]);

  const typeSelectOptions: SelectOption[] = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
      <div className="animate-fade-in-up">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Add New Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <CustomSelect
                value={type}
                onChange={(value) => setType(value as TransactionType)}
                options={typeSelectOptions}
              />
            </div>
            <Button type="submit" className="w-full">Add Category</Button>
          </form>
        </Card>
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">All Categories</h3>
                <div className="w-full sm:w-auto sm:min-w-[200px]">
                    <CustomSelect
                        icon={<ArrowUpDownIcon className="w-5 h-5" />}
                        value={sortCategoriesBy}
                        onChange={setSortCategoriesBy}
                        options={sortOptions}
                    />
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Category Name</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCategories.length > 0 ? sortedCategories.map((c, index) => (
                            <tr key={c.id} className="bg-white border-b dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <td className="px-6 py-4 font-medium">{c.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.type === 'income' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'}`}>{c.type}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleEdit(c)} title="Edit Category" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mr-2"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setCategoryToDelete(c)} title="Delete Category" className="text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200"><Trash2Icon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        )) : (
                           <tr>
                               <td colSpan={3} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                   No categories found. Start by adding one!
                               </td>
                           </tr>
                        )}
                    </tbody>
                </table>
             </div>
        </Card>
      </div>
       {isEditModalOpen && editingCategory && (
            <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Category</h2>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 sm:p-6">
                       <EditCategoryForm
                            category={editingCategory}
                            onSubmit={handleUpdateCategory}
                            onClose={() => setIsEditModalOpen(false)}
                        />
                    </div>
                </div>
            </div>
        )}

        {categoryToDelete && (
            <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="p-4 sm:p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50">
                            <Trash2Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-5">Delete Category</h3>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            <p>Are you sure you want to delete the category "<strong>{categoryToDelete.name}</strong>"?</p>
                            {categoryInUse && (
                                <p className="mt-2 p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-md">
                                    <strong>Warning:</strong> This category is used in one or more transactions. Deleting it will also permanently delete all associated transactions.
                                </p>
                            )}
                            <p className="mt-4">This action cannot be undone.</p>
                        </div>
                        <div className="mt-5 sm:mt-6 flex justify-center gap-3">
                            <Button variant="secondary" onClick={() => setCategoryToDelete(null)}>
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

export default CategoriesPage;