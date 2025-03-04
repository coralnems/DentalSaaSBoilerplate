import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notifications: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }[];
}

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    addNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
      }>
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      state.notifications.push({
        id,
        ...action.payload,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer; 