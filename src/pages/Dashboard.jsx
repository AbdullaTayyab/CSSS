import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  CalendarDays,
  FileText,
  CheckCircle,
  ExternalLink,
  Flame,
  Zap,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotices } from '../context/NoticeContext';
import { NoticeCard } from '../components/common/NoticeCard';
import { Modal } from '../components/common/Modal';
import { PriorityBadge, CategoryBadge } from '../components/common/Badge';
import { geminiService } from '../services/geminiService';

export const Dashboard = ({ onNavigate, onEditNotice }) => {
  const { profile, settings } = useAuth();
  const { notices, stats } = useNotices();

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [quickSummary, setQuickSummary] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Quick AI Summary Handler
  const handleQuickSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await geminiService.generateWeeklySummary(notices, settings.ai?.customApiKey);
      if (res && res.data) {
        setQuickSummary(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // 6 Most recent notices
  const recentNotices = notices.slice(0, 6);

  return (
    <div className="space-y-8 pb-12">
      {/* A. Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-2xl p-6 sm:p-8 shadow-elevated relative overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-2 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI-Powered Academic Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile.name || 'Student'}!
          </h2>
          <p className="text-indigo-200 text-sm sm:text-base max-w-xl">
            Stay updated with everything happening on your campus. All your WhatsApp broadcasts, emails and departmental circulars organized in one place.
          </p>
        </div>

        {/* Header CTA */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('add-notice')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-sm hover:bg-indigo-50 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add New Notice</span>
          </button>
        </div>
      </div>

      {/* Urgent Attention / 24-Hour Deadlines Banner */}
      {stats.deadlinesWithin24h.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Action Required: {stats.deadlinesWithin24h.length} deadline(s) approaching within 24 hours!
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {stats.deadlinesWithin24h.map(d => d.title).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('notices')}
            className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline shrink-0 flex items-center gap-1"
          >
            View Deadlines <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* B. Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Notices */}
        <div 
          onClick={() => onNavigate('notices')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Notices
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400">active items</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <span>Aggregated across campus</span>
          </p>
        </div>

        {/* Upcoming Events */}
        <div 
          onClick={() => onNavigate('calendar')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Upcoming Events
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.upcomingEvents}
            </span>
            <span className="text-xs text-purple-500 font-medium">scheduled</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <span>Fests, sports & workshops</span>
          </p>
        </div>

        {/* Urgent Notices */}
        <div 
          onClick={() => onNavigate('notices')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Urgent Notices
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {stats.urgent}
            </span>
            <span className="text-xs text-rose-500 font-medium">requires action</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <span>Immediate student attention</span>
          </p>
        </div>

        {/* Pending Deadlines */}
        <div 
          onClick={() => onNavigate('calendar')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Deadlines
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.pendingDeadlines}
            </span>
            <span className="text-xs text-amber-500 font-medium">exams & submissions</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <span>Upcoming cutoffs</span>
          </p>
        </div>
      </div>

      {/* C. AI Weekly Summary Prominent Card */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-slate-900 rounded-2xl p-6 sm:p-7 border border-indigo-100 dark:border-indigo-900/40 shadow-card relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Campus Pulse Weekly Digest
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Cut through noise and scattered messages. Gemini AI scans all verified notices and extracts exactly what exams, events and deadlines require your focus this week.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleQuickSummary}
              disabled={isGeneratingSummary}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
              <span>
                {isGeneratingSummary ? 'Analyzing Notices...' : 'What do I need to know this week?'}
              </span>
            </button>

            <button
              onClick={() => onNavigate('summary')}
              className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
            >
              Full Briefing
            </button>
          </div>
        </div>

        {/* Inline Quick AI Summary Modal/Drawer if generated */}
        {quickSummary && (
          <div className="mt-6 pt-6 border-t border-indigo-100 dark:border-indigo-900/40 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Instant AI Brief
                </span>
                <button 
                  onClick={() => setQuickSummary(null)} 
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Dismiss
                </button>
              </div>

              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                {quickSummary.headline}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Exams */}
                <div className="p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                  <span className="font-bold text-rose-800 dark:text-rose-300 block mb-1">
                    Exams & Assessments
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {quickSummary.upcoming_examinations?.length > 0 ? (
                      quickSummary.upcoming_examinations.map((ex, i) => <li key={i}>• {ex}</li>)
                    ) : (
                      <li>No examinations listed this week.</li>
                    )}
                  </ul>
                </div>

                {/* Deadlines */}
                <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                    Approaching Deadlines
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {quickSummary.approaching_deadlines?.length > 0 ? (
                      quickSummary.approaching_deadlines.map((dl, i) => <li key={i}>• {dl}</li>)
                    ) : (
                      <li>No immediate deadlines pending.</li>
                    )}
                  </ul>
                </div>

                {/* Recommended Actions */}
                <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
                    Student Action Checklist
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {quickSummary.recommended_actions?.slice(0, 3).map((act, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* E. Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('add-notice')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Notice
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            View Calendar
          </button>

          <button
            onClick={() => onNavigate('summary')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Weekly Summary
          </button>
        </div>
      </div>

      {/* D. Recent Updates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Campus Updates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest circulars and announcements across all departments
            </p>
          </div>

          <button
            onClick={() => onNavigate('notices')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All ({notices.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentNotices.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              No notices saved yet
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Paste an announcement text to extract information using Gemini AI.
            </p>
            <button
              onClick={() => onNavigate('add-notice')}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Add First Notice
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentNotices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onEdit={onEditNotice}
                onView={setSelectedNotice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      <Modal
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title || 'Notice Details'}
      >
        {selectedNotice && (
          <div className="space-y-5">
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
