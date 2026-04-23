import { createTheme, ThemeOptions } from '@mui/material/styles';
import { premiumTokens } from './tokens';

export type ThemeMode = 'light' | 'dark';

const { primary, primaryDark, background, paper, accent, text, textMuted } = premiumTokens;

const premiumColors = {
  light: {
    primary: {
      main: primary,
      light: '#4A5E50',
      dark: primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: accent,
      light: '#D4C9A3',
      dark: '#9A8B60',
      contrastText: text,
    },
    background: {
      default: background,
      paper: paper,
    },
    text: {
      primary: text,
      secondary: textMuted,
    },
    divider: 'rgba(31, 37, 33, 0.1)',
  },
  dark: {
    primary: {
      main: '#4A5E50',
      light: '#5D7366',
      dark: primary,
      contrastText: '#F7F7F5',
    },
    secondary: {
      main: accent,
      light: '#D4C9A3',
      dark: '#8A7D58',
      contrastText: text,
    },
    background: {
      default: '#121814',
      paper: '#1A221C',
    },
    /** نص فاتح دافئ — يندمج مع الأخضر الداكن دون بريق أبيض قاسٍ */
    text: {
      primary: '#F4F1EC',
      secondary: 'rgba(244, 241, 236, 0.64)',
    },
    divider: 'rgba(236, 235, 232, 0.12)',
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
      success: { main: primary, light: '#4A5E50', dark: primaryDark, contrastText: '#fff' },
      error: { main: '#B54747', light: '#D65555', dark: '#8F3838', contrastText: '#fff' },
      warning: { main: accent, light: '#D4C9A3', dark: '#9A8B60', contrastText: text },
      info: { main: primary, light: '#4A5E50', dark: primaryDark, contrastText: '#fff' },
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
            scrollbarColor: isDark ? '#3D4A42 #121814' : '#C5CAC7 #F7F7F5',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: 'transparent',
              width: 6,
              height: 6,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: isDark ? '#3D4A42' : '#C5CAC7',
            },
          },
          '#root': {
            backgroundColor: palette.background.default,
            color: palette.text.primary,
            minHeight: '100dvh',
          },
        },
      },

      MuiListItemText: {
        styleOverrides: {
          primary: { color: palette.text.primary },
          secondary: { color: palette.text.secondary },
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: { color: palette.text.secondary },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { color: palette.text.primary },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: { color: palette.text.primary },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: { color: palette.text.secondary },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: { color: palette.text.secondary },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { color: palette.text.secondary, '&.Mui-focused': { color: isDark ? palette.primary.light : primary } },
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
            transition: 'transform 0.12s ease, opacity 0.12s ease, background 0.2s ease, box-shadow 0.2s ease',
            '&:active': {
              transform: 'scale(0.97)',
              opacity: 0.96,
            },
            '@media (prefers-reduced-motion: reduce)': {
              '&:active': { transform: 'none' },
            },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDark ? '0 8px 20px rgba(0, 0, 0, 0.4)' : '0 4px 16px rgba(47, 62, 52, 0.18)',
            },
          },
          containedPrimary: {
            background: palette.primary.main,
            color: '#fff',
            '&:hover': {
              background: isDark ? palette.primary.light : premiumTokens.primaryDark,
            },
          },
          outlined: {
            borderWidth: '1.5px',
            borderColor: accent,
            color: isDark ? palette.text.primary : text,
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: isDark ? 'rgba(194, 178, 128, 0.12)' : 'rgba(194, 178, 128, 0.12)',
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '20px',
            boxShadow: isDark
              ? '0 4px 24px rgba(0, 0, 0, 0.25)'
              : '0 2px 8px rgba(31, 37, 33, 0.06), 0 1px 2px rgba(31, 37, 33, 0.04)',
            border: 'none',
            backgroundImage: 'none',
            transition: 'box-shadow 0.25s ease, transform 0.2s ease',
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(31, 37, 33, 0.06)',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '24px',
            boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 8px 32px rgba(31, 37, 33, 0.12)',
            color: palette.text.primary,
            backgroundColor: palette.background.paper,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { color: palette.text.primary } },
      },
      MuiDialogContent: {
        styleOverrides: { root: { color: palette.text.primary } },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              backgroundColor: isDark ? '#1A221C' : paper,
              transition: 'all 0.2s ease',
              '& fieldset': {
                border: '1px solid',
                borderColor: isDark ? 'rgba(236,235,232,0.1)' : 'rgba(31, 37, 33, 0.1)',
              },
              '&:hover': {
                backgroundColor: isDark ? '#1F2A22' : paper,
              },
              '&.Mui-focused': {
                backgroundColor: isDark ? '#1A221C' : paper,
                boxShadow: isDark
                  ? `0 0 0 2px ${primary}88`
                  : `0 0 0 2px rgba(47, 62, 52, 0.2)`,
              },
            },
            '& .MuiInputBase-input': {
              padding: '14px 16px',
              color: palette.text.primary,
            },
            '& .MuiInputBase-input::placeholder': {
              color: palette.text.secondary,
              opacity: 0.9,
            },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            color: palette.text.primary,
            '& .MuiSvgIcon-root': {
              color: palette.text.secondary,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { color: palette.text.secondary, '&.Mui-selected': { color: isDark ? '#E8DCC8' : primary } },
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
            background: isDark ? 'rgba(26, 34, 28, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'saturate(1.8) blur(20px)',
            WebkitBackdropFilter: 'saturate(1.8) blur(20px)',
            borderTop: `1px solid ${palette.divider}`,
            boxShadow: '0 -1px 0 rgba(31, 37, 33, 0.04)',
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
              color: isDark ? '#D4C9A3' : primary,
            },
            '& .MuiSvgIcon-root': {
              fontSize: 24,
              marginBottom: 4,
              transition: 'all 0.2s ease',
            },
            '&.Mui-selected .MuiSvgIcon-root': {
              color: isDark ? '#D4C9A3' : primary,
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
              transform: 'scale(0.95)',
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
              backgroundColor: isDark ? '#1A221C' : background,
              borderBottom: `1px solid ${palette.divider}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${palette.divider}`,
            color: palette.text.primary,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
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
