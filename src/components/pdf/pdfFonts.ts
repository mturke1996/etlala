// @ts-nocheck
/**
 * PDF Arabic Font Registration - v4 compatible
 * Uses locally served Cairo TTF from public/fonts/
 * Workaround for @react-pdf/renderer v4 BiDi bug with Arabic
 */
import { Font } from '@react-pdf/renderer';

const CAIRO_TTF = `${window.location.origin}/fonts/Cairo-Regular.ttf`;

Font.register({
  family: 'Cairo',
  fonts: [
    { src: CAIRO_TTF, fontWeight: 400 },
    { src: CAIRO_TTF, fontWeight: 700 },
  ],
});

// Disable hyphenation for Arabic
Font.registerHyphenationCallback((word) => [word]);

export const PDF_FONT_FAMILY = 'Cairo';
