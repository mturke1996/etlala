import { Box, keyframes } from '@mui/material';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0%   { width: 0%; opacity: 0; }
  30%  { opacity: 1; }
  70%  { opacity: 1; }
  100% { width: 100%; opacity: 0; }
`;

const dotsBounce = keyframes`
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(200,192,176,0.2); }
  50%       { text-shadow: 0 0 40px rgba(200,192,176,0.5), 0 0 80px rgba(200,192,176,0.2); }
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
        background: 'linear-gradient(160deg, #161b16 0%, #0f140f 60%, #1a2a1a 100%)',
        zIndex: 9999,
        animation: `${fadeIn} 0.4s cubic-bezier(0.4,0,0.2,1)`,
        gap: 4,
        overflow: 'hidden',

        // Subtle radial glow in center
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw', height: '60vw',
          maxWidth: 400,
          background: 'radial-gradient(circle, rgba(61,79,61,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Box
        className="etlala-app-ambient etlala-app-ambient--dark"
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
        aria-hidden
      />
      {/* Brand Name */}
      <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Arabic name */}
        <Box
          sx={{
            fontSize: { xs: '3rem', sm: '3.6rem' },
            fontWeight: 900,
            color: '#c8c0b0',
            letterSpacing: '0.06em',
            fontFamily: "'Tajawal', sans-serif",
            lineHeight: 1,
            mb: 0.5,
            animation: `${glow} 3s ease-in-out infinite`,
          }}
        >
          إطلالة
        </Box>

        {/* English subtitle */}
        <Box
          sx={{
            fontSize: '0.6rem',
            color: 'rgba(200,192,176,0.4)',
            letterSpacing: '0.35em',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontFamily: "'Outfit', sans-serif",
            mb: 3,
          }}
        >
          ARCHITECTURE & ENGINEERING
        </Box>

        {/* Shimmer bar */}
        <Box
          sx={{
            width: '100%',
            height: '1px',
            bgcolor: 'rgba(200,192,176,0.08)',
            borderRadius: '1px',
            overflow: 'hidden',
            position: 'relative',
            mb: 3,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0,
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(200,192,176,0.7), transparent)',
              animation: `${shimmer} 2s ease-in-out infinite`,
            },
          }}
        />

        {/* Dots loader */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#c8c0b0',
                animation: `${dotsBounce} 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
