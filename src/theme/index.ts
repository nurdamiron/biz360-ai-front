// src/theme/index.ts
import { PaletteMode, ThemeOptions } from '@mui/material';

// Определение токенов дизайна для светлой и темной темы
export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Светлая тема
          primary: {
            main: '#0085FF',
            light: '#4BA9FF',
            dark: '#0061B8',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#9966FF',
            light: '#B28DFF',
            dark: '#7A52CC',
            contrastText: '#FFFFFF',
          },
          error: {
            main: '#E53E3E',
            light: '#FC8181',
            dark: '#C53030',
          },
          warning: {
            main: '#DD6B20',
            light: '#F6AD55',
            dark: '#C05621',
          },
          info: {
            main: '#3182CE',
            light: '#63B3ED',
            dark: '#2C5282',
          },
          success: {
            main: '#38A169',
            light: '#68D391',
            dark: '#276749',
          },
          background: {
            default: '#F7FAFC',
            paper: '#FFFFFF',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // Темная тема
          primary: {
            main: '#339EFF',
            light: '#66B7FF',
            dark: '#006ACC',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#AD85FF',
            light: '#C2A3FF',
            dark: '#7A52CC',
            contrastText: '#FFFFFF',
          },
          error: {
            main: '#FC8181',
            light: '#FEB2B2',
            dark: '#C53030',
          },
          warning: {
            main: '#F6AD55',
            light: '#FBD38D',
            dark: '#C05621',
          },
          info: {
            main: '#63B3ED',
            light: '#90CDF4',
            dark: '#2C5282',
          },
          success: {
            main: '#68D391',
            light: '#9AE6B4',
            dark: '#276749',
          },
          background: {
            default: '#1A202C',
            paper: '#2D3748',
          },
          text: {
            primary: 'rgba(255, 255, 255, 0.87)',
            secondary: 'rgba(255, 255, 255, 0.6)',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        }),
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        outlined: {
          borderWidth: 1,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
          ...(mode === 'light'
            ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' }
            : { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)' }),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: '0',
          ...(mode === 'light'
            ? { boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.05)' }
            : { boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)' }),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        outlined: {
          borderWidth: 1,
          ...(mode === 'light'
            ? { borderColor: 'rgba(0, 0, 0, 0.12)' }
            : { borderColor: 'rgba(255, 255, 255, 0.12)' }),
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: '0.75rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          ...(mode === 'light'
            ? { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
            : { backgroundColor: 'rgba(255, 255, 255, 0.08)' }),
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default getDesignTokens;