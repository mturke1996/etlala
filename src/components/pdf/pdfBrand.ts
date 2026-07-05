import { COMPANY_INFO } from '../../constants/companyInfo';

export interface PdfBrandSnapshot {
  name: string;
  fullName: string;
  tagline: string;
  logoUrl: string;
  palette: {
    primary: string;
    primaryDark: string;
    accent: string;
    text: string;
    muted: string;
    border: string;
    rowAlt: string;
    headerBg: string;
    success: string;
    warning: string;
    danger: string;
  };
  contact: {
    phone: string;
    phone2: string;
    email: string;
    address: string;
  };
}

const ETLALA_PALETTE = {
  primary: '#1F3D35',
  accent: '#C8B27D',
  success: '#0D9488',
  warning: '#B45309',
  danger: '#B91C1C',
} as const;

function mix(hex: string, pct: number, toward: 'white' | 'black'): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  const target = toward === 'white' ? 255 : 0;
  r = Math.round(r + (target - r) * pct);
  g = Math.round(g + (target - g) * pct);
  b = Math.round(b + (target - b) * pct);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function resolveLogo(src: string): string {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  if (typeof window !== 'undefined') {
    if (src.startsWith('/')) return `${window.location.origin}${src}`;
    return new URL(src, window.location.origin).toString();
  }
  return src;
}

function resolvePdfLogo(): string {
  const candidates = ['/logog.png', '/logo-icon.jpg', '/logo-hero-3d.png', '/9679AE70-5813-43D5-BCBF-F18E0F9FD694.png'];
  for (const src of candidates) {
    const url = resolveLogo(src);
    if (url) return url;
  }
  return '';
}

export function getPdfBrand(): PdfBrandSnapshot {
  const primary = ETLALA_PALETTE.primary;

  return {
    name: COMPANY_INFO.name,
    fullName: COMPANY_INFO.fullName,
    tagline: 'للعمارة والإستشارات الهندسية',
    logoUrl: resolvePdfLogo(),
    palette: {
      primary,
      primaryDark: mix(primary, 0.22, 'black'),
      accent: ETLALA_PALETTE.accent,
      text: '#0F2340',
      muted: '#4A6080',
      border: '#D8E0EA',
      rowAlt: '#F4F7FB',
      headerBg: primary,
      success: ETLALA_PALETTE.success,
      warning: ETLALA_PALETTE.warning,
      danger: ETLALA_PALETTE.danger,
    },
    contact: {
      phone: COMPANY_INFO.phone,
      phone2: COMPANY_INFO.phone2 || '',
      email: COMPANY_INFO.email,
      address: COMPANY_INFO.address,
    },
  };
}

export function buildFooterPhones(brand: PdfBrandSnapshot): string[] {
  return [brand.contact.phone, brand.contact.phone2].filter(Boolean);
}

export function buildFooterLine(brand: PdfBrandSnapshot): string {
  const phones = buildFooterPhones(brand).join('  ·  ');
  return [brand.contact.address, phones].filter(Boolean).join('  |  ');
}

export function buildFooterAddressLine(brand: PdfBrandSnapshot): string {
  return brand.contact.address || 'طرابلس، ليبيا';
}
