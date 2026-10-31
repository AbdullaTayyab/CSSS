import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  Plus, 
  Sparkles, 
  Check, 
  AlertCircle,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotices } from '../../context/NoticeContext';
import { geminiService } from '../../services/geminiService';
import { PriorityBadge } from '../common/Badge';

export const Header = ({ onOpenMobileMenu, currentTab, onSelectTab }) => {
  const { settings, updateSettings } = useAuth();
  const { notices, stats } = useNotices();
  const [aiStatus, setAiStatus] = useState({ hasKey: false, mode: 'demo' });
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef(null);

  // Check AI connection status
  useEffect(() => {
    geminiService.getStatus(settings.ai?.customApiKey).then(setAiStatus);
  }, [settings.ai?.customApiKey]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const titles = {
    dashboard: 'Campus Dashboard',
    notices: 'Notice Board',
    'add-notice': 'AI Smart Notice Input',
    calendar: 'Academic & Event Calendar',
    summary: 'AI Weekly Briefing',
    profile: 'Student Profile',
    settings: 'Application Settings'
  };

  const urgentNotices = notices.filter(n => n.priority === 'Urgent');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {titles[currentTab] || 'Campus Pulse'}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Apex Institute of Technology • Fall 2026
          </p>
        </div>
      </div>

      {/* Right: AI Mode Badge, Theme Toggle, Notification Bell, Quick Add */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gemini AI Status Badge */}
        <div 
          onClick={() => onSelectTab('settings')}
          className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            aiStatus.mode === 'live' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' 
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800'
          }`}
          title={aiStatus.mode === 'live' ? 'Connected to live Gemini API' : 'Running in Smart Demo AI mode (Click to configure API key)'}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {aiStatus.mode === 'live' ? 'Gemini 1.5 Live' : 'AI Demo Mode'}
          </span>
          <span className="md:hidden">
            {aiStatus.mode === 'live' ? 'Live' : 'Demo'}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => {
            const next = settings.theme === 'dark' ? 'light' : 'dark';
            updateSettings({ theme: next });
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {urgentNotices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Notifications
                </span>
                <span className="text-xs text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                  {urgentNotices.length} Urgent
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {urgentNotices.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No urgent notices right now. You are all caught up!
                  </div>
                ) : (
                  urgentNotices.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        onSelectTab('notices');
                        setShowNotifMenu(false);
                      }}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                          {n.title}
                        </span>
                        <PriorityBadge priority={n.priority} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {n.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        📅 {n.event_date} {n.event_time !== 'Not specified' ? `• ${n.event_time}` : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="px-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    onSelectTab('notices');
                    setShowNotifMenu(false);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  View All Notices ({notices.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Notice Button */}
        <button
          onClick={() => onSelectTab('add-notice')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Notice</span>
        </button>
      </div>
    </header>
  );
};
