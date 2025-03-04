import { extendTheme } from '@mui/joy/styles';

export default extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#F0F7FF',
          100: '#C2E0FF',
          200: '#99CCF3',
          300: '#66B2FF',
          400: '#3399FF',
          500: '#007FFF',
          600: '#0072E5',
          700: '#0059B2',
          800: '#004C99',
          900: '#003A75',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: '#E2EDF8',
          100: '#CEE0F3',
          200: '#91B9E3',
          300: '#5090D3',
          400: '#265D97',
          500: '#1E4976',
          600: '#173A5E',
          700: '#132F4C',
          800: '#001E3C',
          900: '#0A1929',
        },
        background: {
          body: '#0A1929',
          surface: '#001E3C',
        },
      },
    },
  },
  fontFamily: {
    display: "'Inter', var(--joy-fontFamily-fallback)",
    body: "'Inter', var(--joy-fontFamily-fallback)",
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: '8px',
          transition: 'all 0.2s ease-in-out',
          ...(ownerState.size === 'lg' && {
            fontWeight: 600,
          }),
        }),
      },
    },
    JoyInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    JoyCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: 'var(--joy-shadowRing, 0 0 #000), 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        },
      },
    },
    JoySheet: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
  cssVarPrefix: 'dental',
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  shadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
}); 