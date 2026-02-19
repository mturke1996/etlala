/**
 * Download Arabic Cairo font for PDF generation
 * Run once: node scripts/download-fonts.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '..', 'public', 'fonts');

// Create directory if it doesn't exist
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

// Cairo font URLs from Google Fonts (gstatic CDN)
const fonts = [
  {
    name: 'Cairo-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/cairo/v28/SLXGc1nY6HkvamImRJqExst1.ttf',
  },
  {
    name: 'Cairo-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/cairo/v28/SLXvc1nY6HkvamImRTo9Tq4v.ttf',
  },
  {
    name: 'Cairo-SemiBold.ttf',
    url: 'https://fonts.gstatic.com/s/cairo/v28/SLXvc1nY6HkvamImRTo9TqEv.ttf',
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        file.close();
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('📥 Downloading Arabic fonts for PDF generation...\n');
  for (const font of fonts) {
    const dest = path.join(FONTS_DIR, font.name);
    if (fs.existsSync(dest)) {
      console.log(`⏭️  Already exists: ${font.name}`);
      continue;
    }
    try {
      await downloadFile(font.url, dest);
    } catch (err) {
      console.error(`❌ Failed to download ${font.name}:`, err.message);
    }
  }
  console.log('\n✨ Done! Fonts saved to public/fonts/');
}

main();
