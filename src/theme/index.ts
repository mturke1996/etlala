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
      main: '#3d4f3d',
      light: '#5a6d5a',
      dark: '#2a362a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b5d4d',
      light: '#8b7a68',
      dark: '#4a4035',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f1ea',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e2a1e',
      secondary: '#5c6b5c',
    },
  },
  dark: {
    primary: {
      main: '#7fa080',
      light: '#9ab89a',
      dark: '#5f7a5f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c8c0b0',
      light: '#e0dbd0',
      dark: '#a89e8e',
      contrastText: '#141916',
    },
    background: {
      default: '#141916',
      paper: '#1a221a',
    },
    text: {
      primary: '#eceae4',
      secondary: '#a8b0a0',
    },
  },
};

export const createAppTheme = (mode: ThemeMode = 'light') => {
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
      divider: isDark ? 'rgba(200, 192, 176, 0.1)' : 'rgba(61, 79, 61, 0.09)',
      success: { main: '#0d9668', light: '#34d399', dark: '#065f46', contrastText: '#fff' },
      error: { main: '#c73e3e', light: '#ef6b6b', dark: '#8f2a2a', contrastText: '#fff' },
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
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#3a4a3a #141916' : '#a89888 #f4f1ea',
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
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: '12px',
            minHeight: 44,
            padding: '10px 24px',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: 0.3,
            transition: 'background 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&:hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.4)'
                : '0 8px 24px rgba(61, 79, 61, 0.22)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0) scale(0.98)',
            },
            '&:focus-visible': {
              boxShadow: isDark
                ? '0 0 0 3px rgba(122, 154, 122, 0.45)'
                : '0 0 0 3px rgba(61, 79, 61, 0.28)',
            },
          },
          contained: {
            boxShadow: isDark
              ? '0 2px 0 rgba(0,0,0,0.25) inset, 0 4px 12px rgba(0,0,0,0.3)'
              : '0 1px 0 rgba(255,255,255,0.2) inset, 0 4px 14px rgba(61, 79, 61, 0.2)',
            '&:hover': {
              boxShadow: isDark
                ? '0 2px 0 rgba(0,0,0,0.2) inset, 0 6px 20px rgba(0,0,0,0.4)'
                : '0 1px 0 rgba(255,255,255,0.25) inset, 0 8px 24px rgba(61, 79, 61, 0.28)',
            },
          },
          containedPrimary: {
            background: isDark
              ? 'linear-gradient(155deg, #5f8a62 0%, #456248 45%, #2d3d2c 100%)'
              : 'linear-gradient(155deg, #4d6450 0%, #3d4f3d 42%, #1e2820 100%)',
            color: '#ffffff',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(155deg, #6d9a70 0%, #517055 50%, #3a4d3a 100%)'
                : 'linear-gradient(155deg, #5a715d 0%, #2f3d2f 55%, #141c14 100%)',
            },
            '&:disabled': {
              background: isDark ? 'rgba(80, 90, 80, 0.5)' : 'rgba(61, 79, 61, 0.35)',
              color: 'rgba(255,255,255,0.65)',
            },
          },
          containedError: {
            background: 'linear-gradient(135deg, #c73e3e 0%, #9e2f2f 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #a83232 0%, #7a2323 100%)',
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
            minWidth: 44,
            minHeight: 44,
            transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            borderRadius: '12px',
            '&:hover': {
              transform: 'scale(1.06)',
              backgroundColor: isDark ? 'rgba(200,192,176,0.1)' : 'rgba(74,93,74,0.08)',
            },
            '&:active': {
              transform: 'scale(0.94)',
            },
            '&:focus-visible': {
              outline: 'none',
              boxShadow: isDark
                ? '0 0 0 3px rgba(122, 154, 122, 0.4)'
                : '0 0 0 3px rgba(61, 79, 61, 0.24)',
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '18px',
            backgroundImage: 'none',
            border: isDark
              ? '1px solid rgba(200, 192, 176, 0.1)'
              : '1px solid rgba(61, 79, 61, 0.08)',
            boxShadow: isDark
              ? '0 4px 24px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255,255,255,0.04) inset'
              : '0 1px 0 rgba(255,255,255,0.95) inset, 0 4px 20px rgba(20, 25, 20, 0.06), 0 12px 40px rgba(61, 79, 61, 0.06)',
            background: isDark
              ? 'linear-gradient(165deg, #1c231c 0%, #1a221a 100%)'
              : 'linear-gradient(165deg, #ffffff 0%, #fbf8f2 100%)',
            transition: 'box-shadow 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&:hover': {
              boxShadow: isDark
                ? '0 8px 36px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255,255,255,0.05) inset'
                : '0 8px 28px rgba(61, 79, 61, 0.14), 0 1px 0 rgba(255,255,255,0.9) inset',
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
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 4,
            background: isDark
              ? 'linear-gradient(180deg, rgba(32, 38, 32, 0.88) 0%, rgba(22, 27, 22, 0.98) 100%)'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(250, 247, 240, 0.99) 100%)',
            backdropFilter: 'saturate(1.2) blur(20px)',
            WebkitBackdropFilter: 'saturate(1.2) blur(20px)',
            borderTop: isDark
              ? '1px solid rgba(200, 192, 176, 0.1)'
              : '1px solid rgba(61, 79, 61, 0.09)',
            boxShadow: isDark
              ? '0 -10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200, 192, 176, 0.08)'
              : '0 -8px 32px rgba(61, 79, 61, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '8%',
              right: '8%',
              height: '1px',
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(200, 192, 176, 0.3), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(61, 79, 61, 0.22), transparent)',
            },
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 0,
            maxWidth: 'none',
            flex: 1,
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 4,
            paddingRight: 4,
            borderRadius: '12px',
            marginLeft: 2,
            marginRight: 2,
            position: 'relative',
            color: isDark ? 'rgba(200, 192, 176, 0.42)' : 'rgba(61, 79, 61, 0.4)',
            transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&.Mui-selected': {
              color: isDark ? '#b5d0b5' : '#3d4d3d',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.65rem',
              fontWeight: 600,
              fontFamily: "'Tajawal', 'Cairo', sans-serif",
              transition: 'all 0.25s ease',
            },
            '&.Mui-selected .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              fontWeight: 800,
            },
            '& .MuiSvgIcon-root': {
              fontSize: 22,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            '&.Mui-selected .MuiSvgIcon-root': {
              fontSize: 25,
              filter: isDark
                ? 'drop-shadow(0 3px 6px rgba(122, 154, 122, 0.5))'
                : 'drop-shadow(0 3px 6px rgba(61, 79, 61, 0.4))',
              transform: 'translateY(-2px)',
            },
            '&.Mui-selected::before': {
              content: '""',
              position: 'absolute',
              top: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 36,
              height: 36,
              borderRadius: '12px',
              zIndex: -1,
              background: isDark
                ? 'linear-gradient(160deg, rgba(122, 154, 122, 0.22) 0%, rgba(61, 79, 61, 0.1) 100%)'
                : 'linear-gradient(160deg, rgba(61, 79, 61, 0.16) 0%, rgba(61, 79, 61, 0.06) 100%)',
            },
            '&:hover:not(.Mui-selected)': {
              color: isDark ? 'rgba(200, 192, 176, 0.78)' : 'rgba(61, 79, 61, 0.7)',
            },
            '&:hover:not(.Mui-selected) .MuiSvgIcon-root': {
              transform: 'translateY(-1px) scale(1.08)',
            },
            '&:focus-visible': {
              borderRadius: '12px',
              outline: 'none',
              boxShadow: isDark
                ? '0 0 0 2px rgba(200, 192, 176, 0.35)'
                : '0 0 0 2px rgba(61, 79, 61, 0.28)',
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            marginTop: 2,
            marginBottom: 2,
            marginLeft: 8,
            marginRight: 8,
            paddingTop: 10,
            paddingBottom: 10,
            borderInlineStart: '3px solid transparent',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              background: isDark ? 'rgba(122, 154, 122, 0.16)' : 'rgba(61, 79, 61, 0.1)',
              borderInlineStart: isDark ? '3px solid #9ab89a' : '3px solid #4a5d4a',
            },
            '&.Mui-selected:hover': {
              background: isDark ? 'rgba(122, 154, 122, 0.22)' : 'rgba(61, 79, 61, 0.14)',
            },
            '&:hover': {
              background: isDark ? 'rgba(200, 192, 176, 0.06)' : 'rgba(61, 79, 61, 0.05)',
            },
            '&:focus-visible': {
              outline: 'none',
              boxShadow: isDark
                ? '0 0 0 2px rgba(122, 154, 122, 0.35) inset'
                : '0 0 0 2px rgba(61, 79, 61, 0.2) inset',
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            margin: '2px 6px',
            transition: 'background 0.2s ease',
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

      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: isDark ? '1px solid rgba(200, 192, 176, 0.1)' : '1px solid rgba(61, 79, 61, 0.08)',
            backgroundColor: isDark ? 'rgba(30, 36, 30, 0.5)' : 'rgba(255, 255, 255, 0.8)',
            overflow: 'auto',
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: { borderCollapse: 'separate', borderSpacing: 0 },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: 0.4,
              textTransform: 'none',
              color: isDark ? 'rgba(200, 192, 176, 0.85)' : 'rgba(45, 58, 45, 0.8)',
              borderBottom: isDark
                ? '1px solid rgba(200, 192, 176, 0.12)'
                : '1px solid rgba(61, 79, 61, 0.1)',
              bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(61, 79, 61, 0.04)',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background 0.15s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(200, 192, 176, 0.05)' : 'rgba(61, 79, 61, 0.04)',
            },
            '&:last-of-type .MuiTableCell-body': { borderBottom: 'none' },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: isDark ? 'rgba(200, 192, 176, 0.08)' : 'rgba(61, 79, 61, 0.07)' },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
