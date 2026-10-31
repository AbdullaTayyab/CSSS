export const CATEGORIES = [
  'Academic',
  'Examination',
  'Events',
  'Placement',
  'Sports',
  'Cultural',
  'General'
];

export const PRIORITIES = [
  'Urgent',
  'Upcoming',
  'Normal',
  'Expired'
];

export const CATEGORY_CONFIG = {
  Academic: {
    label: 'Academic',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800/60',
    calendarColor: '#6366f1',
    description: 'Courses, assignments, syllabus and lab updates'
  },
  Examination: {
    label: 'Examination',
    color: 'bg-rose-500',
    textColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800/60',
    calendarColor: '#f43f5e',
    description: 'Internal tests, midterms, semester exams and viva'
  },
  Events: {
    label: 'Events',
    color: 'bg-purple-500',
    textColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
    calendarColor: '#a855f7',
    description: 'Hackathons, technical symposiums, workshops and guest talks'
  },
  Placement: {
    label: 'Placement',
    color: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
    calendarColor: '#f59e0b',
    description: 'Company drives, internship alerts, interview schedules and resume deadlines'
  },
  Sports: {
    label: 'Sports',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    calendarColor: '#10b981',
    description: 'Inter-college tournaments, sports trials and athletics'
  },
  Cultural: {
    label: 'Cultural',
    color: 'bg-pink-500',
    textColor: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/40',
    borderColor: 'border-pink-200 dark:border-pink-800/60',
    calendarColor: '#ec4899',
    description: 'Annual cultural festivals, music, drama and competitions'
  },
  General: {
    label: 'General',
    color: 'bg-slate-500',
    textColor: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    calendarColor: '#64748b',
    description: 'Holidays, administration notices and campus announcements'
  }
};

export const PRIORITY_CONFIG = {
  Urgent: {
    label: 'Urgent',
    textColor: 'text-rose-700 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800',
    dotColor: 'bg-rose-500',
    badgeClass: 'bg-rose-500 text-white dark:bg-rose-600'
  },
  Upcoming: {
    label: 'Upcoming',
    textColor: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
    badgeClass: 'bg-blue-500 text-white dark:bg-blue-600'
  },
  Normal: {
    label: 'Normal',
    textColor: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    badgeClass: 'bg-slate-500 text-white dark:bg-slate-600'
  },
  Expired: {
    label: 'Expired',
    textColor: 'text-zinc-600 dark:text-zinc-400',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800/60',
    borderColor: 'border-zinc-300 dark:border-zinc-700',
    dotColor: 'bg-zinc-400',
    badgeClass: 'bg-zinc-400 text-white dark:bg-zinc-600'
  }
};
