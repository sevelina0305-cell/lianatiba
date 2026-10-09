import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-teal-50 text-teal-700 border-teal-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    gold: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  }[variant];

  const sizeStyles = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-bold rounded-md border ${sizeStyles} ${styles}`}>
      {children}
    </span>
  );
};
