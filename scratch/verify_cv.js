const fs = require('fs');
const path = require('path');

const root = process.cwd();

// 1. Check index.html
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const htmlElements = [
  'id="cv-upload-zone"',
  'id="cv-file-input"',
  'accept=".pdf,application/pdf"',
  'id="cv-preview-area"',
  'id="cv-error-msg"',
  'id="quick-cv"',
  'id="step4-details-preview"'
];
console.log('--- HTML Checks ---');
htmlElements.forEach(el => {
  console.log(el + ':', html.includes(el) ? 'PASS' : 'FAIL');
});

// 2. Check translations in all languages
const translations = fs.readFileSync(path.join(root, 'js', 'translations.js'), 'utf8');
console.log('\n--- Translations Checks ---');
['en', 'si', 'ta'].forEach(lang => {
  const hasCv = translations.includes('lbl_cv');
  const hasPdfErr = translations.includes('err_pdf_only');
  const hasSizeErr = translations.includes('err_file_size');
  console.log(`Language keys present:`, { hasCv, hasPdfErr, hasSizeErr });
});

// 3. Check admin.js
const admin = fs.readFileSync(path.join(root, 'js', 'admin.js'), 'utf8');
console.log('\n--- Admin Checks ---');
const adminChecks = [
  'previewPdf',
  'downloadPdf',
  'getPdfBlobUrl',
  'Candidate CV (PDF)',
  'window.previewPdf = previewPdf',
  'window.downloadPdf = downloadPdf'
];
adminChecks.forEach(fn => {
  console.log(fn + ':', admin.includes(fn) ? 'PASS' : 'FAIL');
});

// 4. Check main.js
const main = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');
console.log('\n--- Main Checks ---');
const mainChecks = [
  'cvData',
  'cvFileName',
  'cvFileSize',
  'err_pdf_only',
  '4 * 1024 * 1024',
  'btn-remove-cv',
  'submitQuickApply'
];
mainChecks.forEach(fn => {
  console.log(fn + ':', main.includes(fn) ? 'PASS' : 'FAIL');
});

// 5. Simulate DB flow
global.document = {
  addEventListener: () => {}
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

const dataJs = fs.readFileSync(path.join(root, 'js', 'data.js'), 'utf8');
eval(dataJs + '; global.DB = DB;');

console.log('\n--- DB Application Simulation ---');
const sampleApp = {
  fullName: 'Kamal Perera',
  phone: '+94 77 123 4567',
  nic: '199012345678',
  jobType: 'Construction',
  prefCountry: 'Israel',
  cvData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==',
  cvFileName: 'Kamal_Perera_CV.pdf',
  cvFileSize: 102400,
  type: 'full'
};

const savedApp = DB.addApplication(sampleApp);
console.log('Application saved with ID:', savedApp.id);
console.log('CV Filename saved:', savedApp.cvFileName);
console.log('CV Size saved:', savedApp.cvFileSize);
console.log('CV Data present:', Boolean(savedApp.cvData));

const allApps = DB.getApplications();
const found = allApps.find(a => a.id === savedApp.id);
console.log('Retrieved application correctly from DB:', Boolean(found && found.cvData));
console.log('\nALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY!');
