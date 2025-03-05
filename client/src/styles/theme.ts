import { createTheme, alpha } from '@mui/material/styles';
import type { CustomTheme, CustomThemeOptions } from '@styles/theme';

// Custom color definitions
const colors = {
  primary: {
    lighter: '#E3F2FD',
    light: '#42a5f5',
    main: '#1976d2',
    dark: '#1565c0',
    darker: '#0D47A1',
    contrastText: '#ffffff',
  },
  secondary: {
    lighter: '#F3E5F5',
    light: '#ba68c8',
    main: '#9c27b0',
    dark: '#7b1fa2',
    darker: '#4A148C',
    contrastText: '#ffffff',
  },
  success: {
    lighter: '#E8F5E9',
    light: '#4caf50',
    main: '#2e7d32',
    dark: '#1b5e20',
    darker: '#1B5E20',
    contrastText: '#ffffff',
  },
  error: {
    lighter: '#FFEBEE',
    light: '#ef5350',
    main: '#d32f2f',
    dark: '#c62828',
    darker: '#B71C1C',
    contrastText: '#ffffff',
  },
  warning: {
    lighter: '#FFF3E0',
    light: '#ff9800',
    main: '#ed6c02',
    dark: '#e65100',
    darker: '#E65100',
    contrastText: '#ffffff',
  },
  info: {
    lighter: '#E1F5FE',
    light: '#03a9f4',
    main: '#0288d1',
    dark: '#01579b',
    darker: '#01579B',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Custom breakpoints
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

// Custom spacing
const spacing = 8;

// Define the shadow array type
type ShadowArray = [
  'none',
  string, string, string, string, string,
  string, string, string, string, string,
  string, string, string, string, string,
  string, string, string, string, string,
  string, string, string, string
];

// Create a full shadow array with 25 elements
const createShadowArray = (baseShadows: string[]): ShadowArray => {
  // Make sure we have exactly 25 elements
  const fullArray = [...baseShadows];
  while (fullArray.length < 25) {
    fullArray.push('none');
  }
  return fullArray as ShadowArray;
};

// Custom shadows for light mode
const lightShadowsBase = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
  '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
  '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
];

// Custom shadows for dark mode
const darkShadowsBase = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.3),0px 1px 1px 0px rgba(0,0,0,0.24),0px 1px 3px 0px rgba(0,0,0,0.22)',
  '0px 3px 1px -2px rgba(0,0,0,0.3),0px 2px 2px 0px rgba(0,0,0,0.24),0px 1px 5px 0px rgba(0,0,0,0.22)',
  '0px 3px 3px -2px rgba(0,0,0,0.3),0px 3px 4px 0px rgba(0,0,0,0.24),0px 1px 8px 0px rgba(0,0,0,0.22)',
  '0px 2px 4px -1px rgba(0,0,0,0.3),0px 4px 5px 0px rgba(0,0,0,0.24),0px 1px 10px 0px rgba(0,0,0,0.22)',
  '0px 3px 5px -1px rgba(0,0,0,0.3),0px 5px 8px 0px rgba(0,0,0,0.24),0px 1px 14px 0px rgba(0,0,0,0.22)',
];

const lightShadows = createShadowArray(lightShadowsBase);
const darkShadows = createShadowArray(darkShadowsBase);

