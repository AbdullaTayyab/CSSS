import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Tag, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useNotices } from '../context/NoticeContext';
import { CATEGORY_CONFIG, CATEGORIES } from '../constants/categories';
import { PriorityBadge, CategoryBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

// Helper to normalize any date string into YYYY-MM-DD for FullCalendar
function normalizeDate(dateStr) {
  if (!dateStr || dateStr === 'Not specified') return null;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Parse natural date e.g. "5 November 2026" or "Nov 12, 2026"
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If text contains "5 November 2026"
  const monthMap = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const match = dateStr.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\s+(\d{4})/i);
  if (match) {
    const d = match[1].padStart(2, '0');
    const m = monthMap[match[2].slice(0, 3).toLowerCase()] || '11';
    const y = match[3];
    return `${y}-${m}-${d}`;
  }

  return null;
}

export const CalendarView = ({ onNavigate, onEditNotice }) => {
  const { notices } = useNotices();
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Map notices to FullCalendar events
  const calendarEvents = useMemo(() => {
    return notices
      .filter(n => {
        if (activeCategoryFilter !== 'All' && n.category !== activeCategoryFilter) {
          return false;
        }
        return Boolean(normalizeDate(n.event_date));
      })
      .map(n => {
        const dateIso = normalizeDate(n.event_date);
        const config = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.General;

        return {
          id: n.id,
          title: `${n.priority === 'Urgent' ? '🚨 ' : ''}${n.title}`,
          start: dateIso,
          backgroundColor: config.calendarColor,
          borderColor: config.calendarColor,
          textColor: '#ffffff',
          extendedProps: {
            notice: n
          }
        };
      });
  }, [notices, activeCategoryFilter]);

  // Handle Event Click
  const handleEventClick = (info) => {
    const notice = info.event.extendedProps.notice;
    if (notice) {
      setSelectedNotice(notice);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Campus Academic & Event Calendar</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Auto-synchronized with all saved college circulars, examinations, deadlines and fests.
            </p>
          </div>

          {/* Quick Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('add-notice')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-sm hover:scale-[1.01] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event Notice</span>
            </button>
          </div>
        </div>

        {/* Category Legend & Filter Chips */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Legend:
          </span>

          <button
            onClick={() => setActiveCategoryFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeCategoryFilter === 'All'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Events ({notices.length})
          </button>

          {CATEGORIES.map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const isSelected = activeCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(isSelected ? 'All' : cat)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSelected 
                    ? 'ring-2 ring-indigo-500 ' + config.bgColor + ' ' + config.textColor + ' ' + config.borderColor
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.calendarColor }} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate="2026-11-01"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={3}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title || 'Event Details'}
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={selectedNotice.priority} />
              <CategoryBadge category={selectedNotice.category} />
              {selectedNotice.is_sample && (
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                  Sample Demonstration Data
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">📅 Scheduled Date:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{selectedNotice.event_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">⏰ Time:</span>
                <span>{selectedNotice.event_time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">📍 Venue:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedNotice.venue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">📡 Source:</span>
                <span className="capitalize">{selectedNotice.source}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Notice Summary
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedNotice.description}
              </p>
            </div>

            {selectedNotice.original_text && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Original Raw Message
                </h4>
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selectedNotice.original_text}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const noticeToEdit = selectedNotice;
                  setSelectedNotice(null);
                  if (onEditNotice) onEditNotice(noticeToEdit);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-colors"
              >
                Edit Notice
              </button>
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
