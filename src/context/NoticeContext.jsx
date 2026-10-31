import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SAMPLE_NOTICES } from '../constants/initialNotices';
import { supabaseService } from '../services/supabaseService';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
  const { settings } = useAuth();
  const [notices, setNotices] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_pulse_notices');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading notices from localStorage:', e);
    }
    return SAMPLE_NOTICES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  // Save to localStorage whenever notices change
  useEffect(() => {
    try {
      localStorage.setItem('campus_pulse_notices', JSON.stringify(notices));
    } catch (e) {
      console.warn('Failed to save notices to localStorage:', e);
    }
  }, [notices]);

  // Attempt initial fetch from Supabase if configured
  useEffect(() => {
    const initFromSupabase = async () => {
      if (supabaseService.isConfigured()) {
        setIsLoading(true);
        const remote = await supabaseService.fetchNotices();
        if (remote && remote.length > 0) {
          setNotices(remote);
        }
        setIsLoading(false);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    };
    initFromSupabase();
  }, []);

  // Check 24-hour deadlines on load and send reminders if enabled
  useEffect(() => {
    if (!settings.notifications.deadlineReminders) return;

    const checkDeadlines = () => {
      const now = new Date();
      notices.forEach(notice => {
        if (!notice.event_date || notice.event_date === 'Not specified') return;
        const targetDate = new Date(notice.event_date);
        if (isNaN(targetDate.getTime())) return;

        const diffHours = (targetDate - now) / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 24) {
          notificationService.notifyDeadlineApproaching(notice, Math.round(diffHours));
        }
      });
    };

    // Run check once on start
    const timer = setTimeout(checkDeadlines, 2500);
    return () => clearTimeout(timer);
  }, [notices, settings.notifications.deadlineReminders]);

  // Add Notice
  const addNotice = async (noticeData) => {
    const newNotice = {
      id: 'notice-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      title: noticeData.title?.trim() || 'Untitled Notice',
      description: noticeData.description?.trim() || 'No description provided.',
      original_text: noticeData.original_text || '',
      category: noticeData.category || 'General',
      priority: noticeData.priority || 'Normal',
      event_date: noticeData.event_date || 'Not specified',
      event_time: noticeData.event_time || 'Not specified',
      venue: noticeData.venue || 'Not specified',
      source: noticeData.source || 'Manual',
      is_deadline: Boolean(noticeData.is_deadline || noticeData.priority === 'Urgent'),
      is_read: false,
      is_sample: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setNotices(prev => [newNotice, ...prev]);

    // Send to Supabase asynchronously if configured
    if (supabaseService.isConfigured()) {
      supabaseService.insertNotice(newNotice).catch(console.warn);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {}

    // Send Urgent Notification if enabled
    if (newNotice.priority === 'Urgent' && settings.notifications.urgentAlerts) {
      notificationService.notifyUrgentNotice(newNotice);
    }

    return newNotice;
  };

  // Update Notice
  const updateNotice = async (id, updates) => {
    const updatedWithTime = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    setNotices(prev => prev.map(n => (n.id === id ? { ...n, ...updatedWithTime } : n)));

    if (supabaseService.isConfigured()) {
      supabaseService.updateNotice(id, updatedWithTime).catch(console.warn);
    }
  };

  // Delete Notice
  const deleteNotice = async (id) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    if (supabaseService.isConfigured()) {
      supabaseService.deleteNotice(id).catch(console.warn);
    }
  };

  // Toggle Read Status
  const toggleRead = (id) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, is_read: !n.is_read } : n));
  };

  // Reset to Sample Data
  const resetToSampleData = () => {
    setNotices(SAMPLE_NOTICES);
    localStorage.setItem('campus_pulse_notices', JSON.stringify(SAMPLE_NOTICES));
  };

  // Clear all notices
  const clearAllNotices = () => {
    setNotices([]);
    localStorage.removeItem('campus_pulse_notices');
  };

  // Computed Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const urgentCount = notices.filter(n => n.priority === 'Urgent').length;
    const upcomingEventsCount = notices.filter(n => 
      ['Events', 'Sports', 'Cultural'].includes(n.category) || n.priority === 'Upcoming'
    ).length;
    
    // Pending Deadlines
    const pendingDeadlines = notices.filter(n => 
      n.is_deadline || 
      n.category === 'Examination' || 
      /deadline|due|submission/i.test(n.title + ' ' + n.description)
    );

    // Deadlines within next 24 hours
    const deadlinesWithin24h = notices.filter(n => {
      if (!n.event_date || n.event_date === 'Not specified') return false;
      const d = new Date(n.event_date);
      if (isNaN(d.getTime())) return false;
      const diffHours = (d - now) / (1000 * 60 * 60);
      return diffHours >= -4 && diffHours <= 24; // recent or coming up in next 24h
    });

    return {
      total: notices.length,
      urgent: urgentCount,
      upcomingEvents: upcomingEventsCount,
      pendingDeadlines: pendingDeadlines.length,
      deadlinesWithin24h
    };
  }, [notices]);

  return (
    <NoticeContext.Provider value={{
      notices,
      isLoading,
      lastSyncTime,
      stats,
      addNotice,
      updateNotice,
      deleteNotice,
      toggleRead,
      resetToSampleData,
      clearAllNotices
    }}>
      {children}
    </NoticeContext.Provider>
  );
};

export const useNotices = () => {
  const ctx = useContext(NoticeContext);
  if (!ctx) throw new Error('useNotices must be used within a NoticeProvider');
  return ctx;
};
