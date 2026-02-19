/**
 * Font Setup Script (ES Module - compatible with "type": "module")
 * Run once: node scripts/download-fonts.js
 * Downloads Cairo Arabic font to public/fonts/ for offline use
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, '..', 'public', 'fonts');

if (!existsSync(FONTS_DIR)) {
  mkdirSync(FONTS_DIR, { recursive: true });
  console.log('📁 Created public/fonts/ directory');
}

const fonts = [
  {
    name: 'Cairo-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/cairo/v28/SLXGc1nY6HkvamImRJqExst1.ttf',
  },
  {
    name: 'Cairo-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/cairo/v28/SLXvc1nY6HkvamImRTo9Tq4v.ttf',
  },
];

async function downloadFont(url, filepath) {
  console.log(`⬇  Downloading ${url.split('/').pop()}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('font') && !contentType.includes('octet')) {
    console.warn(`⚠  Unexpected content type: ${contentType}`);
  }
  const buffer = await response.arrayBuffer();
  writeFileSync(filepath, Buffer.from(buffer));
  const sizeKB = Math.round(buffer.byteLength / 1024);
  console.log(`✅ Saved: ${filepath.split('/').pop()} (${sizeKB} KB)`);
}

console.log('📥 Downloading Cairo Arabic fonts...\n');
for (const font of fonts) {
  const dest = join(FONTS_DIR, font.name);
  if (existsSync(dest)) {
    console.log(`⏭  Already exists: ${font.name}`);
    continue;
  }
  try {
    await downloadFont(font.url, dest);
  } catch (err) {
    console.error(`❌ Failed: ${font.name} - ${err.message}`);
  }
}

console.log('\n✨ Done! Fonts are ready in public/fonts/');
