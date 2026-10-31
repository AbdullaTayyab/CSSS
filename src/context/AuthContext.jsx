import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_PROFILE = {
  name: 'Alex Chen',
  college: 'Apex Institute of Technology',
  department: 'Computer Science & Engineering',
  year: '3rd Year (Semester V)',
  email: 'alex.chen@campus.edu',
  rollNumber: 'CS2024-042',
  avatar: 'AC'
};

const DEFAULT_SETTINGS = {
  theme: 'light', // 'light' | 'dark' | 'system'
  notifications: {
    browserAlerts: true,
    urgentAlerts: true,
    deadlineReminders: true,
    soundAlerts: false
  },
  ai: {
    customApiKey: '',
    forceDemoMode: false
  },
  defaultFilter: 'All'
};

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_pulse_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_pulse_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply dark mode to document HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Persist Profile
  useEffect(() => {
    try {
      localStorage.setItem('campus_pulse_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  }, [profile]);

  // Persist Settings
  useEffect(() => {
    try {
      localStorage.setItem('campus_pulse_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }, [settings]);

  const updateProfile = (updates) => {
    setProfile(prev => ({
      ...prev,
      ...updates,
      avatar: (updates.name || prev.name).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }));
  };

  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
  };

  return (
    <AuthContext.Provider value={{
      profile,
      settings,
      updateProfile,
      updateSettings,
      resetProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
