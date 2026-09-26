import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  icon = null
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-[0.99]',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm hover:shadow active:scale-[0.99]',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow active:scale-[0.99]',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-[0.99]',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 active:scale-[0.99]',
    ghost: 'text-gray-700 hover:bg-gray-100'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        rounded-lg
        font-semibold
        transition-all
        duration-150
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:active:scale-100
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && <span className="text-base">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
