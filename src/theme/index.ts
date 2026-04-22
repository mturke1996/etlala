import { createTheme, ThemeOptions } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

// ═══════════════════════════════════════════════════════════
// PREMIUM SOFT MODERN UI - Design System
// Primary: Royal Blue (#4361EE)
// Background: Soft Cool Gray (#F7F9FC)
// Typography: Inter / Tajawal
// ═══════════════════════════════════════════════════════════
const premiumColors = {
  light: {
    primary: {
      main: '#4361EE',
      light: '#7B8DFA',
      dark: '#2E44A6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748B',
      light: '#94A3B8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
  },
  dark: {
    primary: {
      main: '#637DFF',
      light: '#8F9BFE',
      dark: '#3A55D4',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#94A3B8',
      light: '#CBD5E1',
      dark: '#64748B',
      contrastText: '#0F172A',
    },
    background: {
      default: '#0B0F19',
      paper: '#111827',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
    divider: '#1E293B',
  },
};

export const createAppTheme = (mode: ThemeMode = 'light') => {
  const palette = premiumColors[mode];
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    direction: 'rtl',
    palette: {
      mode,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background,
      text: palette.text,
      divider: palette.divider,
      success: { main: '#10B981', light: '#34D399', dark: '#059669', contrastText: '#fff' },
      error: { main: '#EF4444', light: '#F87171', dark: '#DC2626', contrastText: '#fff' },
      warning: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706', contrastText: '#fff' },
      info: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB', contrastText: '#fff' },
    },
    typography: {
      fontFamily: "'Inter', 'Tajawal', 'Cairo', sans-serif",
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
      body1: { fontWeight: 400, lineHeight: 1.6 },
      body2: { fontWeight: 400, lineHeight: 1.5 },
      button: { fontWeight: 600, textTransform: 'none' },
      caption: { fontWeight: 500 },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            color: palette.text.primary,
            scrollbarColor: isDark ? '#334155 #0B0F19' : '#CBD5E1 #F7F9FC',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: 'transparent',
              width: 6,
              height: 6,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: isDark ? '#334155' : '#CBD5E1',
            },
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: '14px',
            minHeight: 48,
            padding: '10px 24px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:active': {
              transform: 'scale(0.96)',
            },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDark 
                ? '0 8px 20px rgba(0, 0, 0, 0.4)' 
                : '0 8px 20px rgba(67, 97, 238, 0.15)',
              transform: 'translateY(-2px)',
            },
          },
          containedPrimary: {
            background: palette.primary.main,
            '&:hover': {
              background: palette.primary.dark,
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(67, 97, 238, 0.05)',
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '20px',
            boxShadow: isDark 
              ? '0 4px 24px rgba(0, 0, 0, 0.2)' 
              : '0 4px 24px rgba(149, 157, 165, 0.08)',
            border: `1px solid ${palette.divider}`,
            backgroundImage: 'none',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
            '&:hover': {
              boxShadow: isDark 
                ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                : '0 8px 32px rgba(149, 157, 165, 0.12)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.04)',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '24px',
            boxShadow: isDark 
              ? '0 25px 60px rgba(0,0,0,0.5)' 
              : '0 25px 60px rgba(0,0,0,0.1)',
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              transition: 'all 0.2s ease',
              '& fieldset': {
                border: 'none', // Remove default border
              },
              '&:hover': {
                backgroundColor: isDark ? '#334155' : '#E2E8F0',
              },
              '&.Mui-focused': {
                backgroundColor: isDark ? '#111827' : '#FFFFFF',
                boxShadow: isDark 
                  ? '0 0 0 2px #637DFF' 
                  : '0 0 0 2px #4361EE',
              },
            },
            '& .MuiInputBase-input': {
              padding: '14px 16px',
            },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },

      MuiBottomNavigation: {
        defaultProps: {
          showLabels: true,
        },
        styleOverrides: {
          root: {
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200,
            height: 'calc(70px + env(safe-area-inset-bottom, 0px))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            background: isDark
              ? 'rgba(15, 23, 42, 0.85)'
              : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'saturate(1.8) blur(20px)',
            WebkitBackdropFilter: 'saturate(1.8) blur(20px)',
            borderTop: `1px solid ${palette.divider}`,
            boxShadow: 'none',
          },
        },
      },

      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: palette.text.secondary,
            transition: 'all 0.2s ease',
            padding: '6px 0',
            '&.Mui-selected': {
              color: palette.primary.main,
            },
            '& .MuiSvgIcon-root': {
              fontSize: 24,
              marginBottom: 4,
              transition: 'all 0.2s ease',
            },
            '&.Mui-selected .MuiSvgIcon-root': {
              transform: 'translateY(-2px)',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            },
            '&.Mui-selected .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 600,
            },
            '&:active': {
              transform: 'scale(0.92)',
            },
          },
        },
      },

      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            border: `1px solid ${palette.divider}`,
            boxShadow: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600,
              color: palette.text.secondary,
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderBottom: `1px solid ${palette.divider}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontWeight: 500,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            '&:active': {
              transform: 'scale(0.9)',
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
