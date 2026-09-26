import React from 'react';

export const Card = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`
        bg-white dark:bg-slate-900/90
        rounded-2xl
        border border-slate-200/80 dark:border-slate-800/80
        shadow-sm
        p-6
        transition-all
        duration-200
        ${hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
