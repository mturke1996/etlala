/**
 * PDF Service - Download, Share, Preview
 * =======================================
 * Uses @react-pdf/renderer blob API (non-blocking)
 * Supports Web Share API for mobile sharing
 */

import { pdf } from '@react-pdf/renderer';
import React from 'react';

/**
 * Generate PDF blob from a React PDF component
 */
export const generatePdfBlob = async (
  component: React.ReactElement
): Promise<Blob> => {
  const blob = await pdf(component).toBlob();
  return blob;
};

/**
 * Download PDF to device (works on desktop + mobile)
 */
export const downloadPdf = async (
  component: React.ReactElement,
  filename: string
): Promise<void> => {
  const blob = await generatePdfBlob(component);
  const url = URL.createObjectURL(blob);

  // Mobile-friendly: open in new tab for iOS Safari
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // On mobile, open PDF in new tab (user can save/share from there)
    window.open(url, '_blank');
  } else {
    // On desktop, trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  }
};

/**
 * Share PDF using Web Share API (mobile-friendly)
 * Falls back to opening in new tab
 */
export const sharePdf = async (
  component: React.ReactElement,
  filename: string,
  title?: string
): Promise<void> => {
  const blob = await generatePdfBlob(component);

  // Try Web Share API first
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });
    const shareData = { title: title || filename, files: [file] };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // User cancelled
      }
    }
  }

  // Fallback: open in new tab
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};
