import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  Key, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  Trash2, 
  Download, 
  ExternalLink,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotices } from '../context/NoticeContext';
import { notificationService } from '../services/notificationService';
import { geminiService } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';
import { CATEGORIES } from '../constants/categories';

export const Settings = () => {
  const { settings, updateSettings } = useAuth();
  const { notices, resetToSampleData, clearAllNotices } = useNotices();

  const [apiKeyInput, setApiKeyInput] = useState(settings.ai?.customApiKey || '');
  const [testResult, setTestResult] = useState(null);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [notifPermission, setNotifPermission] = useState(notificationService.getPermission());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Update notification permission status
  useEffect(() => {
    setNotifPermission(notificationService.getPermission());
  }, []);

  // Request browser notification permission
  const handleRequestNotification = async () => {
    const res = await notificationService.requestPermission();
    setNotifPermission(res);
    if (res === 'granted') {
      notificationService.sendNotification('Campus Pulse Notifications Active! 🔔', {
        body: 'You will receive alerts for upcoming examination cutoffs and urgent notices.'
      });
    }
  };

  // Test Gemini Key Connection
  const handleTestKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await geminiService.extractNotice(
        'Internal Examination starts on 5 November 2026 at 10 AM in Block A.',
        apiKeyInput
      );

      if (res && res.success) {
        setTestResult({
          success: true,
          source: res.source,
          message: res.source === 'gemini-live' 
            ? 'Connected to Gemini API successfully!' 
            : 'Tested successfully in Smart Demo Mode.'
        });
        updateSettings({
          ai: {
            ...settings.ai,
            customApiKey: apiKeyInput
          }
        });
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Connection failed: ' + (err.message || 'Check your key and try again.')
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  // Save Settings
  const handleSaveSettings = () => {
    updateSettings({
      ai: {
        ...settings.ai,
        customApiKey: apiKeyInput
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Export JSON
  const handleExportAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notices, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `campus_pulse_backup_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-card">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Application Settings & Integrations</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure appearance, browser push alerts, Gemini AI credentials and database syncing.
        </p>
      </div>

      {/* 1. Theme & Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Appearance & Theme</span>
        </h3>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor }
          ].map(themeOpt => {
            const Icon = themeOpt.icon;
            const isSelected = settings.theme === themeOpt.id;
            return (
              <button
                key={themeOpt.id}
                onClick={() => updateSettings({ theme: themeOpt.id })}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{themeOpt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. AI Engine & Gemini API Key Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Gemini AI Engine Configuration</span>
          </h3>

          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {apiKeyInput ? 'Live Gemini Configured' : 'Smart Demo Mode Active'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Campus Pulse supports both direct Google Gemini 1.5/2.5 Flash API and an offline high-accuracy deterministic demo parser. If no key is entered, the app runs in clearly-labelled demo mode with zero errors.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-500" />
            Google Gemini API Key (Optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy... (leave empty for intelligent demo mode)"
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleTestKey}
              disabled={isTestingKey}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shrink-0 transition-colors"
            >
              {isTestingKey ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Get your free Gemini API key from</span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
            >
              Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            testResult.success 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {testResult.success ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* 3. Browser Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-500" />
            <span>Notification & Reminder Preferences</span>
          </h3>

          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
            notifPermission === 'granted' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' 
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
          }`}>
            Browser Status: {notifPermission}
          </span>
        </div>

        {notifPermission !== 'granted' && (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Enable Browser Notifications
              </h4>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                Receive real-time alerts for 24-hour examination cutoffs and urgent campus broadcasts.
              </p>
            </div>
            <button
              onClick={handleRequestNotification}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shrink-0 shadow-sm hover:bg-indigo-500"
            >
              Allow Notifications
            </button>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {/* Urgent Alerts Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Urgent Notice Instant Notifications
              </span>
              <span className="text-[11px] text-slate-400">
                Trigger desktop alerts immediately when high-priority circulars arrive
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.urgentAlerts}
              onChange={(e) => updateSettings({
                notifications: { ...settings.notifications, urgentAlerts: e.target.checked }
              })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>

          {/* 24-Hour Deadline Reminders Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                24-Hour Countdown Reminders
              </span>
              <span className="text-[11px] text-slate-400">
                Highlight and warn about assignment submissions and exams within 24 hours
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.deadlineReminders}
              onChange={(e) => updateSettings({
                notifications: { ...settings.notifications, deadlineReminders: e.target.checked }
              })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>

      {/* 4. Database & Storage Architecture */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <span>Database & Cloud Architecture</span>
          </h3>

          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200">
            {supabaseService.isConfigured() ? 'Supabase Connected' : 'Local Persistence Active'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Notices are persistently stored in your browser's persistent storage. If Supabase credentials are provided in <code>.env</code>, seamless cloud PostgreSQL synchronization is automatically enabled.
        </p>

        {/* Data Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={resetToSampleData}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Reset Realistic Sample Notices</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export All (JSON)</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all notices?')) {
                  clearAllNotices();
                }
              }}
              className="px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {savedSuccess && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-4 h-4" /> Settings updated
          </span>
        )}
        <button
          onClick={handleSaveSettings}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 hover:scale-[1.01] transition-all"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};
