/**
 * Font Download Script - ES Module (Node.js 18+)
 * Fetches Cairo Arabic font URLs from Google Fonts CSS API
 * Run: node src/scripts/download-fonts.js
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, '..', '..', 'public', 'fonts');

if (!existsSync(FONTS_DIR)) {
  mkdirSync(FONTS_DIR, { recursive: true });
  console.log('📁 Created public/fonts/');
}

// Google Fonts CSS API - request Arabic + Latin subsets as TTF
const FONTS_CSS_URLS = [
  // Cairo Regular (400)
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400&display=swap',
  // Cairo Bold (700)
  'https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap',
];

const FILE_NAMES = ['Cairo-Regular.ttf', 'Cairo-Bold.ttf'];

async function fetchFontUrl(cssUrl) {
  // Use a legacy User-Agent to get TTF (not WOFF2)
  const res = await fetch(cssUrl, {
    headers: {
      'User-Agent':
        'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
    },
  });
  const css = await res.text();
  // Extract the first TTF src URL from the CSS
  const match = css.match(/src:\s*url\(([^)]+\.ttf)\)/);
  if (!match) {
    // Also try matching without .ttf extension (some responses differ)
    const match2 = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
    return match2 ? match2[1] : null;
  }
  return match[1];
}

async function downloadFile(url, dest) {
  console.log(`⬇  Downloading from ${url.substring(0, 60)}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const buf = await res.arrayBuffer();
  writeFileSync(dest, Buffer.from(buf));
  console.log(`✅ Saved ${(buf.byteLength / 1024).toFixed(0)} KB → ${dest}`);
}

console.log('🔤 Getting Cairo Arabic font URLs from Google Fonts...\n');

for (let i = 0; i < FONTS_CSS_URLS.length; i++) {
  const dest = join(FONTS_DIR, FILE_NAMES[i]);
  if (existsSync(dest)) {
    console.log(`⏭  Exists: ${FILE_NAMES[i]}`);
    continue;
  }
  try {
    const fontUrl = await fetchFontUrl(FONTS_CSS_URLS[i]);
    if (!fontUrl) throw new Error('Could not find TTF URL in CSS response');
    await downloadFile(fontUrl, dest);
  } catch (err) {
    console.error(`❌ Failed: ${FILE_NAMES[i]} → ${err.message}`);
  }
}

console.log('\n✨ Done! Restart dev server: npm run dev');