// Create theme options based on mode
export const createThemeOptions = (mode: 'light' | 'dark'): CustomThemeOptions => ({
  mode,
  palette: {
    mode,
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    grey: colors.grey,
    background: {
      default: mode === 'light' ? colors.grey[100] : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? colors.grey[900] : '#ffffff',
      secondary: mode === 'light' ? colors.grey[600] : colors.grey[400],
      disabled: mode === 'light' ? colors.grey[400] : colors.grey[600],
    },
    divider: mode === 'light' ? colors.grey[200] : colors.grey[700],
    action: {
      active: mode === 'light' ? colors.grey[600] : colors.grey[400],
      hover: mode === 'light' 
        ? alpha(colors.grey[600], 0.04)
        : alpha(colors.grey[400], 0.08),
      selected: mode === 'light'
        ? alpha(colors.primary.main, 0.08)
        : alpha(colors.primary.main, 0.16),
      disabled: mode === 'light' ? colors.grey[300] : colors.grey[700],
      disabledBackground: mode === 'light' ? colors.grey[200] : colors.grey[800],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints,
  spacing,
  shadows: mode === 'light' ? lightShadows : darkShadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
        },
        body: {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
        },
        '#root': {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          '&:hover': {
            backgroundColor: mode === 'light'
              ? alpha(colors.primary.main, 0.04)
              : alpha(colors.primary.main, 0.12),
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? colors.primary.main : colors.primary.light,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light'
            ? '0px 2px 4px rgba(0, 0, 0, 0.05)'
            : '0px 2px 4px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: mode === 'light'
              ? '0px 4px 8px rgba(0, 0, 0, 0.1)'
              : '0px 4px 8px rgba(0, 0, 0, 0.25)',
          },
          [`${mode === 'dark'} &`]: {
            backgroundImage: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          [`${mode === 'dark'} &`]: {
            backgroundImage: 'none',
          },
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0px 2px 4px rgba(0, 0, 0, 0.05)'
            : '0px 2px 4px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: mode === 'light' ? colors.grey[200] : colors.grey[700],
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${mode === 'light' ? colors.grey[200] : colors.grey[700]}`,
        },
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'light' ? colors.grey[50] : colors.grey[900],
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: mode === 'light' ? colors.success.lighter : alpha(colors.success.darker, 0.3),
          color: mode === 'light' ? colors.success.darker : colors.success.lighter,
        },
        standardError: {
          backgroundColor: mode === 'light' ? colors.error.lighter : alpha(colors.error.darker, 0.3),
          color: mode === 'light' ? colors.error.darker : colors.error.lighter,
        },
        standardWarning: {
          backgroundColor: mode === 'light' ? colors.warning.lighter : alpha(colors.warning.darker, 0.3),
          color: mode === 'light' ? colors.warning.darker : colors.warning.lighter,
        },
        standardInfo: {
          backgroundColor: mode === 'light' ? colors.info.lighter : alpha(colors.info.darker, 0.3),
          color: mode === 'light' ? colors.info.darker : colors.info.lighter,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: mode === 'light' ? colors.primary.lighter : colors.primary.darker,
            color: mode === 'light' ? colors.primary.darker : colors.primary.lighter,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: mode === 'light' ? colors.secondary.lighter : colors.secondary.darker,
            color: mode === 'light' ? colors.secondary.darker : colors.secondary.lighter,
          },
          '&.MuiChip-colorError': {
            backgroundColor: mode === 'light' ? colors.error.lighter : colors.error.darker,
            color: mode === 'light' ? colors.error.darker : colors.error.lighter,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
          backgroundColor: mode === 'light'
            ? alpha(colors.grey[900], 0.9)
            : alpha(colors.grey[700], 0.9),
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            transitionDuration: '300ms',
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: mode === 'dark' ? colors.primary.main : colors.primary.main,
                opacity: 1,
                border: 0,
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: colors.primary.main,
              border: '6px solid #fff',
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
              color: mode === 'light' ? colors.grey[100] : colors.grey[600],
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: mode === 'light' ? 0.7 : 0.3,
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 22,
            height: 22,
          },
          '& .MuiSwitch-track': {
            borderRadius: 26 / 2,
            backgroundColor: mode === 'light' ? colors.grey[300] : colors.grey[700],
            opacity: 1,
          },
        },
      },
    },
  },
  status: {
    danger: colors.error.main,
  },
});

// Create the theme
const theme = createTheme(createThemeOptions('light')) as CustomTheme;

export default theme; 