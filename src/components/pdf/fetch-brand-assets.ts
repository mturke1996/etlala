async function fetchAsDataUri(path: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const url = `${window.location.origin}${path}`;
    const res = await fetch(url, { credentials: 'same-origin', cache: 'force-cache' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export type BrandPdfAssets = {
  logoDataUri: string | null;
  markDataUri: string | null;
};

const LOGO_CANDIDATES = ['/logog.png', '/logo-icon.jpg', '/logo-hero-3d.png', '/9679AE70-5813-43D5-BCBF-F18E0F9FD694.png'];

/** Load logo PNG/JPG as data URIs for react-pdf Image. */
export async function fetchBrandPdfAssets(): Promise<BrandPdfAssets> {
  for (const path of LOGO_CANDIDATES) {
    const logoDataUri = await fetchAsDataUri(path);
    if (logoDataUri) {
      return { logoDataUri, markDataUri: logoDataUri };
    }
  }
  return { logoDataUri: null, markDataUri: null };
}
