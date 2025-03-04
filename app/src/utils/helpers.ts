// Format date to YYYY-MM-DD
export const formatSimpleDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format time to HH:mm
export const formatSimpleTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toTimeString().slice(0, 5);
};

// Format date and time to a human-readable string
export const formatSimpleDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString();
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

// Get user's full name
export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

// Get user's initials
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: Date | string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Generate random color based on string
export const stringToColor = (string: string): string => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// Deep clone an object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

// Throttle function
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastRun = 0;

  return (...args: Parameters<F>): void => {
    if (timeoutId) {
      return;
    }

    const now = Date.now();

    if (now - lastRun >= waitFor) {
      func(...args);
      lastRun = now;
    } else {
      timeoutId = setTimeout(() => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        func(...args);
        lastRun = Date.now();
        timeoutId = undefined;
      }, waitFor - (now - lastRun));
    }
  };
};

// Sort array of objects by key
export const sortByKey = <T>(array: T[], key: keyof T, ascending: boolean = true): T[] => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
};

// Group array of objects by key
export const groupByKey = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    return {
      ...groups,
      [value]: [...(groups[value] || []), item],
    };
  }, {} as Record<string, T[]>);
};

// Check if object is empty
export const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}; 