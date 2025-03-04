import React, { createContext, useContext, useEffect, useState } from 'react';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import theme from '../styles/theme';

interface ColorSchemeContextType {
  toggleColorScheme: () => void;
  mode: 'light' | 'dark';
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export function useColorSchemeContext() {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
}

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleColorScheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <ColorSchemeContext.Provider value={{ toggleColorScheme, mode }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CssVarsProvider theme={theme} defaultMode="system">
      <ColorSchemeProvider>{children}</ColorSchemeProvider>
    </CssVarsProvider>
  );
} 