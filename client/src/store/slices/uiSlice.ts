import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define notification types
type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Define notification interface
interface Notification {
  id?: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

// Define UI state interface
interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
  loading: {
    [key: string]: boolean;
  };
  notifications: Notification[];
}

// Initial state
const initialState: UiState = {
  darkMode: localStorage.getItem('darkMode') === 'true' || false,
  sidebarOpen: localStorage.getItem('sidebarOpen') !== 'false',
  loading: {},
  notifications: []
};

// Create the UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', String(state.darkMode));
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      localStorage.setItem('sidebarOpen', String(state.sidebarOpen));
    },
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      const { key, isLoading } = action.payload;
      state.loading[key] = isLoading;
    },
    showNotification: (state, action: PayloadAction<Notification>) => {
      const id = Date.now().toString();
      state.notifications.push({
        ...action.payload,
        id
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    addNotification: (state, action: PayloadAction<{
      message: string;
      type: 'success' | 'error' | 'info' | 'warning';
    }>) => {
      const id = Date.now().toString();
      state.notifications.push({
        id,
        message: action.payload.message,
        type: action.payload.type
      });
    }
  },
});

// Export actions and reducer
export const {
  toggleDarkMode,
  toggleSidebar,
  setLoading,
  showNotification,
  removeNotification,
  clearNotifications,
  addNotification
} = uiSlice.actions;

export default uiSlice.reducer; 