import { useState } from 'react';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  size?: number | string;
  /** hero: شعار مضيء للهيرو الداكن + ظل قوي */
  variant?: 'light' | 'dark' | 'color' | 'hero';
  showSubtitle?: boolean;
}

/**
 * ذهبي دافئ وواضح على خلفية داكنة (يُلون مسحوق الشعار: brightness(0) → ثم sepia/saturate).
 * ضبط أدق من النسخة السابقة التي كانت مائلة للبُهتان (invert/sepia منخفض).
 */
export const LOGO_HERO_GOLD_FILTER =
  'brightness(0) saturate(100%) invert(83%) sepia(42%) saturate(1750%) hue-rotate(1deg) brightness(1.14) contrast(1.06) drop-shadow(0 5px 18px rgba(0,0,0,0.5)) drop-shadow(0 0 26px rgba(231, 208, 150, 0.5))';

const HERO_IMG_FILTER = LOGO_HERO_GOLD_FILTER;

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
            background: 'linear-gradient(135deg, #4361EE 0%, #1E293B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: fontSize,
            boxShadow: '0 4px 15px rgba(67, 97, 238, 0.4)',
            userSelect: 'none',
            border: '2px solid rgba(255, 255, 255, 0.2)',
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
      sx={
        variant === 'hero' && !imgError
          ? {
              display: 'block',
              lineHeight: 0,
              width: 'fit-content',
              maxWidth: '100%',
              mx: 'auto',
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }
      }
    >
      <img
        src={defaultImgSrc}
        alt="Etlala Logo"
        onError={() => setImgError(true)}
        style={
          variant === 'hero'
            ? {
                display: 'block',
                maxWidth: safeSize,
                width: 'auto',
                height: 'auto',
                objectFit: 'contain' as const,
                filter: HERO_IMG_FILTER,
                transition: 'transform 0.3s ease, filter 0.4s ease',
              }
            : {
                width: safeSize,
                height: safeSize,
                objectFit: 'contain',
                filter: variant === 'light' ? 'brightness(1.5)' : 'none',
                transition: 'transform 0.3s ease, filter 0.4s ease',
              }
        }
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
