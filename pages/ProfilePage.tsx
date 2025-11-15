import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SunIcon, MoonIcon, Trash2Icon, FolderIcon, RefreshCwIcon, XIcon } from '../components/icons';
import { useToast } from '../context/ToastContext';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import { calculatePasswordStrength } from '../utils/validation';

const ProfilePage: React.FC = () => {
  const { user, resetToDefaults } = useData();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState('');
  
  useEffect(() => {
    // Reset confirmation text when modal is closed
    if (!isConfirmingReset) {
      setResetConfirmationText('');
    }
  }, [isConfirmingReset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, update user data here
    addToast('Profile updated successfully!', 'success');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill in all password fields.', 'error');
      return;
    }
    // Hardcoded current password check for demo purposes
    if (currentPassword !== '123456') {
      addToast('Incorrect current password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    // Enforce password strength
    const strength = calculatePasswordStrength(newPassword);
    if (strength.score < 4) {
        addToast('Password is too weak. Please meet at least 4 criteria.', 'error');
        return;
    }

    addToast('Your password has been securely updated.', 'success');
    // Clear fields for security
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleConfirmReset = () => {
    if (resetConfirmationText === 'RESET') {
        resetToDefaults();
        setIsConfirmingReset(false);
        addToast('All data has been reset to defaults.', 'success');
    } else {
        addToast('Confirmation text does not match.', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <div className="animate-fade-in-up">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                     <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Theme
                        </label>
                        <div className="flex items-center">
                            <span className="mr-3 text-sm text-slate-600 dark:text-slate-400">Light</span>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black focus:ring-slate-500 ${
                                    theme === 'dark' ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                        theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                            <span className="ml-3 text-sm text-slate-600 dark:text-slate-400">Dark</span>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>

                <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Change Password</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="current_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                            <input
                                type="password"
                                id="current_password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                placeholder="123456"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="new_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                            <input
                                type="password"
                                id="new_password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                required
                            />
                            <div className="mt-2">
                                <PasswordStrengthMeter password={newPassword} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirm_password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Change Password</Button>
                    </div>
                </form>
            </Card>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <Card>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Settings</h3>
                <nav>
                    <Link to="/categories" className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center">
                            <FolderIcon className="w-5 h-5 mr-3 text-slate-500" />
                            <span className="text-slate-700 dark:text-slate-300">Manage Categories</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </Link>
                </nav>
            </Card>
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card className="border-l-4 border-rose-500">
                <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Reset all application data to its original default state. This will delete all your transactions and categories.
                </p>
                <div className="flex justify-start">
                    <Button variant="danger" onClick={() => setIsConfirmingReset(true)} className="flex items-center">
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                        Reset All Data
                    </Button>
                </div>
            </Card>
        </div>

        {isConfirmingReset && (
            <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsConfirmingReset(false)}>
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up relative" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => setIsConfirmingReset(false)}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
                        aria-label="Close"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                    <div className="p-6 text-center">
                         <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50">
                            <Trash2Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-5">Reset All Data</h3>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            <p>This will permanently delete all your transactions and categories. This action cannot be undone.</p>
                            <p className="mt-4">Please type <strong className="text-rose-600 dark:text-rose-400">RESET</strong> to confirm.</p>
                        </div>
                        <div className="mt-4">
                            <input
                                type="text"
                                value={resetConfirmationText}
                                onChange={(e) => setResetConfirmationText(e.target.value)}
                                className="w-full text-center px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                placeholder="RESET"
                                autoComplete="off"
                            />
                        </div>
                        <div className="mt-6 flex justify-center gap-3">
                            <Button variant="secondary" onClick={() => setIsConfirmingReset(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleConfirmReset}
                                disabled={resetConfirmationText !== 'RESET'}
                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reset Data
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ProfilePage;