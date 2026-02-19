/**
 * PDF Shared Styles Module
 * ========================
 * Centralized style definitions for all PDF documents.
 * Follows print-safe design principles:
 * - A4 page size (210mm × 297mm)
 * - Professional margins (20mm sides, 15mm top/bottom)
 * - Print-safe colors (CMYK-friendly, no pure black)
 * - Minimum 10pt font size for readability
 * - RTL direction for Arabic
 * 
 * Color Palette (Brand-aligned, print-safe):
 * - Primary:   #364036 (Deep olive green)
 * - Secondary: #4a5d4a (Medium olive)
 * - Accent:    #c8c0b0 (Warm beige)
 * - Text:      #1a1f1a (Near-black, print-safe)
 * - Muted:     #6b7f6b (Soft green-gray)
 * - Light BG:  #f8f7f4 (Warm white)
 * - Border:    #e8e5de (Subtle border)
 */

import { StyleSheet } from '@react-pdf/renderer';
import { PDF_FONT_FAMILY } from './pdfFonts';

// ─── Brand Colors ──────────────────────────────────────
export const PDF_COLORS = {
  primary: '#364036',
  secondary: '#4a5d4a',
  accent: '#c8c0b0',
  accentDark: '#8b7e6a',
  text: '#1a1f1a',
  textMuted: '#6b7f6b',
  textLight: '#999999',
  background: '#f8f7f4',
  white: '#ffffff',
  border: '#e8e5de',
  borderDark: '#d4d0c8',
  success: '#0d9668',
  warning: '#c9a54e',
  error: '#d64545',
  tableHeader: '#364036',
  tableRowAlt: '#fafaf8',
};

// ─── Shared PDF Styles ─────────────────────────────────
export const pdfBaseStyles = StyleSheet.create({
  // Page settings: A4 with professional margins
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 10,
    color: PDF_COLORS.text,
    backgroundColor: PDF_COLORS.white,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 45,
    direction: 'rtl',
  },

  // ─── Typography ────────────────────────
  h1: {
    fontSize: 22,
    fontWeight: 800,
    color: PDF_COLORS.primary,
    marginBottom: 4,
  },
  h2: {
    fontSize: 16,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    marginBottom: 6,
  },
  h3: {
    fontSize: 13,
    fontWeight: 700,
    color: PDF_COLORS.secondary,
    marginBottom: 4,
  },
  body: {
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 1.6,
    color: PDF_COLORS.text,
  },
  caption: {
    fontSize: 8,
    fontWeight: 600,
    color: PDF_COLORS.textMuted,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 8,
    fontWeight: 600,
    color: PDF_COLORS.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  // ─── Layout ────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  col: {
    flexDirection: 'column',
  },

  // ─── Dividers ──────────────────────────
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    marginVertical: 12,
  },
  dividerThick: {
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.primary,
    marginVertical: 10,
  },

  // ─── Footer ────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 45,
    right: 45,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: PDF_COLORS.textLight,
    fontWeight: 600,
  },
});
