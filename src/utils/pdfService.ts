/**
 * PDF Service — @react-pdf/renderer + Tajawal Arabic font
 */
import React from 'react';
import toast from 'react-hot-toast';
import { ensurePdfFontsLoaded } from '../components/pdf/pdfFonts';
import { preparePdfTree } from '../components/pdf/prepare-pdf-tree';

export type PdfShareOptions = {
  title?: string;
  /** نص المشاركة فقط — بدون أي رابط للنظام */
  text?: string;
};

export const generatePdfBlob = async (component: React.ReactElement): Promise<Blob> => {
  await ensurePdfFontsLoaded();
  const wrapped = await preparePdfTree(component);
  const { pdf } = await import('@react-pdf/renderer');
  const asPdf = pdf();
  asPdf.updateContainer(wrapped);
  const blob = await asPdf.toBlob();
  return blob;
};

const pdfBaseName = (filename: string) => filename.replace(/\.pdf$/i, '');

const normalizeShareOptions = (options?: string | PdfShareOptions): PdfShareOptions => {
  if (typeof options === 'string') return { title: options, text: options };
  return options ?? {};
};

const isShareAbort = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'name' in error &&
  (error as { name?: string }).name === 'AbortError';

const savePdfBlob = (blob: Blob, filename: string) => {
  const name = `${pdfBaseName(filename)}.pdf`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const downloadPdf = async (
  component: React.ReactElement,
  filename: string
): Promise<void> => {
  const toastId = toast.loading('جاري إنشاء ملف PDF...');
  try {
    const blob = await generatePdfBlob(component);
    const url = URL.createObjectURL(blob);

    const tab = window.open(url, '_blank');
    if (!tab) {
      savePdfBlob(blob, filename);
    }
    setTimeout(() => URL.revokeObjectURL(url), 120_000);

    toast.success('تم فتح PDF', { id: toastId });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    toast.error('فشل في إنشاء PDF — تحقق من الخطوط والصور', { id: toastId });
    throw error;
  }
};

export const sharePdf = async (
  component: React.ReactElement,
  filename: string,
  options?: string | PdfShareOptions
): Promise<void> => {
  const toastId = toast.loading('جاري تحضير الملف للمشاركة...');
  try {
    const opts = normalizeShareOptions(options);
    const baseName = pdfBaseName(filename);
    const title = opts.title || baseName;
    const text = opts.text || title;

    const blob = await generatePdfBlob(component);
    const file = new File([blob], `${baseName}.pdf`, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title, text });
      toast.success('تمت المشاركة', { id: toastId });
      return;
    }

    savePdfBlob(blob, filename);
    toast.success('تم تنزيل الملف — شاركه من تطبيق الملفات أو واتساب', { id: toastId });
  } catch (error: any) {
    if (isShareAbort(error)) {
      toast.dismiss(toastId);
      return;
    }
    console.error('Share PDF error:', error);
    toast.error('فشل في المشاركة', { id: toastId });
    throw error;
  }
};
