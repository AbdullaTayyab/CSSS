import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  Flame, 
  RotateCcw, 
  Save, 
  X, 
  Copy,
  Info,
  Check,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotices } from '../context/NoticeContext';
import { geminiService } from '../services/geminiService';
import { CATEGORIES, PRIORITIES } from '../constants/categories';
import { PriorityBadge, CategoryBadge } from '../components/common/Badge';

const SAMPLE_PRESETS = [
  {
    label: 'Internal Exam (Prompt Example)',
    source: 'WhatsApp',
    text: 'All B.Tech students are informed that the internal examination will start on 5 November 2026 at 10 AM in Block A.'
  },
  {
    label: 'Urgent Placement Drive',
    source: 'Email',
    text: 'URGENT CIRCULAR: Microsoft and Amazon early bird recruitment registration closes strictly on 3 November 2026 at 11:59 PM. Submit your verified CV and 7th semester marksheet at the T&P Cell Portal.'
  },
  {
    label: 'Annual Hackathon Fest',
    source: 'WhatsApp',
    text: 'Hey everyone! HackPulse 2026 technical hackathon will be hosted on 12 November 2026 starting 9:00 AM in the Central Auditorium. Cash prizes worth $5,000!'
  },
  {
    label: 'Notice with Missing Details',
    source: 'Notice Board',
    text: 'The guest lecture on Cloud Architecture by AWS Solutions Architect has been postponed to next week. New timings will be notified later.'
  }
];

