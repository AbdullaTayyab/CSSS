import React from 'react';
import { 
  LayoutDashboard, 
  Bell, 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Sparkles, 
  User, 
  Settings, 
  Zap,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotices } from '../../context/NoticeContext';

export const Sidebar = ({ currentTab, onSelectTab, isMobileOpen, setIsMobileOpen }) => {
  const { profile } = useAuth();
  const { stats } = useNotices();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notices', label: 'All Notices', icon: Bell, badge: stats.total },
    { id: 'add-notice', label: 'Add New Notice', icon: PlusCircle, isPrimary: true },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'summary', label: 'AI Weekly Summary', icon: Sparkles, badge: 'AI' },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    onSelectTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0f1d] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Top: Brand Logo & Mobile Close */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Pulse</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block -mt-1 font-semibold">
                  AI Campus Hub
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsMobileOpen(false)} 
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Notice Counter Banner */}
          {stats.urgent > 0 && (
            <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between text-rose-300">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {stats.urgent} Urgent Notice{stats.urgent > 1 ? 's' : ''}
              </span>
              <button 
                onClick={() => handleNavClick('notices')} 
                className="text-[11px] underline hover:text-rose-200"
              >
                View
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              if (item.isPrimary) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 my-2 ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30' 
                        : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-indigo-300" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded">
                      AI Powered
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive 
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : item.badge === 'AI' 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Student Profile Card */}
        <div className="p-3 border-t border-slate-800/80">
          <div 
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:bg-slate-800/80 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
              {profile.avatar || 'ST'}
            </div>
            <div className="overflow-hidden flex-1 text-left">
              <div className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                {profile.name}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {profile.department?.split(' ')[0]} • {profile.year?.split(' ')[0]}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
          </div>
        </div>

      </aside>
    </>
  );
};
