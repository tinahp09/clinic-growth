import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toPersian } from '../../utils/persian';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  iconBg?: string;
  valueColor?: string;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  iconBg = 'bg-teal-50',
  valueColor = 'text-slate-900',
  loading = false,
}: KPICardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl" />
          <div className="w-16 h-5 bg-slate-100 rounded-full" />
        </div>
        <div className="w-24 h-7 bg-slate-100 rounded mb-2" />
        <div className="w-32 h-4 bg-slate-100 rounded" />
      </div>
    );
  }

  const displayValue = typeof value === 'number' ? toPersian(value.toLocaleString()) : value;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
            trend === 'down' ? 'bg-red-50 text-red-600' :
            'bg-slate-50 text-slate-500'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} /> :
             trend === 'down' ? <TrendingDown size={12} /> :
             <Minus size={12} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold mb-1 ${valueColor}`}>
        {displayValue}
      </div>
      <div className="text-sm text-slate-500">{title}</div>
      {subtitle && (
        <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}
