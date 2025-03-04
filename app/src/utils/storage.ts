// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
} as const;

// Storage prefix to avoid conflicts
const STORAGE_PREFIX = 'dental_';

// Get prefixed key
const getPrefixedKey = (key: keyof typeof STORAGE_KEYS): string => {
  return `${STORAGE_PREFIX}${STORAGE_KEYS[key]}`;
};

// Set item in local storage
export const setStorageItem = <T>(key: keyof typeof STORAGE_KEYS, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(getPrefixedKey(key), serializedValue);
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

// Get item from local storage
export const getStorageItem = <T>(key: keyof typeof STORAGE_KEYS): T | null => {
  try {
    const item = localStorage.getItem(getPrefixedKey(key));
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return null;
  }
};

// Remove item from local storage
export const removeStorageItem = (key: keyof typeof STORAGE_KEYS): void => {
  try {
    localStorage.removeItem(getPrefixedKey(key));
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};

// Clear all items from local storage with our prefix
export const clearStorage = (): void => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Check if storage is available
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = `${STORAGE_PREFIX}test`;
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Storage event listener for cross-tab synchronization
export const addStorageListener = (callback: (event: StorageEvent) => void): void => {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith(STORAGE_PREFIX)) {
      callback(event);
    }
  });
};

// Remove storage event listener
export const removeStorageListener = (callback: (event: StorageEvent) => void): void => {
  window.removeEventListener('storage', callback);
};

// Get all storage items with our prefix
export const getAllStorageItems = (): Record<string, any> => {
  const items: Record<string, any> = {};
  
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          items[key.replace(STORAGE_PREFIX, '')] = JSON.parse(value);
        }
      }
    });
  } catch (error) {
    console.error('Error getting all localStorage items:', error);
  }
  
  return items;
};

// Set multiple storage items at once
export const setMultipleStorageItems = (items: Record<keyof typeof STORAGE_KEYS, any>): void => {
  try {
    Object.entries(items).forEach(([key, value]) => {
      setStorageItem(key as keyof typeof STORAGE_KEYS, value);
    });
  } catch (error) {
    console.error('Error setting multiple localStorage items:', error);
  }
};

// Get storage usage information
export const getStorageInfo = (): { used: number; total: number; percentage: number } => {
  const storageEstimate = {
    used: 0,
    total: 5 * 1024 * 1024, // Default browser storage limit is usually 5MB
    percentage: 0,
  };

  try {
    let totalSize = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length * 2; // UTF-16 characters are 2 bytes each
        }
      }
    });

    storageEstimate.used = totalSize;
    storageEstimate.percentage = (totalSize / storageEstimate.total) * 100;
  } catch (error) {
    console.error('Error calculating storage usage:', error);
  }

  return storageEstimate;
}; 