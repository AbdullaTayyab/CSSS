import React from 'react';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../../constants/categories';

export const PriorityBadge = ({ priority = 'Normal', size = 'md', className = '' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Normal;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5'
  };

  // Specific colors per requirements:
  // Urgent: Red badge
  // Upcoming: Blue badge
  // Expired: Grey badge
  let badgeStyles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let dotStyles = 'bg-slate-400';

  if (priority === 'Urgent') {
    badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60';
    dotStyles = 'bg-rose-500 animate-pulse';
  } else if (priority === 'Upcoming') {
    badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60';
    dotStyles = 'bg-blue-500';
  } else if (priority === 'Expired') {
    badgeStyles = 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    dotStyles = 'bg-zinc-400';
  } else if (priority === 'Normal') {
    badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60';
    dotStyles = 'bg-emerald-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses[size] || sizeClasses.md} ${badgeStyles} font-medium tracking-wide shadow-xs ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />
      {config.label}
    </span>
  );
};

export const CategoryBadge = ({ category = 'General', size = 'md', className = '' }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.General;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5 font-medium',
    lg: 'text-sm px-3 py-1 font-medium'
  };

  return (
    <span className={`inline-flex items-center rounded-lg border ${sizeClasses[size] || sizeClasses.md} ${config.bgColor} ${config.textColor} ${config.borderColor} transition-colors ${className}`}>
      {config.label}
    </span>
  );
};
