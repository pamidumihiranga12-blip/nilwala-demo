/**
 * NILWALA AGENCY – ADMIN PANEL JAVASCRIPT
 * Full admin dashboard with CRUD for all content
 */

// ── Auth ──
const ADMIN_SESSION_KEY = 'na_admin_session';

function checkAuth() {
  if (!sessionStorage.getItem(ADMIN_SESSION_KEY)) {
    window.location.href = 'index.html';
  }
}

function logout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.href = 'index.html';
}

// ── Navigation ──
function showPanel(name) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`panel-${name}`)?.classList.add('active');
  document.querySelector(`.sidebar-link[data-panel="${name}"]`)?.classList.add('active');

  // Update header title
  const titles = {
    dashboard: { title: 'Dashboard', sub: 'Overview of your agency data' },
    jobs: { title: 'Job Vacancies', sub: 'Manage all job listings' },
    applications: { title: 'Applications', sub: 'Candidate applications received' },
    testimonials: { title: 'Testimonials', sub: 'Success story management' },
    news: { title: 'News & Updates', sub: 'Manage blog posts and announcements' },
    faq: { title: 'FAQ Management', sub: 'Frequently asked questions' },
    countries: { title: 'Countries', sub: 'Manage destination countries' },
    contact: { title: 'Contact Settings', sub: 'Update contact information' },
    settings: { title: 'Site Settings', sub: 'General configuration' },
  };
  const t = titles[name];
  if (t) {
    document.querySelector('.header-title').textContent = t.title;
    document.querySelector('.header-sub').textContent = t.sub;
  }

  // Load panel data
  switch (name) {
    case 'dashboard': loadDashboard(); break;
    case 'jobs': loadJobs(); break;
    case 'applications': loadApplications(); break;
    case 'testimonials': loadTestimonials(); break;
    case 'news': loadNews(); break;
    case 'faq': loadFAQ(); break;
    case 'countries': loadCountries(); break;
    case 'contact': loadContact(); break;
    case 'settings': loadSettings(); break;
  }
}

