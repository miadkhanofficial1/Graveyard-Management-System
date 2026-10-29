import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'gold' | 'rose' | 'slate' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    emerald:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    gold:
      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    rose:
      'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25 backdrop-blur-md shadow-[0_0_14px_rgba(244,63,94,0.25)]',
    slate:
      'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20 backdrop-blur-md',
    blue:
      'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20 backdrop-blur-md shadow-[0_0_12px_rgba(56,189,248,0.15)]',
    purple:
      'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 backdrop-blur-md shadow-[0_0_12px_rgba(168,85,247,0.15)]',
  };

  const sizeStyles = {
    sm: 'text-[10px] tracking-wide font-semibold px-2 py-0.5',
    md: 'text-xs tracking-wide font-semibold px-2.5 py-1',
    lg: 'text-xs tracking-wide font-bold px-3 py-1.5',
  };

  const dotColors = {
    emerald: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    gold: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    rose: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse',
    slate: 'bg-slate-400',
    blue: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    purple: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
