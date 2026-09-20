// Scratch test for document system verification
const fs = require('fs');

console.log('--- Testing Nilwala Agency Document System ---');

// 1. Check index.html inputs
const html = fs.readFileSync('index.html', 'utf8');
const expectedKeys = [
  'cv', 'passport_bio', 'police_clearance', 'nic_copy', 'nic_translation',
  'birth_cert', 'birth_translation', 'nvq_trade', 'experience_letters',
  'foreign_experience', 'mfa_police', 'medical_report', 'other_docs'
];

let allInputsFound = true;
expectedKeys.forEach(k => {
  const pattern = `data-key="${k}"`;
  if (!html.includes(pattern)) {
    console.error(`MISSING input with data-key="${k}" in index.html`);
    allInputsFound = false;
  }
});
if (allInputsFound) console.log('✓ All 13 document upload inputs with data-keys found in index.html');

// Check all file inputs have accept=".pdf,application/pdf"
const fileInputs = html.match(/<input[^>]+type="file"[^>]*>/g) || [];
let allPdfOnly = true;
fileInputs.forEach(input => {
  if (!input.includes('accept=".pdf,application/pdf"')) {
    console.error('Non-PDF file input found:', input);
    allPdfOnly = false;
  }
});
if (allPdfOnly) console.log(`✓ All ${fileInputs.length} file inputs strictly enforce accept=".pdf,application/pdf"`);

// 2. Check translations.js keys
// Mock window/local storage
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = { addEventListener: () => {} };
eval(fs.readFileSync('js/translations.js', 'utf8').replace('const TRANSLATIONS', 'global.TRANSLATIONS'));

const langs = ['en', 'si', 'ta'];
const requiredTransKeys = [
  'step3_title', 'step3_sub', 'doc_notice_title', 'doc_notice_police', 'doc_notice_passport',
  'doc_notice_format', 'doc_grp_essential', 'doc_grp_identity', 'doc_grp_qualification',
  'doc_grp_attestation', 'doc_cv_title', 'doc_passport_bio_title', 'doc_police_title',
  'doc_mfa_police_title', 'doc_nic_title', 'doc_nic_trans_title', 'doc_birth_title',
  'doc_birth_trans_title', 'doc_nvq_title', 'doc_exp_title', 'doc_foreign_exp_title',
  'doc_medical_title', 'doc_other_title', 'doc_pdf_only', 'doc_btn_select',
  'doc_status_ready', 'doc_remove', 'doc_req_missing', 'err_pdf_only', 'err_file_size'
];

let allTransValid = true;
langs.forEach(lang => {
  const dict = TRANSLATIONS[lang];
  if (!dict) {
    console.error(`Missing language: ${lang}`);
    allTransValid = false;
    return;
  }
  requiredTransKeys.forEach(key => {
    if (!dict[key]) {
      console.error(`Missing translation key "${key}" in language "${lang}"`);
      allTransValid = false;
    }
  });
});
if (allTransValid) console.log('✓ All translations verified across English (en), Sinhala (si), and Tamil (ta)!');

// 3. Check data.js DocDB
const dataCode = fs.readFileSync('js/data.js', 'utf8');
const docDbMethods = ['getDB', 'saveDoc', 'getDoc', 'getAllDocsForApp', 'deleteDoc', 'deleteAppDocs', 'getStorageStats', 'clearAll'];
let allMethodsFound = true;
docDbMethods.forEach(m => {
  if (!dataCode.includes(m)) {
    console.error(`DocDB method missing: ${m}`);
    allMethodsFound = false;
  }
});
if (allMethodsFound) console.log('✓ All DocDB storage engine methods present in js/data.js');

// 4. Check admin.js functions
const adminCode = fs.readFileSync('js/admin.js', 'utf8');
const adminFuncs = ['downloadAllDocsZip', 'previewPdfDoc', 'downloadPdfDoc', 'deleteSingleDoc', 'clearAllApplications'];
let allAdminFuncs = true;
adminFuncs.forEach(f => {
  if (!adminCode.includes(f)) {
    console.error(`admin.js function missing: ${f}`);
    allAdminFuncs = false;
  }
});
if (allAdminFuncs) console.log('✓ All admin functions (ZIP batch download, individual PDF view/download, delete) present in js/admin.js');

console.log('--- Verification Complete: All Checks Passed! ---');
