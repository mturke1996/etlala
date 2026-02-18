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
      main: '#4a5d4a',      // Deep Olive Green - from logo icon
      light: '#6b7f6b',     // Lighter olive
      dark: '#364036',      // Darker olive  
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b7e6a',      // Warm taupe from logo text
      light: '#a99b87',
      dark: '#6e6352',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f3ef',   // Cream paper - warm neutral
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3a2d',   // Dark olive for text
      secondary: '#6b7b6b', // Muted olive
    },
  },
  dark: {
    primary: {
      main: '#7a9a7a',      // Lighter olive for dark mode visibility
      light: '#9ab89a',
      dark: '#5a7a5a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c8c0b0',      // Cream from logo
      light: '#e0dbd0',
      dark: '#a89e8e',
      contrastText: '#1a1f1a',
    },
    background: {
      default: '#1a1f1a',   // Deep olive-black
      paper: '#242b24',     // Olive-tinted dark
    },
    text: {
      primary: '#e8e5df',   // Warm white
      secondary: '#b0b8a8', // Muted sage
    },
  },
};

export const createAppTheme = (mode: ThemeMode = 'light') => {
  const palette = etlalaColors[mode];

  const themeOptions: ThemeOptions = {
    direction: 'rtl',
    palette: {
      mode,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background,
      text: palette.text,
      divider: mode === 'dark' ? 'rgba(200, 192, 176, 0.12)' : 'rgba(74, 93, 74, 0.08)',
      success: { main: '#4a7a4a', light: '#6b9a6b', dark: '#2d5a2d' },
      error: { main: '#a0524a', light: '#c0726a', dark: '#803a32' },
      warning: { main: '#b8943a', light: '#d4b05a', dark: '#8a6e28' },
      info: { main: '#4a6a8a', light: '#6a8aaa', dark: '#324a6a' },
    },
    typography: {
      fontFamily: "'Cairo', 'Outfit', sans-serif",
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'dark' ? '#3a4a3a #1a1f1a' : '#c8c0b0 #f5f3ef',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: 'transparent',
              width: 6,
              height: 6,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: mode === 'dark' ? '#3a4a3a' : '#c8c0b0',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: mode === 'dark' ? '#4a5d4a' : '#8b7e6a',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            padding: '10px 22px',
            boxShadow: 'none',
            fontWeight: 700,
            '&:hover': {
              boxShadow: '0 4px 12px rgba(74, 93, 74, 0.2)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          },
          containedPrimary: {
            backgroundColor: mode === 'dark' ? '#5a7a5a' : '#4a5d4a',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#6b8f6b' : '#364036',
            },
          },
          outlinedPrimary: {
            borderColor: mode === 'dark' ? '#7a9a7a' : '#4a5d4a',
            color: mode === 'dark' ? '#9ab89a' : '#4a5d4a',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(122,154,122,0.1)' : 'rgba(74,93,74,0.06)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
              : '0 2px 12px rgba(74, 93, 74, 0.06)',
            border: `1px solid ${mode === 'dark' ? 'rgba(200, 192, 176, 0.06)' : 'rgba(74, 93, 74, 0.06)'}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '20px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
