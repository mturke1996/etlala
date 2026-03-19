const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Replace 100vh with 100dvh where minHeight or height is '100vh'
    content = content.replace(/['"]100vh['"]/g, "'100dvh'");

    // 2. Fix top padding for headers. 
    // We look for patterns like: background: (theme.palette.mode === 'light' ? 'linear-gradient(160deg, #364036 0%, #4a5d4a 100%)' : 'linear-gradient(160deg, #2a3a2a 0%, #364036 100%)')
    // OR `background: headerGradient` or `background: isDark ? ...`
    // followed closely by `p: X` or `pt: X`
    
    // It's safer to target the specific Box components that are full-screen dialog headers or page headers.
    // They usually contain: `background: headerGradient` or `background: theme.palette...`
    // Let's replace `pt: 2` and `pt: 3` in these specific header boxes.
    
    // A regex to find: `background:.*?headerGradient.*?p:\s*2` -> `background... p: 2, pt: 'calc(env(safe-area-inset-top) + 16px)'`
    content = content.replace(/(background:\s*headerGradient.*?,)(\s*p:\s*2)(,?)/gs, "$1$2, pt: 'calc(env(safe-area-inset-top) + 16px)'$3");
    
    content = content.replace(/(background:\s*theme\.palette.*?,\s*)pt:\s*3(,?)/gs, "$1pt: 'calc(env(safe-area-inset-top) + 24px)'$2");

    content = content.replace(/(background:\s*theme\.palette.*?)(color:\s*'white',\s*)p:\s*2(,?)/gs, "$1$2p: 2, pt: 'calc(env(safe-area-inset-top) + 16px)'$3");

    // Fix page header for LettersPage, InvoicesPage, etc which might use: `background: isDark \? ...`
    content = content.replace(/(background:\s*isDark\s*\?.*?,\s*)pt:\s*3(,?)/gs, "$1pt: 'calc(env(safe-area-inset-top) + 24px)'$2");

    content = content.replace(/(bgcolor:\s*isDark\s*\?.*?,\s*)pt:\s*(2|3)(,?)/gs, (match, p1, p2, p3) => {
      const val = p2 === '2' ? '16px' : '24px';
      return `${p1}pt: 'calc(env(safe-area-inset-top) + ${val})'${p3}`;
    });

    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log('Fixed:', file);
    }
  }
});
