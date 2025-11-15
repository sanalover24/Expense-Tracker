import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center flex flex-col items-center justify-center h-[60vh]">
      <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100">404</h1>
      <p className="text-2xl mt-4 mb-2 text-slate-800 dark:text-slate-200">Oops! Page not found</p>
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">The page you are looking for does not exist or has been moved.</p>
      <Link to="/dashboard">
        <Button>
          Go back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;