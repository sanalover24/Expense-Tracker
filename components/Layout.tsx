import React from 'react';
import { useLocation, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboardIcon, ListIcon, PlusCircleIcon, BarChartIcon, UserCircleIcon, LogOutIcon, MoonIcon, SunIcon, FolderIcon } from './icons';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

const getPageTitle = (pathname: string): string => {
    const path = pathname.split('/').pop() || 'dashboard';
    if (path === 'add') return 'Add Transaction';
    if (path === '') return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboardIcon, label: 'Dashboard' },
  { path: '/transactions', icon: ListIcon, label: 'Transactions' },
  { path: '/add', icon: PlusCircleIcon, label: 'Add', isCentral: true },
  { path: '/reports', icon: BarChartIcon, label: 'Reports' },
  { path: '/categories', icon: FolderIcon, label: 'Categories' },
];

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useData();

    const baseLinkClasses = "flex items-center px-4 py-2.5 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium";
    const activeLinkClasses = "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold";

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen p-4">
            <div className="text-2xl font-bold mb-10 px-4 text-slate-900 dark:text-white">
                Smart<span className="text-indigo-500">Tracker</span>
            </div>
            <nav className="flex-grow">
                <ul className="space-y-2">
                    {navItems.filter(item => !item.isCentral).map(item => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="space-y-2">
                 <button onClick={toggleTheme} title="Toggle Theme" className="w-full flex items-center justify-between px-4 py-2.5 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                <NavLink to="/profile" className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <UserCircleIcon className="w-5 h-5 mr-3" />
                    {user.name}
                </NavLink>
                <button onClick={onLogout} className={`${baseLinkClasses} w-full text-rose-500 dark:text-rose-400`}>
                    <LogOutIcon className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

const Layout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100">
      <div className="flex">
        <Sidebar onLogout={onLogout} />

        <div className="flex-1 w-full md:w-[calc(100%-16rem)]">
           <header className="md:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <h1 className="text-xl font-semibold">{pageTitle}</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        title="Toggle Theme"
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </button>
                    <NavLink to="/profile" title="Profile" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <UserCircleIcon className="w-6 h-6" />
                    </NavLink>
                </div>
                </div>
            </header>
            
             <header className="hidden md:flex bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm items-center justify-between h-16 px-8 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
                 <h1 className="text-2xl font-bold">{pageTitle}</h1>
                 <NavLink to="/add" className="bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 rounded-lg px-4 py-2 font-semibold hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors flex items-center gap-2">
                    <PlusCircleIcon className="w-5 h-5"/>
                    Add Transaction
                 </NavLink>
             </header>

            <main className="pt-16 md:pt-0 pb-16 md:pb-0">
                <div className="container mx-auto px-4 md:px-8 py-8">
                <Outlet />
                </div>
            </main>
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 z-30">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            if (item.isCentral) {
              return (
                <div key={item.path} className="flex-shrink-0">
                    <NavLink to={item.path} className={({isActive}) => `
                        -mt-8 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ease-in-out
                        ${isActive ? 'bg-slate-700 dark:bg-slate-300 scale-110' : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200'}`
                    }>
                        <item.icon className="w-8 h-8 text-white dark:text-slate-900" />
                        <span className="sr-only">{item.label}</span>
                    </NavLink>
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full transition-colors text-center
                  ${
                    isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
