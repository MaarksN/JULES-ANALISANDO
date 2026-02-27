import React from 'react';
import * as Icons from 'lucide-react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: keyof typeof Icons;
  label?: string;
  isLoading?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  icon,
  label,
  isLoading,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = "relative overflow-hidden transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 font-medium rounded-lg flex items-center justify-center";

  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
    ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
  };

  const IconComponent = icon ? (Icons as any)[icon] : null;

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Icons.Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : IconComponent ? (
        <IconComponent className={`w-4 h-4 ${label || children ? 'mr-2' : ''}`} />
      ) : null}
      {label || children}
    </button>
  );
};

export default AnimatedButton;