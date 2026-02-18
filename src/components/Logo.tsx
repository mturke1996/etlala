import { useState } from 'react';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  size?: number | string;
  variant?: 'light' | 'dark' | 'color';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 64, variant = 'color', showSubtitle = false }) => {
  const [imgError, setImgError] = useState(false);
  
  const safeSize = typeof size === 'number' ? `${size}px` : size;
  const fontSize = typeof size === 'number' ? `${Math.round(size * 0.45)}px` : '1.5rem';

  const defaultImgSrc = '/logog.png';

  // Fallback if image fails
  if (imgError) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 0.5 
        }}
      >
        <Box
          sx={{
            width: safeSize,
            height: safeSize,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4a5d4a 0%, #364036 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c8c0b0',
            fontWeight: 900,
            fontSize: fontSize,
            boxShadow: '0 4px 15px rgba(74, 93, 74, 0.4)',
            userSelect: 'none',
            border: '2px solid rgba(200, 192, 176, 0.2)',
          }}
        >
          إ
        </Box>
        {showSubtitle && (
          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight={800} color="primary.main">إطلالة</Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
              للاستشارات الهندسية
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 0.5 
      }}
    >
      <img
        src={defaultImgSrc}
        alt="Etlala Logo"
        onError={() => setImgError(true)}
        style={{
          width: safeSize,
          height: safeSize,
          objectFit: 'contain',
          filter: variant === 'light' ? 'brightness(1.5)' : 'none',
          transition: 'transform 0.3s ease',
        }}
      />
      {showSubtitle && !imgError && (
        <Box textAlign="center" mt={0.5}>
          <Typography variant="subtitle2" fontWeight={800} color="primary.dark">إطلالة</Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
            للاستشارات الهندسية
          </Typography>
        </Box>
      )}
    </Box>
  );
};
