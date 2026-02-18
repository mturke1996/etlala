import { Box, keyframes } from '@mui/material';

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

export const LoadingScreen = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #1a2a1a 0%, #0f1a0f 100%)',
        zIndex: 9999,
        animation: `${fadeIn} 0.3s ease-out`,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            fontSize: '2.2rem',
            fontWeight: 900,
            color: '#c8c0b0',
            letterSpacing: '0.08em',
            fontFamily: "'Tajawal', sans-serif",
            mb: 0.5,
          }}
        >
          إطلالة
        </Box>
        <Box
          sx={{
            fontSize: '0.65rem',
            color: 'rgba(200,192,176,0.5)',
            letterSpacing: '0.25em',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          ARCHITECTURE & ENGINEERING
        </Box>
        <Box
          sx={{
            width: 30,
            height: 2,
            bgcolor: 'rgba(200,192,176,0.3)',
            mx: 'auto',
            mt: 3,
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        />
      </Box>
    </Box>
  );
};
