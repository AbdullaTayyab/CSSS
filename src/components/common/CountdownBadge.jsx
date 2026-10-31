import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const CountdownBadge = ({ dateString, timeString }) => {
  if (!dateString || dateString === 'Not specified') return null;

  try {
    const target = new Date(dateString);
    if (isNaN(target.getTime())) return null;

    const now = new Date();
    const diffMs = target - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) {
      if (diffHours > -24) {
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Due today
          </span>
        );
      }
      return null;
    }

    if (diffHours <= 24) {
      const hours = Math.floor(diffHours);
      const minutes = Math.floor((diffHours - hours) * 60);
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          {hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left!`}
        </span>
      );
    }

    if (diffHours <= 48) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
          <Clock className="w-3 h-3" /> Due tomorrow
        </span>
      );
    }
  } catch (e) {
    return null;
  }

  return null;
};
