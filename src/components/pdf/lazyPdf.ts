import React from 'react';
import { downloadPdf, sharePdf, type PdfShareOptions } from '../../utils/pdfService';
import type { Client, Invoice, Letter } from '../../types';

export async function downloadInvoicePdf(invoice: Invoice, client: Client) {
  const { InvoicePDF } = await import('./InvoicePDF');
  return downloadPdf(
    React.createElement(InvoicePDF, { invoice, client }),
    `فاتورة-${invoice.invoiceNumber}`
  );
}

export async function shareInvoicePdf(
  invoice: Invoice,
  client: Client,
  options?: PdfShareOptions
) {
  const { InvoicePDF } = await import('./InvoicePDF');
  return sharePdf(
    React.createElement(InvoicePDF, { invoice, client }),
    `فاتورة-${invoice.invoiceNumber}`,
    options
  );
}

export async function downloadLetterPdf(letter: Letter, filename: string) {
  const { LetterPDF } = await import('./LetterPDF');
  return downloadPdf(React.createElement(LetterPDF, { letter }), filename);
}

export async function shareLetterPdf(
  letter: Letter,
  filename: string,
  options?: PdfShareOptions
) {
  const { LetterPDF } = await import('./LetterPDF');
  return sharePdf(React.createElement(LetterPDF, { letter }), filename, options);
}
