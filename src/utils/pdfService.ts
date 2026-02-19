/**
 * PDF Service Module
 * ==================
 * Centralized service for PDF generation, download, and sharing.
 * 
 * Architecture:
 * - Uses @react-pdf/renderer's `pdf()` API for blob generation
 * - Handles download on both desktop and mobile browsers
 * - Provides share functionality for mobile devices (Web Share API)
 * - Extensible: add new document types by creating new templates
 * 
 * Why this approach?
 * - `pdf().toBlob()` generates the PDF in a web worker (non-blocking)
 * - Blob-based download works on all modern browsers including mobile
 * - Web Share API enables native sharing on mobile (WhatsApp, email, etc.)
 * - No server required
 */

import { pdf } from '@react-pdf/renderer';
import React from 'react';

/**
 * Generate a PDF blob from a React PDF component
 */
export const generatePdfBlob = async (
  component: React.ReactElement
): Promise<Blob> => {
  const blob = await pdf(component).toBlob();
  return blob;
};

/**
 * Download a PDF file to the user's device
 * Works on both desktop and mobile browsers
 */
export const downloadPdf = async (
  component: React.ReactElement,
  filename: string
): Promise<void> => {
  try {
    const blob = await generatePdfBlob(component);
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('فشل في إنشاء ملف PDF');
  }
};

/**
 * Share a PDF file using Web Share API (mobile-friendly)
 * Falls back to download if sharing is not supported
 */
export const sharePdf = async (
  component: React.ReactElement,
  filename: string,
  title?: string
): Promise<void> => {
  try {
    const blob = await generatePdfBlob(component);

    // Check if Web Share API is available and supports files
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], `${filename}.pdf`, {
        type: 'application/pdf',
      });

      const shareData = {
        title: title || filename,
        files: [file],
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    }

    // Fallback: open in new tab (good for mobile browsers)
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error: any) {
    // User cancelled share dialog — not an error
    if (error?.name === 'AbortError') return;
    console.error('PDF share failed:', error);
    throw new Error('فشل في مشاركة ملف PDF');
  }
};

/**
 * Open PDF in a new browser tab for preview
 */
export const previewPdf = async (
  component: React.ReactElement
): Promise<void> => {
  try {
    const blob = await generatePdfBlob(component);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 120000);
  } catch (error) {
    console.error('PDF preview failed:', error);
    throw new Error('فشل في عرض ملف PDF');
  }
};
