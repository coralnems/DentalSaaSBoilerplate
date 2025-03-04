// Date format options
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  ISO: 'yyyy-MM-dd',
} as const;

// Time format options
export const TIME_FORMATS = {
  SHORT: 'h:mm a',
  MEDIUM: 'h:mm:ss a',
  LONG: 'h:mm:ss a z',
  ISO: 'HH:mm:ss',
} as const;

// DateTime format options
export const DATETIME_FORMATS = {
  SHORT: `${DATE_FORMATS.SHORT} ${TIME_FORMATS.SHORT}`,
  MEDIUM: `${DATE_FORMATS.MEDIUM} ${TIME_FORMATS.MEDIUM}`,
  LONG: `${DATE_FORMATS.LONG} ${TIME_FORMATS.LONG}`,
  ISO: `${DATE_FORMATS.ISO}T${TIME_FORMATS.ISO}`,
} as const;

// Format date to string
export const formatDate = (
  date: Date | string | number,
  format: keyof typeof DATE_FORMATS = 'MEDIUM'
): string => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat('en-US', getDateFormatOptions(format));
  return formatter.format(d);
};

// Format time to string
export const formatTime = (
  date: Date | string | number,
  format: keyof typeof TIME_FORMATS = 'SHORT'
): string => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat('en-US', getTimeFormatOptions(format));
  return formatter.format(d);
};

// Format datetime to string
export const formatDateTime = (
  date: Date | string | number,
  format: keyof typeof DATETIME_FORMATS = 'MEDIUM'
): string => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat('en-US', {
    ...getDateFormatOptions(format),
    ...getTimeFormatOptions(format),
  });
  return formatter.format(d);
};

// Get date format options
const getDateFormatOptions = (format: keyof typeof DATE_FORMATS): Intl.DateTimeFormatOptions => {
  switch (format) {
    case 'SHORT':
      return {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      };
    case 'MEDIUM':
      return {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
    case 'LONG':
      return {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      };
    case 'ISO':
      return {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };
  }
};

// Get time format options
const getTimeFormatOptions = (format: keyof typeof TIME_FORMATS): Intl.DateTimeFormatOptions => {
  switch (format) {
    case 'SHORT':
      return {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
    case 'MEDIUM':
      return {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
    case 'LONG':
      return {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        hour12: true,
      };
    case 'ISO':
      return {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
  }
};

// Parse date string
export const parseDate = (dateString: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string');
  }
  return date;
};

// Get start of day
export const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get end of day
export const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Get start of week (Sunday)
export const startOfWeek = (date: Date): Date => {
  const d = startOfDay(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
};

// Get end of week (Saturday)
export const endOfWeek = (date: Date): Date => {
  const d = endOfDay(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  return d;
};

// Get start of month
export const startOfMonth = (date: Date): Date => {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
};

// Get end of month
export const endOfMonth = (date: Date): Date => {
  const d = endOfDay(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d;
};

// Add days to date
export const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Subtract days from date
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

// Get difference in days between two dates
export const diffInDays = (date1: Date, date2: Date): number => {
  const d1 = startOfDay(date1);
  const d2 = startOfDay(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Check if date is in the past
export const isPast = (date: Date): boolean => {
  return date.getTime() < new Date().getTime();
};

// Check if date is in the future
export const isFuture = (date: Date): boolean => {
  return date.getTime() > new Date().getTime();
};

// Get relative time string (e.g., "2 hours ago", "in 3 days")
export const getRelativeTimeString = (date: Date): string => {
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInDays) > 0) {
    return formatter.format(diffInDays, 'day');
  }
  if (Math.abs(diffInHours) > 0) {
    return formatter.format(diffInHours, 'hour');
  }
  if (Math.abs(diffInMinutes) > 0) {
    return formatter.format(diffInMinutes, 'minute');
  }
  return formatter.format(diffInSeconds, 'second');
}; 