// ── Dashboard ──
function loadDashboard() {
  const jobs = DB.getAll(DB.KEYS.JOBS);
  const apps = DB.getAll(DB.KEYS.APPLICATIONS);
  const testi = DB.getAll(DB.KEYS.TESTIMONIALS);
  const news = DB.getAll(DB.KEYS.NEWS);

  setEl('dash-jobs', jobs.filter(j => j.active).length);
  setEl('dash-apps', apps.length);
  setEl('dash-testi', testi.length);
  setEl('dash-news', news.length);

  // Recent applications
  const tbody = document.getElementById('recent-apps-body');
  if (tbody) {
    const recent = apps.slice(0, 8);
    tbody.innerHTML = recent.length ? recent.map(a => `
      <tr>
        <td><strong>${a.fullName || '—'}</strong></td>
        <td>${a.phone || '—'}</td>
        <td>${a.jobType || 'General'}</td>
        <td>${a.pref_country || a.country || 'Any'}</td>
        <td>
          ${a.cvData ? `
            <div style="display:inline-flex;align-items:center;gap:4px;">
              <button class="btn btn-sm btn-outline-primary" onclick="previewPdf('${a.id}')" style="padding:4px 8px;font-size:0.75rem;display:inline-flex;align-items:center;gap:4px;" title="View CV (PDF)">
                <i class="fas fa-file-pdf" style="color:#E74C3C"></i> View
              </button>
              <button class="btn btn-sm btn-outline-primary" onclick="downloadPdf('${a.id}')" style="padding:4px 6px;font-size:0.75rem;" title="Download CV (PDF)">
                <i class="fas fa-download"></i>
              </button>
            </div>
          ` : `<span style="color:var(--muted);font-size:0.8rem">—</span>`}
        </td>
        <td><span class="status-badge status-${a.status || 'new'}">${a.status || 'New'}</span></td>
        <td>${formatDate(a.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="updateAppStatus('${a.id}','reviewed')">Review</button>
          <button class="btn btn-sm btn-danger" onclick="deleteApp('${a.id}')">Delete</button>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="8"><div class="empty-state"><i class="fas fa-inbox"></i><h4>No applications yet</h4></div></td></tr>`;
  }

  // Badge counts
  document.querySelectorAll('.sidebar-link[data-panel="applications"] .badge-count').forEach(el => {
    el.textContent = apps.filter(a => a.status === 'new').length;
  });
}

// ── Jobs ──
function loadJobs() {
  const jobs = DB.getAll(DB.KEYS.JOBS);
  const tbody = document.getElementById('jobs-tbody');
  if (!tbody) return;
  tbody.innerHTML = jobs.length ? jobs.map(j => `
    <tr>
      <td>${j.countryFlag || ''} <strong>${j.title}</strong></td>
      <td>${j.country}</td>
      <td><span class="status-badge" style="background:rgba(21,101,192,0.12);color:var(--primary-light)">${j.category}</span></td>
      <td>${j.salary} ${j.salaryCurrency || ''}</td>
      <td>${j.contract || '—'}</td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" ${j.active ? 'checked' : ''} onchange="toggleJobActive('${j.id}')">
          <span class="toggle-track"></span>
        </label>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editJob('${j.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteJob('${j.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-briefcase"></i><h4>No jobs yet</h4><button class="btn btn-primary" onclick="openJobModal()"><i class="fas fa-plus"></i> Add First Job</button></div></td></tr>`;
}

function openJobModal(jobId = null) {
  const modal = document.getElementById('job-modal');
  const form = document.getElementById('job-form');
  const title = document.getElementById('job-modal-title');
  modal.dataset.jobId = jobId || '';
  title.textContent = jobId ? 'Edit Job Vacancy' : 'Add New Job Vacancy';

  if (jobId) {
    const job = DB.getById(DB.KEYS.JOBS, jobId);
    if (job) {
      setFormValue('job-title', job.title);
      setFormValue('job-country', job.country);
      setFormValue('job-flag', job.countryFlag);
      setFormValue('job-category', job.category);
      setFormValue('job-salary', job.salary);
      setFormValue('job-salary-num', job.salaryNum);
      setFormValue('job-currency', job.salaryCurrency);
      setFormValue('job-salary-note', job.salaryNote);
      setFormValue('job-contract', job.contract);
      setFormValue('job-experience', job.experience);
      setFormValue('job-description', job.description);
      setFormValue('job-requirements', (job.requirements || []).join('\n'));
      setFormValue('job-benefits', (job.benefits || []).join('\n'));
    }
  } else {
    form.reset();
  }
  openModal('job-modal');
}

function saveJob() {
  const modal = document.getElementById('job-modal');
  const jobId = modal.dataset.jobId;
  const data = {
    title: getFormValue('job-title'),
    country: getFormValue('job-country'),
    countryFlag: getFormValue('job-flag'),
    category: getFormValue('job-category'),
    salary: getFormValue('job-salary'),
    salaryNum: parseFloat(getFormValue('job-salary-num')) || 0,
    salaryCurrency: getFormValue('job-currency'),
    salaryNote: getFormValue('job-salary-note'),
    contract: getFormValue('job-contract'),
    experience: getFormValue('job-experience'),
    description: getFormValue('job-description'),
    requirements: getFormValue('job-requirements').split('\n').filter(Boolean),
    benefits: getFormValue('job-benefits').split('\n').filter(Boolean),
    active: true,
  };
  if (!data.title || !data.country) { showAdminAlert('Please fill in required fields.', 'danger'); return; }
  if (jobId) {
    DB.updateJob(jobId, data);
    showAdminAlert('Job updated successfully!', 'success');
  } else {
    DB.addJob(data);
    showAdminAlert('Job added successfully!', 'success');
  }
  closeModal('job-modal');
  loadJobs();
}

function editJob(id) { openJobModal(id); }

function deleteJob(id) {
  if (!confirm('Delete this job vacancy?')) return;
  DB.deleteJob(id);
  loadJobs();
}

function toggleJobActive(id) { DB.toggleJob(id); loadJobs(); }

// ── Applications ──
function loadApplications() {
  const apps = DB.getApplications();
  const filter = document.getElementById('app-filter')?.value || 'all';
  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const tbody = document.getElementById('apps-tbody');
  if (!tbody) return;

  tbody.innerHTML = filtered.length ? filtered.map(a => `
    <tr>
      <td><strong>${a.fullName || '—'}</strong><br><small style="color:var(--muted)">${a.email || ''}</small></td>
      <td>${a.phone || '—'}</td>
      <td>${a.nic || '—'}</td>
      <td>${a.jobType || 'General'}</td>
      <td>${a.country || a.pref_country || 'Any'}</td>
      <td>
        ${a.cvData ? `
          <div style="display:inline-flex;align-items:center;gap:4px;">
            <button class="btn btn-sm btn-outline-primary" onclick="previewPdf('${a.id}')" style="padding:3px 7px;font-size:0.75rem;" title="View PDF CV">
              <i class="fas fa-file-pdf" style="color:#E74C3C"></i> View
            </button>
            <button class="btn btn-sm btn-outline-primary" onclick="downloadPdf('${a.id}')" style="padding:3px 7px;font-size:0.75rem;" title="Download PDF">
              <i class="fas fa-download"></i>
            </button>
          </div>
        ` : `<span style="color:var(--muted);font-size:0.8rem">No CV</span>`}
      </td>
      <td>
        <select onchange="updateAppStatus('${a.id}', this.value)" style="border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:0.8rem;outline:none;">
          <option value="new" ${a.status==='new'?'selected':''}>New</option>
          <option value="reviewed" ${a.status==='reviewed'?'selected':''}>Reviewed</option>
          <option value="approved" ${a.status==='approved'?'selected':''}>Approved</option>
          <option value="rejected" ${a.status==='rejected'?'selected':''}>Rejected</option>
        </select>
      </td>
      <td>${formatDate(a.createdAt)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewApp('${a.id}')"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteApp('${a.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="9"><div class="empty-state"><i class="fas fa-inbox"></i><h4>No applications found</h4></div></td></tr>`;
}

function updateAppStatus(id, status) {
  DB.updateApplicationStatus(id, status);
  loadApplications();
  loadDashboard();
}

function deleteApp(id) {
  if (!confirm('Delete this application?')) return;
  DB.deleteApplication(id);
  loadApplications();
  loadDashboard();
}

function viewApp(id) {
  const app = DB.getById(DB.KEYS.APPLICATIONS, id);
  if (!app) return;
  document.getElementById('view-app-content').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">FULL NAME</label><div style="font-weight:600">${app.fullName || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">PHONE</label><div style="font-weight:600">${app.phone || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">NIC</label><div>${app.nic || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">DOB</label><div>${app.dob || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">GENDER</label><div>${app.gender || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">EMAIL</label><div>${app.email || '—'}</div></div>
      <div style="grid-column:1/-1"><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">ADDRESS</label><div>${app.address || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">JOB TYPE</label><div>${app.jobType || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">PREFERRED COUNTRY</label><div>${app.country || app.pref_country || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">EDUCATION</label><div>${app.education || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">QUALIFICATION</label><div>${app.qualification || '—'}</div></div>
      <div style="grid-column:1/-1"><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">EXPERIENCE</label><div>${app.experience || '—'}</div></div>
      <div style="grid-column:1/-1"><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">SKILLS</label><div>${app.skills || '—'}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">APPLIED ON</label><div>${formatDate(app.createdAt)}</div></div>
      <div><label style="font-size:0.75rem;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;">STATUS</label><span class="status-badge status-${app.status||'new'}">${app.status||'New'}</span></div>
      <div style="grid-column:1/-1;background:#F8F9FF;border:1px solid #E0E7FF;border-radius:10px;padding:16px;margin-top:10px;">
        <label style="font-size:0.75rem;color:var(--primary);font-weight:800;display:flex;align-items:center;gap:8px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
          <i class="fas fa-file-pdf" style="color:#E74C3C;font-size:1.2rem"></i> Candidate CV (PDF)
        </label>
        ${app.cvData ? `
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;background:white;padding:12px 16px;border-radius:8px;border:1px solid #E8EEFF;">
            <div style="display:flex;align-items:center;gap:12px;">
              <i class="fas fa-file-pdf" style="color:#E74C3C;font-size:2rem"></i>
              <div>
                <div style="font-weight:700;font-size:0.95rem;color:var(--text);">${app.cvFileName || 'Candidate_CV.pdf'}</div>
                <small style="color:var(--muted);">${app.cvFileSize ? (app.cvFileSize / 1024).toFixed(0) + ' KB' : 'PDF Document'}</small>
              </div>
            </div>
            <div style="display:flex;gap:8px;">
              <button type="button" class="btn btn-sm btn-primary" onclick="previewPdf('${app.id}')" style="display:inline-flex;align-items:center;gap:6px;">
                <i class="fas fa-eye"></i> View CV
              </button>
              <button type="button" class="btn btn-sm btn-accent" onclick="downloadPdf('${app.id}')" style="display:inline-flex;align-items:center;gap:6px;">
                <i class="fas fa-download"></i> Download PDF
              </button>
            </div>
          </div>
        ` : `
          <div style="color:var(--muted);font-size:0.85rem;font-style:italic;background:white;padding:10px 14px;border-radius:8px;">No CV uploaded for this applicant.</div>
        `}
      </div>
    </div>
  `;
  openModal('view-app-modal');
}

function getPdfBlobUrl(cvData) {
  if (!cvData) return null;
  try {
    const parts = cvData.split(',');
    const base64Str = parts.length > 1 ? parts[1] : parts[0];
    const byteCharacters = atob(base64Str);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Error creating PDF blob:', e);
    return null;
  }
}

function previewPdf(appId) {
  const app = DB.getById(DB.KEYS.APPLICATIONS, appId);
  if (!app || !app.cvData) {
    alert('No CV data found for this applicant.');
    return;
  }
  const blobUrl = getPdfBlobUrl(app.cvData);
  if (blobUrl) {
    window.open(blobUrl, '_blank');
  } else {
    window.open(app.cvData, '_blank');
  }
}

function downloadPdf(appId) {
  const app = DB.getById(DB.KEYS.APPLICATIONS, appId);
  if (!app || !app.cvData) {
    alert('No CV data found for this applicant.');
    return;
  }
  const filename = app.cvFileName || ((app.fullName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_') + '_CV.pdf');
  const blobUrl = getPdfBlobUrl(app.cvData);
  const a = document.createElement('a');
  a.href = blobUrl || app.cvData;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (blobUrl) {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  }
}

window.previewPdf = previewPdf;
window.downloadPdf = downloadPdf;

// ── Testimonials ──
function loadTestimonials() {
  const items = DB.getAll(DB.KEYS.TESTIMONIALS);
  const tbody = document.getElementById('testi-tbody');
  if (!tbody) return;
  tbody.innerHTML = items.length ? items.map(t => `
    <tr>
      <td><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--primary-light),var(--primary));display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.9rem">${t.initials||t.name[0]}</div></td>
      <td><strong>${t.name}</strong></td>
      <td>${t.role}</td>
      <td>${t.country}</td>
      <td>${'⭐'.repeat(t.rating||5)}</td>
      <td><label class="toggle-switch"><input type="checkbox" ${t.active?'checked':''} onchange="toggleTesti('${t.id}')"><span class="toggle-track"></span></label></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editTesti('${t.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteTesti('${t.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-star"></i><h4>No testimonials yet</h4><button class="btn btn-primary" onclick="openTestiModal()"><i class="fas fa-plus"></i> Add First</button></div></td></tr>`;
}

function openTestiModal(id = null) {
  const modal = document.getElementById('testi-modal');
  modal.dataset.id = id || '';
  document.getElementById('testi-modal-title').textContent = id ? 'Edit Testimonial' : 'Add Testimonial';
  if (id) {
    const t = DB.getById(DB.KEYS.TESTIMONIALS, id);
    if (t) {
      setFormValue('testi-name', t.name);
      setFormValue('testi-role', t.role);
      setFormValue('testi-country', t.country);
      setFormValue('testi-initials', t.initials);
      setFormValue('testi-rating', t.rating || 5);
      setFormValue('testi-text', t.text);
    }
  } else {
    document.getElementById('testi-form')?.reset();
  }
  openModal('testi-modal');
}

function saveTesti() {
  const modal = document.getElementById('testi-modal');
  const id = modal.dataset.id;
  const data = {
    name: getFormValue('testi-name'),
    role: getFormValue('testi-role'),
    country: getFormValue('testi-country'),
    initials: getFormValue('testi-initials'),
    rating: parseInt(getFormValue('testi-rating')) || 5,
    text: getFormValue('testi-text'),
    active: true,
  };
  if (!data.name || !data.text) { showAdminAlert('Name and text are required.', 'danger'); return; }
  if (id) DB.updateTestimonial(id, data);
  else DB.addTestimonial(data);
  closeModal('testi-modal');
  loadTestimonials();
  showAdminAlert('Testimonial saved!', 'success');
}

function editTesti(id) { openTestiModal(id); }
function deleteTesti(id) { if (!confirm('Delete this testimonial?')) return; DB.deleteTestimonial(id); loadTestimonials(); }
function toggleTesti(id) { const t = DB.getById(DB.KEYS.TESTIMONIALS, id); if (t) DB.updateTestimonial(id, { active: !t.active }); loadTestimonials(); }

// ── News ──
function loadNews() {
  const items = DB.getAll(DB.KEYS.NEWS);
  const tbody = document.getElementById('news-tbody');
  if (!tbody) return;
  tbody.innerHTML = items.length ? items.map(n => `
    <tr>
      <td style="font-size:1.5rem">${n.emoji||'📰'}</td>
      <td><strong>${n.title}</strong></td>
      <td><span class="status-badge badge-primary" style="background:rgba(21,101,192,0.12);color:var(--primary-light)">${n.category}</span></td>
      <td>${formatDate(n.date)}</td>
      <td><label class="toggle-switch"><input type="checkbox" ${n.active?'checked':''} onchange="toggleNews('${n.id}')"><span class="toggle-track"></span></label></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editNews('${n.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteNews('${n.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-newspaper"></i><h4>No news yet</h4><button class="btn btn-primary" onclick="openNewsModal()"><i class="fas fa-plus"></i> Add News</button></div></td></tr>`;
}

function openNewsModal(id = null) {
  document.getElementById('news-modal').dataset.id = id || '';
  document.getElementById('news-modal-title').textContent = id ? 'Edit News' : 'Add News';
  if (id) {
    const n = DB.getById(DB.KEYS.NEWS, id);
    if (n) {
      setFormValue('news-title', n.title);
      setFormValue('news-excerpt', n.excerpt);
      setFormValue('news-category', n.category);
      setFormValue('news-emoji', n.emoji);
    }
  } else { document.getElementById('news-form')?.reset(); }
  openModal('news-modal');
}

function saveNews() {
  const modal = document.getElementById('news-modal');
  const id = modal.dataset.id;
  const data = {
    title: getFormValue('news-title'),
    excerpt: getFormValue('news-excerpt'),
    category: getFormValue('news-category'),
    emoji: getFormValue('news-emoji') || '📰',
    date: new Date().toISOString(),
    active: true,
  };
  if (!data.title) { showAdminAlert('Title is required.', 'danger'); return; }
  if (id) DB.updateNews(id, data);
  else DB.addNews(data);
  closeModal('news-modal');
  loadNews();
  showAdminAlert('News saved!', 'success');
}

function editNews(id) { openNewsModal(id); }
function deleteNews(id) { if (!confirm('Delete this news post?')) return; DB.deleteNews(id); loadNews(); }
function toggleNews(id) { const n = DB.getById(DB.KEYS.NEWS, id); if (n) DB.updateNews(id, { active: !n.active }); loadNews(); }

// ── FAQ ──
function loadFAQ() {
  const items = DB.getAll(DB.KEYS.FAQ);
  const tbody = document.getElementById('faq-tbody');
  if (!tbody) return;
  tbody.innerHTML = items.length ? items.map((f, i) => `
    <tr>
      <td style="color:var(--muted);font-weight:600">${i + 1}</td>
      <td><strong>${f.question}</strong></td>
      <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)">${f.answer}</td>
      <td><label class="toggle-switch"><input type="checkbox" ${f.active?'checked':''} onchange="toggleFAQItem('${f.id}')"><span class="toggle-track"></span></label></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editFAQ('${f.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteFAQ('${f.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-question-circle"></i><h4>No FAQ items yet</h4><button class="btn btn-primary" onclick="openFAQModal()"><i class="fas fa-plus"></i> Add FAQ</button></div></td></tr>`;
}

function openFAQModal(id = null) {
  document.getElementById('faq-modal').dataset.id = id || '';
  document.getElementById('faq-modal-title').textContent = id ? 'Edit FAQ' : 'Add FAQ';
  if (id) {
    const f = DB.getById(DB.KEYS.FAQ, id);
    if (f) { setFormValue('faq-question', f.question); setFormValue('faq-answer', f.answer); }
  } else { document.getElementById('faq-form')?.reset(); }
  openModal('faq-modal');
}

function saveFAQ() {
  const modal = document.getElementById('faq-modal');
  const id = modal.dataset.id;
  const data = { question: getFormValue('faq-question'), answer: getFormValue('faq-answer'), active: true };
  if (!data.question || !data.answer) { showAdminAlert('Both fields are required.', 'danger'); return; }
  if (id) DB.updateFAQ(id, data);
  else DB.addFAQ(data);
  closeModal('faq-modal');
  loadFAQ();
  showAdminAlert('FAQ saved!', 'success');
}

function editFAQ(id) { openFAQModal(id); }
function deleteFAQ(id) { if (!confirm('Delete this FAQ?')) return; DB.deleteFAQ(id); loadFAQ(); }
function toggleFAQItem(id) { const f = DB.getById(DB.KEYS.FAQ, id); if (f) DB.updateFAQ(id, { active: !f.active }); loadFAQ(); }

// ── Countries ──
function loadCountries() {
  const items = DB.getAll(DB.KEYS.COUNTRIES);
  const tbody = document.getElementById('countries-tbody');
  if (!tbody) return;
  tbody.innerHTML = items.length ? items.map(c => `
    <tr>
      <td style="font-size:2rem">${c.flag}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.region || 'Middle East'}</td>
      <td><input type="number" value="${c.jobs||0}" min="0" onchange="updateCountryJobs('${c.id}', this.value)" style="width:60px;border:1px solid var(--border);border-radius:6px;padding:4px 8px;text-align:center;" /></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteCountry('${c.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-globe"></i><h4>No countries</h4></div></td></tr>`;
}

function updateCountryJobs(id, val) {
  DB.updateItem(DB.KEYS.COUNTRIES, id, { jobs: parseInt(val) || 0 });
}

function addCountry() {
  const name = getFormValue('new-country-name');
  const flag = getFormValue('new-country-flag');
  if (!name || !flag) { showAdminAlert('Name and flag required.', 'danger'); return; }
  DB.addItem(DB.KEYS.COUNTRIES, { name, flag, region: 'Middle East', jobs: 0 });
  setFormValue('new-country-name', '');
  setFormValue('new-country-flag', '');
  loadCountries();
  showAdminAlert('Country added!', 'success');
}

function deleteCountry(id) {
  if (!confirm('Remove this country?')) return;
  DB.deleteItem(DB.KEYS.COUNTRIES, id);
  loadCountries();
}

// ── Contact Settings ──
function loadContact() {
  const s = DB.getSettings();
  setFormValue('s-hotline1', s.hotline1 || '037 223 2000');
  setFormValue('s-hotline2', s.hotline2 || '037 205 6000');
  setFormValue('s-hotline3', s.hotline3 || '072 780 0800');
  setFormValue('s-md-name', s.mdName || 'W.A.N.S. Wijesinghe');
  setFormValue('s-md-phone', s.mdPhone || '0777-209 189');
  setFormValue('s-whatsapp', s.whatsapp || '+94 77 720 9189');
  setFormValue('s-email', s.email || 'info@nilwalaagencies.com');
  setFormValue('s-address', s.address || 'No. 135, 2nd Floor, Sarasavi Building, Colombo Road, Kurunegala, Sri Lanka');
  setFormValue('s-facebook', s.facebook);
  setFormValue('s-instagram', s.instagram);
  setFormValue('s-youtube', s.youtube);
  setFormValue('s-map', s.mapEmbed);
}

function saveContact() {
  const s = DB.getSettings();
  const updated = {
    ...s,
    phone: getFormValue('s-hotline1') || '037 223 2000',
    hotline1: getFormValue('s-hotline1') || '037 223 2000',
    hotline2: getFormValue('s-hotline2') || '037 205 6000',
    hotline3: getFormValue('s-hotline3') || '072 780 0800',
    hotlines: `${getFormValue('s-hotline1') || '037 223 2000'}, ${getFormValue('s-hotline2') || '037 205 6000'}, ${getFormValue('s-hotline3') || '072 780 0800'}`,
    mdName: getFormValue('s-md-name') || 'W.A.N.S. Wijesinghe',
    mdPhone: getFormValue('s-md-phone') || '0777-209 189',
    whatsapp: getFormValue('s-whatsapp') || '+94 77 720 9189',
    email: getFormValue('s-email') || 'info@nilwalaagencies.com',
    address: getFormValue('s-address') || 'No. 135, 2nd Floor, Sarasavi Building, Colombo Road, Kurunegala, Sri Lanka',
    facebook: getFormValue('s-facebook'),
    instagram: getFormValue('s-instagram'),
    youtube: getFormValue('s-youtube'),
    mapEmbed: getFormValue('s-map'),
  };
  DB.saveSettings(updated);
  showAdminAlert('Contact information saved successfully!', 'success');
}

// ── Settings ──
function loadSettings() {
  const s = DB.getSettings();
  setFormValue('setting-sitename', s.siteName);
  setFormValue('setting-tagline', s.tagline);
  setFormValue('setting-password', '');
}

function saveSettings() {
  const s = DB.getSettings();
  const newPass = getFormValue('setting-password');
  const updated = {
    ...s,
    siteName: getFormValue('setting-sitename'),
    tagline: getFormValue('setting-tagline'),
  };
  if (newPass && newPass.length >= 6) {
    updated.adminPassword = newPass;
    showAdminAlert('Password updated!', 'success');
  } else if (newPass) {
    showAdminAlert('Password must be at least 6 characters.', 'danger');
    return;
  }
  DB.saveSettings(updated);
  showAdminAlert('Settings saved!', 'success');
}

function clearAllData() {
  if (!confirm('⚠️ This will DELETE all applications, jobs, testimonials, news, and FAQ data. Are you absolutely sure?')) return;
  if (!confirm('Last chance! This cannot be undone. Continue?')) return;
  Object.values(DB.KEYS).forEach(k => {
    if (k !== DB.KEYS.SETTINGS) localStorage.removeItem(k);
  });
  DB.seed();
  showAdminAlert('All data cleared and reset to defaults.', 'success');
  loadDashboard();
}

// ── Modal Utils ──
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('admin-modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── Form Utils ──
function getFormValue(id) { return document.getElementById(id)?.value || ''; }
function setFormValue(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }
function setEl(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

// ── Alert ──
function showAdminAlert(msg, type = 'success') {
  const existing = document.getElementById('admin-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'admin-toast';
  toast.style.cssText = `
    position:fixed;bottom:28px;right:28px;z-index:99999;
    background:${type==='success'?'#2ECC71':'#E74C3C'};
    color:white;padding:14px 22px;border-radius:10px;
    font-family:var(--font-main);font-weight:600;font-size:0.9rem;
    box-shadow:0 8px 24px rgba(0,0,0,0.2);
    opacity:0;transform:translateY(16px);transition:all 0.4s ease;
    display:flex;align-items:center;gap:10px;
  `;
  toast.innerHTML = `<i class="fas fa-${type==='success'?'check':'exclamation'}-circle"></i>${msg}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity='1'; toast.style.transform='translateY(0)'; });
  setTimeout(() => { toast.style.opacity='0'; setTimeout(() => toast.remove(), 400); }, 3500);
}

// ── Date Format ──
function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}
