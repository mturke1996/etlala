/**
 * PDF Font Registration
 * =====================
 * Registers Arabic Cairo font for @react-pdf/renderer
 * Uses static font files from Google Fonts GitHub repository (stable URLs)
 */

import { Font } from '@react-pdf/renderer';

// Register Cairo Arabic font - static TTF files (stable URLs)
const CAIRO_BASE = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/cairo/static';

Font.register({
  family: 'Cairo',
  fonts: [
    {
      src: `${CAIRO_BASE}/Cairo-Regular.ttf`,
      fontWeight: 400,
    },
    {
      src: `${CAIRO_BASE}/Cairo-SemiBold.ttf`,
      fontWeight: 600,
    },
    {
      src: `${CAIRO_BASE}/Cairo-Bold.ttf`,
      fontWeight: 700,
    },
    {
      src: `${CAIRO_BASE}/Cairo-ExtraBold.ttf`,
      fontWeight: 800,
    },
  ],
});

// Disable hyphenation for Arabic text
Font.registerHyphenationCallback((word: string) => [word]);

export const PDF_FONT_FAMILY = 'Cairo';
