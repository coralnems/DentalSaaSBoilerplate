import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { CustomTheme } from '@styles/theme';
import { createThemeOptions } from '@styles/theme';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Get the initial theme from Redux state
  const { darkMode } = useSelector((state: RootState) => state.ui);
  const initialMode = darkMode ? 'dark' : 'light';
  
  // Set up local state for theme mode
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  // Update the local state when Redux state changes
  useEffect(() => {
    setMode(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Create theme based on current mode
  const theme = React.useMemo(
    () => createTheme(createThemeOptions(mode)) as CustomTheme,
    [mode]
  );

  // Function to toggle theme mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Context value
  const contextValue = React.useMemo(
    () => ({
      mode,
      toggleTheme,
      setMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 