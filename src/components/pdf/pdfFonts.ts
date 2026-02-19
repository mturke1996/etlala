/**
 * PDF Font Registration Module
 * ============================
 * Registers Arabic fonts for use in @react-pdf/renderer.
 * Uses Cairo font family from Google Fonts for professional Arabic typography.
 * 
 * Why Cairo?
 * - Modern, clean Arabic typeface designed for screens & print
 * - Excellent weight range (Regular, SemiBold, Bold, ExtraBold)
 * - Built-in Arabic shaping and ligatures
 * - Free, open-source, widely used in professional Arabic documents
 */

import { Font } from '@react-pdf/renderer';

// Register Cairo font family with multiple weights for typographic hierarchy
Font.register({
  family: 'Cairo',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXGc1nY6HkvamImRJqExst1.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXGc1nY6Hkvanm1RJqExst1.ttf',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXGc1nY6HkvauW0RJqExst1.ttf',
      fontWeight: 700,
    },
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXGc1nY6HkvavGyRJqExst1.ttf',
      fontWeight: 800,
    },
  ],
});

// Disable hyphenation for Arabic text (Arabic doesn't use hyphenation)
Font.registerHyphenationCallback((word) => [word]);

export const PDF_FONT_FAMILY = 'Cairo';
