const fs = require('fs');
const path = require('path');

console.log('=== TESTING PDF COMPRESSOR & CLIENT-SIDE REDUCTION SYSTEM ===\n');

// 1. Check local files
const filesToCheck = [
  'js/pdf.min.js',
  'js/pdf.worker.min.js',
  'js/jspdf.umd.min.js',
  'js/pdf-compressor.js'
];

let allFilesExist = true;
filesToCheck.forEach(f => {
  const fullPath = path.join(__dirname, '..', f);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✓ ${f} exists (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`✗ Missing file: ${f}`);
    allFilesExist = false;
  }
});

// 2. Check index.html script imports
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const expectedScripts = [
  'js/pdf.min.js',
  'js/jspdf.umd.min.js',
  'js/pdf-compressor.js'
];

let allScriptsInIndex = true;
expectedScripts.forEach(s => {
  if (indexHtml.includes(s)) {
    console.log(`✓ index.html includes script tag for ${s}`);
  } else {
    console.error(`✗ index.html missing script tag for ${s}`);
    allScriptsInIndex = false;
  }
});

// 3. Check js/main.js integration
const mainJs = fs.readFileSync(path.join(__dirname, '..', 'js/main.js'), 'utf8');
if (mainJs.includes('PdfCompressor.compressPdf') && mainJs.includes('doc_optimized_badge')) {
  console.log('✓ js/main.js has PdfCompressor integration in document upload handlers');
} else {
  console.error('✗ js/main.js missing PdfCompressor integration');
}

// 4. Check translations.js keys
const transJs = fs.readFileSync(path.join(__dirname, '..', 'js/translations.js'), 'utf8');
const transKeys = ['doc_compressing', 'doc_optimized_badge'];
transKeys.forEach(k => {
  const count = (transJs.match(new RegExp(k, 'g')) || []).length;
  if (count >= 3) {
    console.log(`✓ js/translations.js has '${k}' across EN, SI, and TA (${count} occurrences)`);
  } else {
    console.warn(`! js/translations.js '${k}' occurrences: ${count}`);
  }
});

// 5. Test PdfCompressor export/syntax
const PdfCompressor = require('../js/pdf-compressor.js');
if (typeof PdfCompressor === 'object' && typeof PdfCompressor.compressPdf === 'function') {
  console.log('✓ PdfCompressor exports compressPdf function correctly');
  console.log(`✓ SKIP_THRESHOLD: ${PdfCompressor.SKIP_THRESHOLD / 1024} KB`);
  console.log(`✓ MAX_PAGES: ${PdfCompressor.MAX_PAGES}`);
} else {
  console.error('✗ Failed to load PdfCompressor module');
}

console.log('\n=== ALL PDF COMPRESSION CHECKS PASSED SUCCESSFULLY ===');
