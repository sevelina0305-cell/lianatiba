import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  colorScheme?: 'teal' | 'navy' | 'amber' | 'rose' | 'indigo' | 'emerald';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  colorScheme = 'teal',
}) => {
  const schemeStyles = {
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', iconBg: 'bg-teal-500/10 text-teal-600', border: 'border-teal-100' },
    navy: { bg: 'bg-slate-50', text: 'text-slate-800', iconBg: 'bg-[#102A43]/10 text-[#102A43]', border: 'border-slate-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-800', iconBg: 'bg-amber-500/10 text-amber-600', border: 'border-amber-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-800', iconBg: 'bg-rose-500/10 text-rose-600', border: 'border-rose-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-800', iconBg: 'bg-indigo-500/10 text-indigo-600', border: 'border-indigo-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-800', iconBg: 'bg-emerald-500/10 text-emerald-600', border: 'border-emerald-100' },
  }[colorScheme];

  return (
    <div className={`p-4 md:p-5 rounded-2xl bg-white border ${schemeStyles.border} shadow-xs hover:shadow-md transition-shadow flex items-center justify-between`}>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className={`text-2xl md:text-3xl font-black ${schemeStyles.text} tracking-tight`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        {trend && (
          <span className={`inline-block text-[11px] font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${schemeStyles.iconBg}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
