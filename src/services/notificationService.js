// Browser Notification Service for Campus Pulse

export const notificationService = {
  isSupported: () => {
    return 'Notification' in window;
  },

  getPermission: () => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  },

  requestPermission: async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  },

  sendNotification: (title, options = {}) => {
    if (!('Notification' in window)) return null;

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          ...options
        });

        notif.onclick = () => {
          window.focus();
          if (options.onClick) options.onClick();
        };

        return notif;
      } catch (err) {
        console.warn('Notification failed:', err);
      }
    }
    return null;
  },

  notifyUrgentNotice: (notice) => {
    return notificationService.sendNotification(`🚨 Urgent Notice: ${notice.title}`, {
      body: `${notice.category} • Date: ${notice.event_date || 'N/A'}\n${notice.description.slice(0, 120)}...`,
      tag: `notice-${notice.id}`
    });
  },

  notifyDeadlineApproaching: (notice, hoursLeft) => {
    return notificationService.sendNotification(`⏰ Deadline Approaching: ${notice.title}`, {
      body: `Due in approximately ${hoursLeft} hours (${notice.event_date} ${notice.event_time}). Venue/Portal: ${notice.venue}`,
      tag: `deadline-${notice.id}`
    });
  }
};
