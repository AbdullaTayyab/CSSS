import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NoticeProvider } from './context/NoticeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { AllNotices } from './pages/AllNotices';
import { AddNewNotice } from './pages/AddNewNotice';
import { CalendarView } from './pages/CalendarView';
import { WeeklySummary } from './pages/WeeklySummary';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  // Navigate to edit notice
  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setCurrentTab('add-notice');
  };

  const handleCancelEdit = () => {
    setEditingNotice(null);
    setCurrentTab('notices');
  };

  const handleNoticeAdded = () => {
    setEditingNotice(null);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'add-notice') setEditingNotice(null);
          setCurrentTab(tab);
        }}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={setCurrentTab}
              onEditNotice={handleEditNotice}
            />
          )}

          {currentTab === 'notices' && (
            <AllNotices
              onNavigate={setCurrentTab}
              onEditNotice={handleEditNotice}
            />
          )}

          {currentTab === 'add-notice' && (
            <AddNewNotice
              onNoticeAdded={handleNoticeAdded}
              editingNotice={editingNotice}
              onCancelEdit={handleCancelEdit}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              onNavigate={setCurrentTab}
              onEditNotice={handleEditNotice}
            />
          )}

          {currentTab === 'summary' && (
            <WeeklySummary
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'profile' && (
            <Profile />
          )}

          {currentTab === 'settings' && (
            <Settings />
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-400">
          <p>
            <strong>Campus Pulse</strong> — AI-Powered College Information Management Platform • Built with React, Vite, Tailwind CSS & Gemini AI
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NoticeProvider>
        <AppContent />
      </NoticeProvider>
    </AuthProvider>
  );
}
