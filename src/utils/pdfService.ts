/**
 * PDF Service - Client-side PDF generation
 * Uses @react-pdf/renderer with Cairo Arabic font from gstatic CDN
 */
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import toast from 'react-hot-toast';

export const generatePdfBlob = async (component: React.ReactElement): Promise<Blob> => {
  // Fix for react-pdf hanging on second generation: 
  // Initialize with false/null, then use updateContainer
  const asPdf = pdf();
  asPdf.updateContainer(component);
  const blob = await asPdf.toBlob();
  return blob;
};

export const downloadPdf = async (
  component: React.ReactElement,
  filename: string
): Promise<void> => {
  const toastId = toast.loading('جاري إنشاء ملف PDF...');
  try {
    const blob = await generatePdfBlob(component);
    const url = URL.createObjectURL(blob);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: open in new tab so user can save/share from browser
      const tab = window.open(url, '_blank');
      if (!tab) {
        // Popup blocked - fallback to same window
        window.location.href = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } else {
      // Desktop: trigger direct download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 500);
    }

    toast.success('تم إنشاء PDF بنجاح', { id: toastId });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    toast.error('فشل في إنشاء PDF - تحقق من الاتصال بالإنترنت', { id: toastId });
    throw error;
  }
};

export const sharePdf = async (
  component: React.ReactElement,
  filename: string,
  title?: string
): Promise<void> => {
  const toastId = toast.loading('جاري تحضير الملف للمشاركة...');
  try {
    const blob = await generatePdfBlob(component);
    const file = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: title || filename });
      toast.success('تمت المشاركة', { id: toastId });
    } else {
      // Fallback: download instead
      toast.dismiss(toastId);
      await downloadPdf(component, filename);
    }
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      toast.dismiss(toastId);
      return;
    }
    console.error('Share PDF error:', error);
    toast.error('فشل في المشاركة', { id: toastId });
    throw error;
  }
};
