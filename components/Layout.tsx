import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext'; // Import the useData hook

// Define the props for the Layout component
interface LayoutProps {
  onLogout: () => void;
}

// Helper component for navigation links
const SidebarLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
      }`
    }
  >
    {children}
  </NavLink>
);

const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  // Get the user directly from our global context. No need to fetch it again!
  const { user } = useData(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <div>
      {/* Mobile Header */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 md:hidden">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-controls="logo-sidebar"
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path></svg>
            </button>
            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
              Expense Tracker
            </span>
            <div/> {/* Spacer */}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <ul className="space-y-2">
            <li><SidebarLink to="/dashboard">Dashboard</SidebarLink></li>
            <li><SidebarLink to="/transactions">Transactions</SidebarLink></li>
            <li><SidebarLink to="/add">Add Transaction</SidebarLink></li>
            <li><SidebarLink to="/reports">Reports</SidebarLink></li>
            <li><SidebarLink to="/categories">Categories</SidebarLink></li>
            <li><SidebarLink to="/profile">Profile</SidebarLink></li>
          </ul>

          <div className="absolute bottom-0 left-0 w-full p-4">
            {user ? (
              <div className="p-2 text-sm text-gray-600 dark:text-gray-300">
                Logged in as: <br />
                <span className="font-semibold">{user.email}</span>
              </div>
            ) : (
                <div className="p-2 text-sm text-gray-600 dark:text-gray-300">Loading...</div>
            )}
            <button
              onClick={handleLogoutClick}
              className="w-full p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="p-4 md:ml-64 pt-20">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;