export const AddNewNotice = ({ onNoticeAdded, editingNotice, onCancelEdit }) => {
  const { settings } = useAuth();
  const { addNotice, updateNotice } = useNotices();

  const [rawText, setRawText] = useState(editingNotice?.original_text || '');
  const [source, setSource] = useState(editingNotice?.source || 'WhatsApp');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionSource, setExtractionSource] = useState(null); // 'gemini-live' | 'demo-mode'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Extracted Form State
  const [formData, setFormData] = useState({
    title: editingNotice?.title || '',
    description: editingNotice?.description || '',
    category: editingNotice?.category || 'General',
    priority: editingNotice?.priority || 'Normal',
    event_date: editingNotice?.event_date || 'Not specified',
    event_time: editingNotice?.event_time || 'Not specified',
    venue: editingNotice?.venue || 'Not specified',
    is_ambiguous_date: Boolean(editingNotice?.is_ambiguous_date),
    is_deadline: Boolean(editingNotice?.is_deadline)
  });

  const [hasExtracted, setHasExtracted] = useState(Boolean(editingNotice));

  // If editing an existing notice
  useEffect(() => {
    if (editingNotice) {
      setRawText(editingNotice.original_text || '');
      setSource(editingNotice.source || 'WhatsApp');
      setFormData({
        title: editingNotice.title,
        description: editingNotice.description,
        category: editingNotice.category,
        priority: editingNotice.priority,
        event_date: editingNotice.event_date,
        event_time: editingNotice.event_time,
        venue: editingNotice.venue,
        is_ambiguous_date: false,
        is_deadline: editingNotice.is_deadline || editingNotice.priority === 'Urgent'
      });
      setHasExtracted(true);
    }
  }, [editingNotice]);

  // AI Extraction Trigger
  const handleExtractWithAI = async () => {
    if (!rawText.trim()) {
      setErrorMsg('Please paste or write some announcement message first.');
      return;
    }

    setErrorMsg('');
    setIsExtracting(true);
    setSuccessMsg('');

    try {
      const res = await geminiService.extractNotice(rawText, settings.ai?.customApiKey);
      if (res && res.data) {
        const d = res.data;
        setFormData({
          title: d.title || 'Untitled Notice',
          description: d.description || rawText,
          category: CATEGORIES.includes(d.category) ? d.category : 'General',
          priority: PRIORITIES.includes(d.priority) ? d.priority : 'Normal',
          event_date: d.event_date || 'Not specified',
          event_time: d.event_time || 'Not specified',
          venue: d.venue || 'Not specified',
          is_ambiguous_date: Boolean(d.is_ambiguous_date),
          is_deadline: d.priority === 'Urgent' || /deadline|submission|due/i.test(d.title + ' ' + d.description)
        });
        setExtractionSource(res.source);
        setHasExtracted(true);
      } else {
        throw new Error('AI could not parse the text format.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to extract information. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Form Field Change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Preset button clicked
  const handlePresetSelect = (preset) => {
    setRawText(preset.text);
    setSource(preset.source);
    setErrorMsg('');
  };

  // Save Notice Handler
  const handleSaveNotice = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrorMsg('Notice Title is required.');
      return;
    }

    if (!formData.description.trim()) {
      setErrorMsg('Notice Description is required.');
      return;
    }

    try {
      if (editingNotice) {
        await updateNotice(editingNotice.id, {
          ...formData,
          original_text: rawText,
          source
        });
        setSuccessMsg('Notice updated successfully!');
        if (onCancelEdit) setTimeout(onCancelEdit, 900);
      } else {
        await addNotice({
          ...formData,
          original_text: rawText,
          source
        });
        setSuccessMsg('Notice saved and added to your dashboard!');
        // Reset form
        setTimeout(() => {
          setRawText('');
          setHasExtracted(false);
          setSuccessMsg('');
          if (onNoticeAdded) onNoticeAdded();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg('Error saving notice: ' + err.message);
    }
  };

  // Cancel Handler
  const handleCancel = () => {
    if (editingNotice && onCancelEdit) {
      onCancelEdit();
    } else {
      setRawText('');
      setHasExtracted(false);
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Information Extraction</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {editingNotice ? 'Edit Notice' : 'Add New Notice with Gemini AI'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Paste raw messages from WhatsApp groups, emails or circulars. Gemini extracts title, dates, venues, categories and priorities automatically without hallucinating missing data.
            </p>
          </div>

          {extractionSource && (
            <div className="shrink-0">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                extractionSource === 'gemini-live' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                {extractionSource === 'gemini-live' ? 'Extracted via Gemini 1.5' : 'Extracted via Smart Demo Parser'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Preset Quick-Test Buttons */}
      {!editingNotice && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            ⚡ Quick-Test Presets (Click to Paste Instant Samples):
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium border border-slate-200 dark:border-slate-800 shadow-2xs transition-all hover:scale-[1.01]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Raw Unstructured Text Input */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="raw-text" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Step 1: Paste Unstructured College Text</span>
            <span className="text-rose-500">*</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Source:</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
              <option value="Notice Board">Notice Board</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            id="raw-text"
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your WhatsApp message, email or college announcement here...&#10;&#10;e.g.: 'All B.Tech students are informed that the internal examination will start on 5 November 2026 at 10 AM in Block A.'"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/60 p-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all resize-y"
          />
        </div>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Button: Extract Information with AI */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-400">
            {rawText.length} characters entered
          </span>

          <div className="flex items-center gap-2">
            {rawText && (
              <button
                type="button"
                onClick={() => setRawText('')}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Clear Text
              </button>
            )}

            <button
              type="button"
              onClick={handleExtractWithAI}
              disabled={isExtracting || !rawText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
              <span>
                {isExtracting ? 'Extracting Information with AI...' : 'Extract Information with AI'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Extracted Information & Editable Review Form */}
      {hasExtracted && (
        <form onSubmit={handleSaveNotice} className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-card space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Step 2: Review & Edit Extracted Information</span>
                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Ready to verify
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can adjust any field below before committing to the campus database.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <PriorityBadge priority={formData.priority} />
              <CategoryBadge category={formData.category} />
            </div>
          </div>

          {/* Ambiguous Date or Missing Field Warning Alert (Requirement: Ask user to verify ambiguous dates) */}
          {(formData.is_ambiguous_date || formData.event_date === 'Not specified' || formData.venue === 'Not specified') && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Verification Recommended:</span>
              </div>
              <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 space-y-0.5 pl-1">
                {formData.event_date === 'Not specified' && (
                  <li>No specific date was detected in the text. Marked as "Not specified".</li>
                )}
                {formData.is_ambiguous_date && (
                  <li>The date extracted may be relative or ambiguous. Please verify the exact calendar date below.</li>
                )}
                {formData.venue === 'Not specified' && (
                  <li>Venue was not explicitly mentioned. Please provide the room or hall if known.</li>
                )}
              </ul>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Notice Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Internal Examination Schedule"
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Priority Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                Priority Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {PRIORITIES.map(pri => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
            </div>

            {/* Event Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Event / Deadline Date
              </label>
              <input
                type="text"
                value={formData.event_date}
                onChange={(e) => handleChange('event_date', e.target.value)}
                placeholder="YYYY-MM-DD or e.g. 5 November 2026"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>

            {/* Event Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                Event Time
              </label>
              <input
                type="text"
                value={formData.event_time}
                onChange={(e) => handleChange('event_time', e.target.value)}
                placeholder="e.g. 10:00 AM"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>

            {/* Venue */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Venue / Location
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                placeholder="e.g. Block A, Exam Center or Online Portal"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Summarized Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Buttons: Save & Cancel */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>{editingNotice ? 'Update Notice' : 'Save Notice to Dashboard'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
