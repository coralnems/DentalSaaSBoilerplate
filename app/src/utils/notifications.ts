import { SnackbarProps } from '@mui/joy/Snackbar';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Notification interface
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
  autoHideDuration?: number;
  action?: React.ReactNode;
}

// Default notification settings
const DEFAULT_AUTO_HIDE_DURATION = 5000;
const MAX_NOTIFICATIONS = 3;

// Notification queue
let notificationQueue: Notification[] = [];
let activeNotifications: Notification[] = [];

// Notification callbacks
type NotificationCallback = (notification: Notification) => void;
const callbacks: NotificationCallback[] = [];

// Subscribe to notifications
export const subscribeToNotifications = (callback: NotificationCallback): () => void => {
  callbacks.push(callback);
  return () => {
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  };
};

// Notify all subscribers
const notifySubscribers = (notification: Notification) => {
  callbacks.forEach((callback) => callback(notification));
};

// Generate unique ID for notifications
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Process notification queue
const processQueue = () => {
  while (activeNotifications.length < MAX_NOTIFICATIONS && notificationQueue.length > 0) {
    const notification = notificationQueue.shift();
    if (notification) {
      activeNotifications.push(notification);
      notifySubscribers(notification);
    }
  }
};

// Remove notification
export const removeNotification = (id: string) => {
  activeNotifications = activeNotifications.filter((n) => n.id !== id);
  processQueue();
};

// Show notification
export const showNotification = (
  message: string,
  type: NotificationType = 'info',
  options: Partial<Omit<Notification, 'id' | 'message' | 'type'>> = {}
) => {
  const notification: Notification = {
    id: generateId(),
    message,
    type,
    autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
    ...options,
  };

  if (activeNotifications.length < MAX_NOTIFICATIONS) {
    activeNotifications.push(notification);
    notifySubscribers(notification);
  } else {
    notificationQueue.push(notification);
  }

  // Auto remove notification after duration
  if (notification.autoHideDuration) {
    setTimeout(() => {
      removeNotification(notification.id);
    }, notification.autoHideDuration);
  }

  return notification.id;
};

// Success notification
export const showSuccess = (message: string, options?: Partial<Omit<Notification, 'id' | 'message' | 'type'>>) => {
  return showNotification(message, 'success', options);
};

// Error notification
export const showError = (message: string, options?: Partial<Omit<Notification, 'id' | 'message' | 'type'>>) => {
  return showNotification(message, 'error', options);
};

// Warning notification
export const showWarning = (message: string, options?: Partial<Omit<Notification, 'id' | 'message' | 'type'>>) => {
  return showNotification(message, 'warning', options);
};

// Info notification
export const showInfo = (message: string, options?: Partial<Omit<Notification, 'id' | 'message' | 'type'>>) => {
  return showNotification(message, 'info', options);
};

// Clear all notifications
export const clearNotifications = () => {
  activeNotifications = [];
  notificationQueue = [];
};

// Get notification color based on type
export const getNotificationColor = (type: NotificationType): SnackbarProps['color'] => {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'info':
      return 'primary';
  }
};

// Get active notifications
export const getActiveNotifications = (): Notification[] => {
  return [...activeNotifications];
};

// Get queued notifications
export const getQueuedNotifications = (): Notification[] => {
  return [...notificationQueue];
}; 