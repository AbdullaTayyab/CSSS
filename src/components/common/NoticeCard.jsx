import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Share2, 
  Trash2, 
  Edit3, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { PriorityBadge, CategoryBadge } from './Badge';
import { CountdownBadge } from './CountdownBadge';
import { useNotices } from '../../context/NoticeContext';

export const NoticeCard = ({ notice, onEdit, onView }) => {
  const { deleteNotice, toggleRead } = useNotices();
  const [copied, setCopied] = useState(false);

  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `📌 *${notice.title}*\n📅 Date: ${notice.event_date}\n⏰ Time: ${notice.event_time}\n📍 Venue: ${notice.venue}\n\n${notice.description}\n\n— Via Campus Pulse`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${notice.title}"?`)) {
      deleteNotice(notice.id);
    }
  };

  const handleToggleRead = (e) => {
    e.stopPropagation();
    toggleRead(notice.id);
  };

  // Card highlight style based on priority
  const borderHighlight = notice.priority === 'Urgent' 
    ? 'border-l-4 border-l-rose-500'
    : notice.priority === 'Upcoming'
    ? 'border-l-4 border-l-blue-500'
    : 'border-l-4 border-l-slate-300 dark:border-l-slate-700';

  return (
    <div 
      onClick={() => onView && onView(notice)}
      className={`group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between ${borderHighlight} ${notice.is_read ? 'opacity-85' : ''}`}
    >
      <div>
        {/* Top Badges & Source */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={notice.priority} size="sm" />
            <CategoryBadge category={notice.category} size="sm" />
            {notice.is_sample && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40" title="Demonstration sample data">
                Demo
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <CountdownBadge dateString={notice.event_date} timeString={notice.event_time} />
            <span className="capitalize text-[11px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
              {notice.source || 'Manual'}
            </span>
          </div>
        </div>

        {/* Notice Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-2">
          {notice.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
          {notice.description}
        </p>

        {/* Meta Details: Date, Time, Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/70 mb-4">
          <div className="flex items-center gap-2 truncate">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">
              {notice.event_date && notice.event_date !== 'Not specified' ? notice.event_date : 'Date: Not specified'}
            </span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span className="truncate">
              {notice.event_time && notice.event_time !== 'Not specified' ? notice.event_time : 'Time: Not specified'}
            </span>
          </div>

          <div className="flex items-center gap-2 truncate sm:col-span-2">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate font-medium text-slate-700 dark:text-slate-300">
              {notice.venue && notice.venue !== 'Not specified' ? notice.venue : 'Venue: Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Status & Quick Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/70 text-xs text-slate-400">
        <button
          onClick={handleToggleRead}
          className={`flex items-center gap-1.5 font-medium transition-colors ${notice.is_read ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${notice.is_read ? 'fill-emerald-100 dark:fill-emerald-950/60' : ''}`} />
          {notice.is_read ? 'Completed' : 'Mark Done'}
        </button>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleShare}
            title={copied ? 'Copied to clipboard!' : 'Copy summary'}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          
          {onEdit && (
            <button
              onClick={() => onEdit(notice)}
              title="Edit notice"
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleDelete}
            title="Delete notice"
            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
