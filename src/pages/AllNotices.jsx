import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X,
  FileDown
} from 'lucide-react';
import { useNotices } from '../context/NoticeContext';
import { NoticeCard } from '../components/common/NoticeCard';
import { PriorityBadge, CategoryBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CATEGORIES, PRIORITIES } from '../constants/categories';

export const AllNotices = ({ onNavigate, onEditNotice }) => {
  const { notices, deleteNotice, toggleRead } = useNotices();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'event_date'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Filter & Sort Logic
  const filteredNotices = useMemo(() => {
    return notices
      .filter((notice) => {
        // Search filter
        const matchSearch = 
          notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (notice.venue && notice.venue.toLowerCase().includes(searchQuery.toLowerCase()));

        // Category filter
        const matchCategory = selectedCategory === 'All' || notice.category === selectedCategory;

        // Priority filter
        const matchPriority = selectedPriority === 'All' || notice.priority === selectedPriority;

        return matchSearch && matchCategory && matchPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        } else if (sortBy === 'event_date') {
          return (a.event_date || '').localeCompare(b.event_date || '');
        }
        return 0;
      });
  }, [notices, searchQuery, selectedCategory, selectedPriority, sortBy]);

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredNotices, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `campus_pulse_notices_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by notice title, description or venue..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/60 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Actions: Export & Add */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              title="Export filtered notices as JSON"
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            <button
              onClick={() => onNavigate('add-notice')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Notice</span>
            </button>
          </div>
        </div>

        {/* Filters and View Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200">
              <span className="text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200">
              <span className="text-slate-400">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All Priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="event_date">Sort: By Event Date</option>
              </select>
            </div>

            {/* Clear filters button if active */}
            {(selectedCategory !== 'All' || selectedPriority !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPriority('All');
                  setSearchQuery('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline px-2 py-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredNotices.length}</strong> of {notices.length} notice{notices.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Urgent: Red</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Upcoming: Blue</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-400" /> Expired: Grey</span>
        </div>
      </div>

      {/* Notices Display: Grid View */}
      {viewMode === 'grid' && (
        <>
          {filteredNotices.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No notices matched your current search and filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedPriority('All');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 text-xs font-semibold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onEdit={onEditNotice}
                  onView={setSelectedNotice}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Notices Display: Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Notice Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Time & Venue</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No notices found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((notice) => (
                    <tr 
                      key={notice.id} 
                      onClick={() => setSelectedNotice(notice)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs">
                        <div className="line-clamp-1">{notice.title}</div>
                        <div className="line-clamp-1 text-[11px] text-slate-500 font-normal">
                          {notice.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <CategoryBadge category={notice.category} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={notice.priority} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {notice.event_date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        <div>{notice.event_time}</div>
                        <div className="text-[11px] truncate max-w-[150px]">{notice.venue}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-500">
                        {notice.source}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditNotice(notice)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${notice.title}"?`)) {
                                deleteNotice(notice.id);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notice Detail Modal */}
      <Modal
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title || 'Notice Details'}
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

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">📅 Event Date:</span>
                <span>{selectedNotice.event_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">⏰ Event Time:</span>
                <span>{selectedNotice.event_time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">📍 Venue / Location:</span>
                <span>{selectedNotice.venue}</span>
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
