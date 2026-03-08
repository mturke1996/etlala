/**
 * Fix PDF fonts - Download fresh Cairo TTF from Google Fonts
 * and clear Vite cache
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '..', 'public', 'fonts');
const VITE_CACHE = path.join(__dirname, '..', 'node_modules', '.vite');

// Correct URLs from Google Fonts API (verified working)
const fonts = [
  {
    name: 'Cairo-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-a1PiKQ.ttf',
  },
  {
    name: 'Cairo-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hAc5a1PiKQ.ttf',
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    // Delete existing file first
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
      console.log(`  Deleted old: ${path.basename(dest)}`);
    }
    
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(dest);
        console.log(`  ✅ Downloaded: ${path.basename(dest)} (${stats.size} bytes)`);
        
        // Verify it's a real TTF (starts with 0x00010000 or 'true')
        const buf = Buffer.alloc(4);
        const fd = fs.openSync(dest, 'r');
        fs.readSync(fd, buf, 0, 4, 0);
        fs.closeSync(fd);
        const magic = buf.toString('hex');
        if (magic === '00010000' || magic === '74727565') {
          console.log(`  ✅ Valid TrueType font verified`);
        } else {
          console.log(`  ⚠️  Warning: unexpected magic bytes: ${magic}`);
        }
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('🔧 Fixing PDF fonts...\n');
  
  // 1. Clear Vite cache
  if (fs.existsSync(VITE_CACHE)) {
    fs.rmSync(VITE_CACHE, { recursive: true, force: true });
    console.log('🗑️  Vite cache cleared\n');
  } else {
    console.log('ℹ️  No Vite cache to clear\n');
  }
  
  // 2. Ensure fonts directory exists
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }
  
  // 3. Download fresh fonts
  console.log('📥 Downloading fresh Cairo TTF fonts...');
  for (const font of fonts) {
    const dest = path.join(FONTS_DIR, font.name);
    try {
      await downloadFile(font.url, dest);
    } catch (err) {
      console.error(`  ❌ Failed: ${font.name}:`, err.message);
    }
  }
  
  console.log('\n✨ Done! Now restart the dev server:');
  console.log('   npm run dev');
}

main();
