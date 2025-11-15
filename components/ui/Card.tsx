import React, { ReactNode } from 'react';

// FIX: Update CardProps to extend React.HTMLAttributes<HTMLDivElement>. This allows standard div attributes like `style` to be passed, fixing a type error.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;