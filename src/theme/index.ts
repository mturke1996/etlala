import { createTheme, ThemeOptions } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

// ═══════════════════════════════════════════════════════════
// ETLALA Brand Colors - Extracted from Official Logo
// Logo: Olive green architecture with arches + cream text
// Primary: Deep Olive Green (#4a5d4a)
// Accent: Warm Cream (#c8c0b0)
// ═══════════════════════════════════════════════════════════
const etlalaColors = {
  light: {
    primary: {
      main: '#4a5d4a',
      light: '#6b7f6b',
      dark: '#364036',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b7e6a',
      light: '#a99b87',
      dark: '#6e6352',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f3ef',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3a2d',
      secondary: '#6b7b6b',
    },
  },
  dark: {
    primary: {
      main: '#7a9a7a',
      light: '#9ab89a',
      dark: '#5a7a5a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c8c0b0',
      light: '#e0dbd0',
      dark: '#a89e8e',
      contrastText: '#1a1f1a',
    },
    background: {
      default: '#161b16',
      paper: '#1e251e',
    },
    text: {
      primary: '#e8e5df',
      secondary: '#b0b8a8',
    },
  },
};

// Cache the created theme to avoid recreation
let cachedTheme: ReturnType<typeof createTheme> | null = null;
let cachedMode: ThemeMode | null = null;

export const createAppTheme = (mode: ThemeMode = 'light') => {
  // Return cached theme if mode hasn't changed
  if (cachedTheme && cachedMode === mode) {
    return cachedTheme;
  }

  const palette = etlalaColors[mode];
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    direction: 'rtl',
    palette: {
      mode,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background,
      text: palette.text,
      divider: isDark ? 'rgba(200, 192, 176, 0.1)' : 'rgba(74, 93, 74, 0.07)',
      success: { main: '#0d9668', light: '#34d399', dark: '#065f46', contrastText: '#fff' },
      error: { main: '#d64545', light: '#ef4444', dark: '#991b1b', contrastText: '#fff' },
      warning: { main: '#e6a817', light: '#fbbf24', dark: '#92400e', contrastText: '#2a3a2a' },
      info: { main: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8', contrastText: '#fff' },
    },
    typography: {
      fontFamily: "'Cairo', 'Tajawal', 'Outfit', sans-serif",
      h1: { fontWeight: 900, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 800, letterSpacing: '-0.01em' },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { fontWeight: 500 },
      body2: { fontWeight: 400 },
      button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0.3 },
      caption: { fontWeight: 500 },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#3a4a3a #161b16' : '#c8c0b0 #f5f3ef',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: 'transparent',
              width: 5,
              height: 5,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 10,
              backgroundColor: isDark ? '#3a4a3a' : '#c8c0b0',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: isDark ? '#4a5d4a' : '#8b7e6a',
            },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '10px 24px',
            boxShadow: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: 0.3,
            transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: isDark
                ? '0 6px 20px rgba(0,0,0,0.35)'
                : '0 6px 20px rgba(74, 93, 74, 0.22)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'scale(0.97)',
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            background: isDark
              ? 'linear-gradient(135deg, #5a7a5a 0%, #4a6a4a 100%)'
              : 'linear-gradient(135deg, #4a5d4a 0%, #364036 100%)',
            color: '#ffffff',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #6b8f6b 0%, #5a7a5a 100%)'
                : 'linear-gradient(135deg, #364036 0%, #2a3028 100%)',
            },
          },
          containedError: {
            background: 'linear-gradient(135deg, #d64545 0%, #b83b3b 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #b83b3b 0%, #9a2f2f 100%)',
            },
          },
          containedSuccess: {
            background: 'linear-gradient(135deg, #0d9668 0%, #065f46 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059652 0%, #047a42 100%)',
            },
          },
          outlinedPrimary: {
            borderColor: isDark ? 'rgba(122,154,122,0.5)' : 'rgba(74,93,74,0.35)',
            color: isDark ? '#9ab89a' : '#4a5d4a',
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              borderColor: isDark ? '#7a9a7a' : '#4a5d4a',
              backgroundColor: isDark ? 'rgba(122,154,122,0.1)' : 'rgba(74,93,74,0.06)',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(122,154,122,0.1)' : 'rgba(74,93,74,0.06)',
            },
          },
          sizeLarge: {
            padding: '13px 32px',
            fontSize: '1rem',
            borderRadius: '14px',
          },
          sizeSmall: {
            padding: '6px 14px',
            fontSize: '0.8rem',
            borderRadius: '10px',
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '10px',
            '&:hover': {
              transform: 'scale(1.08)',
              backgroundColor: isDark ? 'rgba(200,192,176,0.1)' : 'rgba(74,93,74,0.08)',
            },
            '&:active': {
              transform: 'scale(0.94)',
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '18px',
            boxShadow: isDark
              ? '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0,0,0,0.2)'
              : '0 2px 16px rgba(74, 93, 74, 0.07), 0 1px 3px rgba(0,0,0,0.04)',
            border: `1px solid ${isDark ? 'rgba(200, 192, 176, 0.07)' : 'rgba(74, 93, 74, 0.07)'}`,
            backgroundImage: 'none',
            transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            '&:hover': {
              boxShadow: isDark
                ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                : '0 8px 28px rgba(74, 93, 74, 0.12)',
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
            boxShadow: isDark
              ? '0 2px 12px rgba(0,0,0,0.4)'
              : '0 2px 12px rgba(74,93,74,0.08)',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '22px',
            boxShadow: isDark
              ? '0 25px 60px rgba(0,0,0,0.6)'
              : '0 25px 60px rgba(74,93,74,0.2)',
            backgroundImage: 'none',
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              transition: 'box-shadow 0.2s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#7a9a7a' : '#4a5d4a',
                borderWidth: '1.5px',
              },
              '&.Mui-focused': {
                boxShadow: isDark
                  ? '0 0 0 3px rgba(122,154,122,0.2)'
                  : '0 0 0 3px rgba(74,93,74,0.12)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            },
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.9rem',
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

      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            borderRadius: '10px',
            transition: 'all 0.2s ease',
          },
          filled: {
            '&:hover': {
              filter: 'brightness(1.08)',
            },
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(200,192,176,0.1)' : 'rgba(74,93,74,0.08)',
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 800,
            fontSize: '1rem',
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.8rem',
            backgroundColor: isDark ? '#364036' : '#2d3a2d',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          },
          arrow: {
            color: isDark ? '#364036' : '#2d3a2d',
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: '14px',
            fontWeight: 600,
          },
        },
      },

      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiAlert-root': {
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            },
          },
        },
      },

      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64,
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            margin: '2px 6px',
            transition: 'background 0.15s ease',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(122,154,122,0.12)' : 'rgba(74,93,74,0.08)',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(122,154,122,0.18)' : 'rgba(74,93,74,0.1)',
              fontWeight: 700,
              '&:hover': {
                backgroundColor: isDark ? 'rgba(122,154,122,0.24)' : 'rgba(74,93,74,0.14)',
              },
            },
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            height: 6,
          },
          bar: {
            borderRadius: 10,
          },
        },
      },

      MuiCollapse: {
        styleOverrides: {
          root: {
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
  };

  cachedTheme = createTheme(themeOptions);
  cachedMode = mode;
  return cachedTheme;
};
