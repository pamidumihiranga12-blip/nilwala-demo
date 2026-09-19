/**
 * NILWALA AGENCY – MAIN JAVASCRIPT
 * Animations, interactions, dynamic content rendering, multilingual engine & LKR currency
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initParticles();
  initTypewriter();
  initMobileMenu();
  initAnimateOnScroll();
  initCounters();
  initTicker();
  renderJobCategories();
  renderCountries();
  renderJobs();
  renderTimeline();
  renderTestimonials();
  renderTraining();
  renderNews();
  renderFAQ();
  renderAbout();
  initJobFilters();
  initMultiStepForm();
  initFAQAccordion();
  initTestimonialsSlider();
  initContactForm();
  initLanguageToggle();
  initBackToTop();
  initHeroStats();
  updateVacancyCount();
  initAboutTabs();
  initModal();
  initNewsletterForm();
});

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const scrolled = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    bar.style.width = scrolled + '%';
  }, { passive: true });
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.remove('transparent');
      nav.classList.add('solid');
    } else {
      nav.classList.add('transparent');
      nav.classList.remove('solid');
    }
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  // Active link tracking
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active-nav', l.dataset.section === current);
    });
  }, { passive: true });
}

/* ============================================================
   PARTICLE ANIMATION (Canvas)
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let animFrame;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.r = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 160, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 70; i++) particles.push(new Particle());

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(100, 160, 255, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    animFrame = requestAnimationFrame(animate);
  }
  animate();
}

/* ============================================================
   TYPEWRITER EFFECT (Multilingual)
   ============================================================ */
let typewriterTimer = null;
function initTypewriter() {
  const el = document.querySelector('.typewriter');
  if (!el) return;
  if (typewriterTimer) clearTimeout(typewriterTimer);

  const lang = getCurrentLanguage();
  const phrases = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang] && TRANSLATIONS[lang].typewriter)
    ? TRANSLATIONS[lang].typewriter
    : (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.typewriter && DYNAMIC_TRANSLATIONS.typewriter[lang])
      ? DYNAMIC_TRANSLATIONS.typewriter[lang]
      : [
          'Foreign Employment Agency Since 1996',
          'High Salary Vacancies in LKR Currency',
          'Approved Opportunities in Israel, UAE, Saudi Arabia, Qatar & Kuwait',
          'Your Trusted Gateway to Global Careers – L.L. No: 1268',
        ];

  let pi = 0, ci = 0, deleting = false;
  function type() {
    const phrase = phrases[pi] || phrases[0];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; typewriterTimer = setTimeout(type, 2000); return; }
    } else {
      el.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    typewriterTimer = setTimeout(type, deleting ? 30 : 60);
  }
  type();
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      menu.classList.remove('open');
    });
  });
}

/* ============================================================
   ANIMATE ON SCROLL (AOS)
   ============================================================ */
function initAnimateOnScroll() {
  const els = document.querySelectorAll('.aos:not(.visible)');
  if (els.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Number(delay));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ============================================================
   COUNTERS
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.counter:not(.counted)');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('counted');
        const target = Number(el.dataset.target || 0);
        const suffix = el.dataset.suffix || '';
        let count = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const timer = setInterval(() => {
          count += step;
          if (count >= target) {
            count = target;
            clearInterval(timer);
          }
          el.textContent = count.toLocaleString() + suffix;
        }, 30);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(c => observer.observe(c));
}

/* ============================================================
   TICKER
   ============================================================ */
function initTicker() {
  // Already animated via CSS keyframes in style.css
}

/* ============================================================
   RENDER JOB CATEGORIES (Multilingual)
   ============================================================ */
function renderJobCategories() {
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  const lang = getCurrentLanguage();
  const categories = [
    { icon: 'fa-hard-hat', name: 'Construction', sub: 'Steel, Mason, Carpenter', jobs: 3 },
    { icon: 'fa-heartbeat', name: 'Healthcare', sub: 'Caregivers & Nurses', jobs: 4 },
    { icon: 'fa-broom', name: 'Domestic', sub: 'Domestic Workers', jobs: 3 },
    { icon: 'fa-bolt', name: 'Skilled Tech', sub: 'Electricians, Welders', jobs: 5 },
    { icon: 'fa-truck', name: 'Driving', sub: 'Heavy Vehicle Drivers', jobs: 2 },
    { icon: 'fa-tools', name: 'Mechanics', sub: 'Auto & Industry', jobs: 3 },
    { icon: 'fa-spray-can', name: 'Cleaning', sub: 'Facility & Office', jobs: 2 },
    { icon: 'fa-user-nurse', name: 'House Nurses', sub: 'Home Care Specialists', jobs: 4 },
  ];
  grid.innerHTML = categories.map((c, i) => {
    let name = c.name;
    let sub = c.sub;
    if (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.categories[c.name] && DYNAMIC_TRANSLATIONS.categories[c.name][lang]) {
      name = DYNAMIC_TRANSLATIONS.categories[c.name][lang].name;
      sub = DYNAMIC_TRANSLATIONS.categories[c.name][lang].sub;
    }
    return `
    <div class="category-card aos fade-up" data-delay="${i * 60}" onclick="scrollToSection('vacancies')">
      <div class="cat-icon"><i class="fas ${c.icon}"></i></div>
      <div class="cat-name">${name}</div>
      <div class="cat-count">${sub}</div>
    </div>
  `; }).join('');
  initAnimateOnScroll();
}

/* ============================================================
   FLAG UTILITIES (SVG Flags for 100% Cross-Platform Support)
   ============================================================ */
function getCountryCode(name) {
  if (!name) return 'lk';
  const c = String(name).toLowerCase();
  if (c.includes('israel')) return 'il';
  if (c.includes('saudi')) return 'sa';
  if (c.includes('uae') || c.includes('emirates') || c.includes('dubai')) return 'ae';
  if (c.includes('qatar')) return 'qa';
  if (c.includes('kuwait')) return 'kw';
  if (c.includes('oman')) return 'om';
  if (c.includes('bahrain')) return 'bh';
  return 'lk';
}

function getFlagHtml(countryName, countryCode, extraClass = '') {
  const code = (countryCode || getCountryCode(countryName)).toLowerCase();
  return `<img src="images/flags/${code}.svg" alt="${countryName || 'flag'}" class="flag-icon ${extraClass}" loading="lazy" onerror="this.onerror=null;this.src='https://flagcdn.com/w80/${code}.png';" />`;
}

function filterJobsByCountry(countryName) {
  const select = document.getElementById('filter-country');
  if (select) {
    select.value = countryName;
    renderJobs({ country: countryName });
  }
  scrollToSection('vacancies');
}

/* ============================================================
   RENDER COUNTRIES (Multilingual & SVG Flags)
   ============================================================ */
function renderCountries() {
  const grid = document.getElementById('countries-grid');
  if (!grid) return;
  const lang = getCurrentLanguage();
  const countries = DB.getCountries();
  const tVacancies = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang] && TRANSLATIONS[lang].vacancies_avail)
    ? TRANSLATIONS[lang].vacancies_avail
    : 'Vacancies Available';

  grid.innerHTML = countries.map((c, i) => {
    const locName = (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.countries[c.name] && DYNAMIC_TRANSLATIONS.countries[c.name][lang])
      ? DYNAMIC_TRANSLATIONS.countries[c.name][lang]
      : c.name;
    const flagHtml = getFlagHtml(c.name, c.code);
    return `
    <div class="country-card aos zoom-in" data-delay="${i * 60}" onclick="filterJobsByCountry('${c.name}')" title="View jobs in ${c.name}">
      <div class="country-flag">${flagHtml}</div>
      <div class="country-name">${locName}</div>
      <div class="country-jobs">${c.jobs || 0} ${tVacancies}</div>
    </div>
  `; }).join('');
  initAnimateOnScroll();
}

/* ============================================================
   RENDER JOB VACANCIES (LKR Currency & Multilingual)
   ============================================================ */
function renderJobs(filters = {}) {
  const grid = document.getElementById('jobs-grid');
  if (!grid) return;
  const lang = getCurrentLanguage();
  const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : TRANSLATIONS.en;
  const jobs = DB.getJobs(filters);

  if (jobs.length === 0) {
    grid.innerHTML = `<div class="jobs-empty">
      <i class="fas fa-search"></i>
      <h4>${t.filter_not_found}</h4>
      <p>${t.filter_not_found_desc}</p>
    </div>`;
    return;
  }

  grid.innerHTML = jobs.map((job, i) => {
    const locCountry = (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.countries[job.country] && DYNAMIC_TRANSLATIONS.countries[job.country][lang])
      ? DYNAMIC_TRANSLATIONS.countries[job.country][lang]
      : job.country;
    const flagHtml = getFlagHtml(job.country, job.countryCode);
    return `
    <div class="job-card aos fade-up" data-delay="${(i % 3) * 100}">
      <div class="job-card-header">
        <div class="job-flag">${flagHtml}</div>
        <div class="job-title">${job.title}</div>
        <div class="job-location"><i class="fas fa-map-marker-alt"></i> ${locCountry} &bull; ${job.contract} ${t.contract}</div>
      </div>
      <div class="job-card-body">
        <div class="job-salary">
          ${job.salary}
          <span class="currency">${job.salaryCurrency ? t.per_month : ''} ${job.salaryNote ? '(' + job.salaryNote + ')' : ''}</span>
        </div>
        <div class="job-details">
          ${job.requirements ? job.requirements.slice(0, 2).map(r => `
            <div class="job-detail-item"><i class="fas fa-check-circle"></i><span>${r}</span></div>
          `).join('') : ''}
        </div>
        <div class="job-benefits">
          ${(job.benefits || []).map(b => `<span class="benefit-tag">✓ ${b}</span>`).join('')}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" onclick="openApplyModal('${job.id}', '${job.title.replace(/'/g, "\\'")}', '${job.country}')">
            <i class="fas fa-paper-plane"></i> ${t.btn_apply_now}
          </button>
          <button class="btn btn-outline-primary btn-sm" onclick="openJobDetail('${job.id}')">
            <i class="fas fa-info-circle"></i> ${t.btn_details}
          </button>
        </div>
      </div>
    </div>
  `; }).join('');
  initAnimateOnScroll();
}

/* ============================================================
   JOB FILTERS
   ============================================================ */
function initJobFilters() {
  const filterBtn = document.getElementById('filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      const country = document.getElementById('filter-country')?.value;
      const category = document.getElementById('filter-category')?.value;
      const experience = document.getElementById('filter-exp')?.value;
      const salary = document.getElementById('filter-salary')?.value;
      renderJobs({ country, category, experience, salary });
    });
  }

  document.getElementById('filter-reset')?.addEventListener('click', () => {
    ['filter-country', 'filter-category', 'filter-exp', 'filter-salary'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderJobs();
  });
}

/* ============================================================
   RENDER TIMELINE (Multilingual)
   ============================================================ */
function renderTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;
  const lang = getCurrentLanguage();
  const steps = (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.timeline && DYNAMIC_TRANSLATIONS.timeline[lang])
    ? DYNAMIC_TRANSLATIONS.timeline[lang]
    : DYNAMIC_TRANSLATIONS.timeline.en;
  const icons = ['fa-file-alt', 'fa-comments', 'fa-handshake', 'fa-passport', 'fa-file-medical', 'fa-folder-open', 'fa-plane-departure'];

  container.innerHTML = steps.map((s, i) => `
    <div class="timeline-item aos ${i % 2 === 0 ? 'fade-right' : 'fade-left'}" data-delay="${i * 100}">
      <div class="timeline-side">
        <div class="timeline-content">
          <h4>${s.title}</h4>
          <p>${s.desc}</p>
        </div>
      </div>
      <div class="timeline-center">
        <div class="timeline-step"><i class="fas ${icons[i] || 'fa-check'}"></i></div>
        ${i < steps.length - 1 ? '<div class="timeline-line"></div>' : ''}
      </div>
      <div class="timeline-side"></div>
    </div>
  `).join('');
  initAnimateOnScroll();
}

/* ============================================================
   RENDER TESTIMONIALS
   ============================================================ */
function renderTestimonials() {
  const track = document.getElementById('testimonials-track');
  if (!track) return;
  const all = DB.getTestimonials();
  const slides = [];
  for (let i = 0; i < all.length; i += 2) {
    slides.push(all.slice(i, i + 2));
  }
  track.innerHTML = slides.map(pair => `
    <div class="testimonial-slide">
      <div class="testimonial-grid">
        ${pair.map(t => `
          <div class="testimonial-card">
            <div class="testimonial-header">
              <div class="testimonial-avatar">${t.initials || t.name[0]}</div>
              <div class="testimonial-info">
                <div class="name">${t.name}</div>
                <div class="role">${t.role}</div>
              </div>
            </div>
            <div class="testimonial-stars">
              ${'<i class="fas fa-star"></i>'.repeat(t.rating || 5)}
            </div>
            <p class="testimonial-text">"${t.text}"</p>
            <div class="testimonial-country">${getFlagHtml(t.country, null, 'testimonial-flag-icon')} <span>${t.country.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '').trim()}</span></div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  updateSliderDots(slides.length);
}

/* ============================================================
   TESTIMONIALS SLIDER
   ============================================================ */
let currentSlide = 0;
let sliderInterval;

function initTestimonialsSlider() {
  const track = document.getElementById('testimonials-track');
  if (!track) return;
  startAutoSlide();

  document.getElementById('prev-slide')?.addEventListener('click', () => {
    const count = track.querySelectorAll('.testimonial-slide').length;
    currentSlide = (currentSlide - 1 + count) % count;
    updateSlider();
    resetAutoSlide();
  });
  document.getElementById('next-slide')?.addEventListener('click', () => {
    const count = track.querySelectorAll('.testimonial-slide').length;
    currentSlide = (currentSlide + 1) % count;
    updateSlider();
    resetAutoSlide();
  });
}

function updateSlider() {
  const track = document.getElementById('testimonials-track');
  if (!track) return;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  updateSliderDots(track.querySelectorAll('.testimonial-slide').length);
}

function updateSliderDots(count) {
  const dotsEl = document.getElementById('slider-dots');
  if (!dotsEl) return;
  dotsEl.innerHTML = Array.from({ length: count }, (_, i) => `
    <div class="slider-dot ${i === currentSlide ? 'active' : ''}" onclick="goToSlide(${i})"></div>
  `).join('');
}

function goToSlide(i) {
  currentSlide = i;
  updateSlider();
  resetAutoSlide();
}

function startAutoSlide() {
  sliderInterval = setInterval(() => {
    const track = document.getElementById('testimonials-track');
    if (!track) return;
    const count = track.querySelectorAll('.testimonial-slide').length;
    if (count <= 1) return;
    currentSlide = (currentSlide + 1) % count;
    updateSlider();
  }, 5000);
}

function resetAutoSlide() {
  clearInterval(sliderInterval);
  startAutoSlide();
}

/* ============================================================
   RENDER TRAINING (Multilingual)
   ============================================================ */
function renderTraining() {
  const grid = document.getElementById('training-grid');
  if (!grid) return;
  const lang = getCurrentLanguage();
  const items = (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.training && DYNAMIC_TRANSLATIONS.training[lang])
    ? DYNAMIC_TRANSLATIONS.training[lang]
    : DYNAMIC_TRANSLATIONS.training.en;

  grid.innerHTML = items.map((item, i) => `
    <div class="training-card aos zoom-in" data-delay="${i * 80}">
      <div class="training-card-inner">
        <div class="training-card-front">
          <div class="training-icon">${item.icon}</div>
          <h4>${item.title}</h4>
        </div>
        <div class="training-card-back">
          <div class="training-icon">${item.icon}</div>
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>
      </div>
    </div>
  `).join('');
  initAnimateOnScroll();
}

/* ============================================================
   RENDER NEWS (Multilingual)
   ============================================================ */
function renderNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const lang = getCurrentLanguage();
  const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : TRANSLATIONS.en;
  const news = DB.getNews();
  if (news.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No news yet. Check back soon!</p>';
    return;
  }
  grid.innerHTML = news.map((n, i) => `
    <div class="news-card aos fade-up" data-delay="${i * 100}">
      <div class="news-card-img">${n.emoji || '📰'}</div>
      <div class="news-card-body">
        <div class="news-date"><i class="far fa-calendar"></i> ${formatDate(n.date)} &bull; <span class="badge badge-primary">${n.category}</span></div>
        <h4>${n.title}</h4>
        <p>${n.excerpt}</p>
        <a href="#contact" class="news-read-more">${t.news_read_more} <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  `).join('');
  initAnimateOnScroll();
}

/* ============================================================
   RENDER FAQ (Multilingual)
   ============================================================ */
function renderFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  const lang = getCurrentLanguage();
  const faqs = (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.faq && DYNAMIC_TRANSLATIONS.faq[lang])
    ? DYNAMIC_TRANSLATIONS.faq[lang]
    : DYNAMIC_TRANSLATIONS.faq.en;

  list.innerHTML = faqs.map((f, i) => `
    <div class="faq-item aos fade-up" data-delay="${i * 60}" id="faq-${i}">
      <div class="faq-question" onclick="toggleFAQ('faq-${i}')">
        <span class="faq-question-text">${f.q}</span>
        <span class="faq-icon"><i class="fas fa-plus"></i></span>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-inner">${f.a}</div>
      </div>
    </div>
  `).join('');
  initAnimateOnScroll();
}

function initFAQAccordion() {}

function toggleFAQ(id) {
  const item = document.getElementById(id);
  if (!item) return;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ============================================================
   ABOUT TABS
   ============================================================ */
function renderAbout() {}

function initAboutTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      contents.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById(t.dataset.tab)?.classList.add('active');
    });
  });
}

/* ============================================================
   MULTI-STEP FORM
   ============================================================ */
function initMultiStepForm() {
  let step = 1;
  const totalSteps = 4;
  const form = document.getElementById('registration-form');
  if (!form) return;

  function showStep(n) {
    form.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    form.querySelector(`#step-${n}`)?.classList.add('active');

    // Update dots
    const dots = document.querySelectorAll('.step-indicator .step-dot');
    dots.forEach((d, i) => {
      d.classList.remove('active', 'done');
      if (i + 1 < n) d.classList.add('done');
      if (i + 1 === n) d.classList.add('active');
    });

    // Progress bar
    const fill = document.getElementById('form-progress-fill');
    if (fill) fill.style.width = (((n - 1) / (totalSteps - 1)) * 100) + '%';

    // Step 4 review summary
    if (n === 4) {
      const previewDiv = document.getElementById('step4-details-preview');
      if (previewDiv) {
        const fn = document.getElementById('full-name')?.value || '—';
        const ph = document.getElementById('phone')?.value || '—';
        const jt = document.getElementById('job-type')?.value || 'General';
        const pc = document.getElementById('pref-country')?.value || 'Any';
        const cvInfo = uploadedCv 
          ? `<span style="color:var(--success);font-weight:700;"><i class="fas fa-check-circle"></i> ${uploadedCv.name} (${(uploadedCv.size / 1024).toFixed(0)} KB)</span>`
          : `<span style="color:var(--text-muted);font-style:italic;">No CV attached</span>`;
        
        previewDiv.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px 18px;background:white;padding:14px 16px;border-radius:8px;border:1px solid #E8EEFF;font-size:0.86rem;">
            <div><span style="color:var(--text-muted);display:block;font-size:0.75rem;font-weight:600;">APPLICANT</span> <strong>${fn}</strong></div>
            <div><span style="color:var(--text-muted);display:block;font-size:0.75rem;font-weight:600;">CONTACT</span> <strong>${ph}</strong></div>
            <div><span style="color:var(--text-muted);display:block;font-size:0.75rem;font-weight:600;">JOB / COUNTRY</span> <strong>${jt} (${pc})</strong></div>
            <div><span style="color:var(--text-muted);display:block;font-size:0.75rem;font-weight:600;">CV (PDF)</span> ${cvInfo}</div>
          </div>
        `;
      }
    }

    step = n;
  }

  form.querySelectorAll('.form-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (step < totalSteps) showStep(step + 1);
    });
  });
  form.querySelectorAll('.form-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      if (step > 1) showStep(step - 1);
    });
  });

  // CV Upload (Strict PDF Only)
  let uploadedCv = null;
  const cvZone = document.getElementById('cv-upload-zone');
  const cvInput = document.getElementById('cv-file-input');
  const cvPreview = document.getElementById('cv-preview-area');
  const cvError = document.getElementById('cv-error-msg');

  if (cvZone && cvInput) {
    cvZone.addEventListener('click', () => cvInput.click());
    cvZone.addEventListener('dragover', e => { e.preventDefault(); cvZone.style.borderColor = 'var(--primary-light)'; });
    cvZone.addEventListener('dragleave', () => cvZone.style.borderColor = '#B0C4DE');
    cvZone.addEventListener('drop', e => {
      e.preventDefault();
      cvZone.style.borderColor = '#B0C4DE';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleCvFile(e.dataTransfer.files[0]);
      }
    });
    cvInput.addEventListener('change', () => {
      if (cvInput.files && cvInput.files[0]) {
        handleCvFile(cvInput.files[0]);
      }
    });
  }

  function handleCvFile(file) {
    if (cvError) { cvError.style.display = 'none'; cvError.textContent = ''; }
    if (!file) return;

    const lang = getCurrentLanguage();
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : TRANSLATIONS.en;

    // Strict PDF Only Check
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      if (cvError) {
        cvError.textContent = t.err_pdf_only || 'Only PDF files (.pdf) are allowed for CV upload. Please choose a valid PDF file.';
        cvError.style.display = 'block';
      }
      cvInput.value = '';
      uploadedCv = null;
      if (cvPreview) cvPreview.innerHTML = '';
      return;
    }

    // Size limit: Max 4MB
    if (file.size > 4 * 1024 * 1024) {
      if (cvError) {
        cvError.textContent = t.err_file_size || 'File is too large. Maximum allowed size is 4MB.';
        cvError.style.display = 'block';
      }
      cvInput.value = '';
      uploadedCv = null;
      if (cvPreview) cvPreview.innerHTML = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedCv = {
        data: e.target.result,
        name: file.name,
        size: file.size,
      };
      if (cvPreview) {
        cvPreview.innerHTML = `
          <div class="upload-file-tag pdf-tag" style="background:#EBF9F1;border:1px solid #2ECC71;padding:10px 16px;border-radius:8px;display:inline-flex;align-items:center;gap:12px;box-shadow:0 2px 6px rgba(0,0,0,0.06);margin-top:8px;">
            <i class="fas fa-file-pdf" style="color:#E74C3C;font-size:1.6rem"></i>
            <div style="text-align:left;">
              <div style="font-weight:700;color:var(--text-dark);font-size:0.9rem">${file.name}</div>
              <small style="color:var(--success);font-weight:600;"><i class="fas fa-check-circle"></i> Ready to submit (${(file.size / 1024).toFixed(0)} KB)</small>
            </div>
            <button type="button" id="btn-remove-cv" style="background:none;border:none;color:#E74C3C;cursor:pointer;font-size:1.1rem;padding:4px 8px;margin-left:8px;" title="Remove file">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
        document.getElementById('btn-remove-cv')?.addEventListener('click', (ev) => {
          ev.stopPropagation();
          uploadedCv = null;
          cvPreview.innerHTML = '';
          cvInput.value = '';
        });
      }
    };
    reader.readAsDataURL(file);
  }

  // Other documents upload previews (Passport & Certs)
  form.querySelectorAll('.upload-zone:not(#cv-upload-zone)').forEach(zone => {
    const input = zone.querySelector('input[type="file"]');
    const preview = zone.querySelector('.upload-previews');
    if (!input) return;
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--primary-light)'; });
    zone.addEventListener('dragleave', () => zone.style.borderColor = '');
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.style.borderColor = '';
      handleFiles(e.dataTransfer.files, preview);
    });
    input.addEventListener('change', () => handleFiles(input.files, preview));
  });

  function handleFiles(files, preview) {
    if (!preview) return;
    preview.innerHTML = '';
    Array.from(files).forEach(f => {
      const tag = document.createElement('div');
      tag.className = 'upload-file-tag';
      tag.innerHTML = `<i class="fas fa-file"></i> <span>${f.name}</span> <small>(${(f.size / 1024).toFixed(0)} KB)</small>`;
      preview.appendChild(tag);
    });
  }

  // Submit
  document.getElementById('form-submit')?.addEventListener('click', () => {
    const fullName = document.getElementById('full-name')?.value;
    const phone = document.getElementById('phone')?.value;
    const agree = document.getElementById('agree-terms')?.checked;
    const lang = getCurrentLanguage();
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : TRANSLATIONS.en;

    if (!fullName || !phone) {
      alert(t.toast_quick_fill);
      showStep(1);
      return;
    }
    if (!agree) {
      alert('Please agree to terms and conditions.');
      return;
    }

    const appData = {
      fullName,
      gender: document.getElementById('gender')?.value,
      nic: document.getElementById('nic')?.value,
      dob: document.getElementById('dob')?.value,
      passport: document.getElementById('passport')?.value,
      phone,
      email: document.getElementById('email')?.value,
      address: document.getElementById('address')?.value,
      education: document.getElementById('education')?.value,
      qualification: document.getElementById('qualification')?.value,
      experience: document.getElementById('experience')?.value,
      skills: document.getElementById('skills')?.value,
      jobType: document.getElementById('job-type')?.value,
      prefCountry: document.getElementById('pref-country')?.value,
      cvData: uploadedCv ? uploadedCv.data : null,
      cvFileName: uploadedCv ? uploadedCv.name : null,
      cvFileSize: uploadedCv ? uploadedCv.size : null,
      type: 'full',
    };

    DB.addApplication(appData);
    form.style.display = 'none';
    const successBox = document.getElementById('form-success');
    if (successBox) successBox.classList.add('visible');
    showToast(t.toast_app_submitted);
  });
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const lang = getCurrentLanguage();
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : TRANSLATIONS.en;
    if (btn) {
      btn.innerHTML = `<i class="fas fa-check"></i> ${t.msg_sent}`;
      btn.style.background = 'var(--success)';
    }
    setTimeout(() => {
      form.reset();
      if (btn) {
        btn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t.btn_send_msg}`;
        btn.style.background = '';
      }
    }, 3000);
  });
}

/* ============================================================
   APPLY MODAL
   ============================================================ */
function initModal() {
  const overlay = document.getElementById('apply-modal');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
  }
  const detailOverlay = document.getElementById('job-detail-modal');
  if (detailOverlay) {
    detailOverlay.addEventListener('click', e => {
      if (e.target === detailOverlay) closeJobDetail();
    });
  }
}

function openApplyModal(jobId, title, country) {
  const overlay = document.getElementById('apply-modal');
  if (!overlay) { scrollToSection('register'); return; }
  const lang = getCurrentLanguage();
  const locCountry = (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.countries[country] && DYNAMIC_TRANSLATIONS.countries[country][lang])
    ? DYNAMIC_TRANSLATIONS.countries[country][lang]
    : country;
  overlay.querySelector('.modal-job-title').textContent = title;
  overlay.querySelector('.modal-job-country').innerHTML = `${getFlagHtml(country)} <span>${locCountry}</span>`;
  overlay.dataset.jobId = jobId;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('apply-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}

function submitQuickApply() {
  const overlay = document.getElementById('apply-modal');
  if (!overlay) return;
  const name = document.getElementById('quick-name')?.value?.trim();
  const phone = document.getElementById('quick-phone')?.value?.trim();
  const nic = document.getElementById('quick-nic')?.value?.trim();
  const cvInput = document.getElementById('quick-cv');
  const cvError = document.getElementById('quick-cv-error');
  const jobId = overlay.dataset.jobId;
  const lang = getCurrentLanguage();
  const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : TRANSLATIONS.en;

  if (cvError) { cvError.style.display = 'none'; cvError.textContent = ''; }
  if (!name || !phone) { alert(t.toast_quick_fill); return; }

  const finishSubmit = (cvData, cvFileName, cvFileSize) => {
    DB.addApplication({
      fullName: name,
      phone,
      nic: nic || null,
      jobId,
      type: 'quick',
      cvData: cvData || null,
      cvFileName: cvFileName || null,
      cvFileSize: cvFileSize || null
    });
    closeModal();
    if (cvInput) cvInput.value = '';
    const qn = document.getElementById('quick-name'); if (qn) qn.value = '';
    const qp = document.getElementById('quick-phone'); if (qp) qp.value = '';
    const qnic = document.getElementById('quick-nic'); if (qnic) qnic.value = '';
    showToast(t.toast_app_submitted);
  };

  const file = cvInput?.files?.[0];
  if (file) {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      if (cvError) {
        cvError.textContent = t.err_pdf_only || 'Only PDF files (.pdf) are allowed for CV upload. Please choose a valid PDF file.';
        cvError.style.display = 'block';
      }
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      if (cvError) {
        cvError.textContent = t.err_file_size || 'File is too large. Maximum allowed size is 4MB.';
        cvError.style.display = 'block';
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      finishSubmit(e.target.result, file.name, file.size);
    };
    reader.readAsDataURL(file);
  } else {
    finishSubmit(null, null, null);
  }
}

function openJobDetail(jobId) {
  const job = DB.getById(DB.KEYS.JOBS, jobId);
  if (!job) return;
  const overlay = document.getElementById('job-detail-modal');
  if (!overlay) return;
  const lang = getCurrentLanguage();
  const locCountry = (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.countries[job.country] && DYNAMIC_TRANSLATIONS.countries[job.country][lang])
    ? DYNAMIC_TRANSLATIONS.countries[job.country][lang]
    : job.country;

  overlay.querySelector('.modal-job-title').textContent = job.title;
  overlay.querySelector('.modal-job-country').innerHTML = `${getFlagHtml(job.country, job.countryCode)} <span>${locCountry}</span>`;
  overlay.querySelector('.job-detail-salary').textContent = job.salary + (job.salaryNote ? ` (${job.salaryNote})` : '');
  overlay.querySelector('.job-detail-contract').textContent = job.contract;
  overlay.querySelector('.job-detail-exp').textContent = job.experience;
  overlay.querySelector('.job-detail-reqs').innerHTML = (job.requirements || []).map(r => `<li><i class="fas fa-check-circle" style="color:var(--success)"></i> ${r}</li>`).join('');
  overlay.querySelector('.job-detail-benefits').innerHTML = (job.benefits || []).map(b => `<li><i class="fas fa-star" style="color:var(--accent)"></i> ${b}</li>`).join('');
  overlay.querySelector('.job-detail-desc').textContent = job.description || '';
  overlay.querySelector('.apply-btn').onclick = () => { closeJobDetail(); openApplyModal(job.id, job.title, job.country); };
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeJobDetail() {
  document.getElementById('job-detail-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   LANGUAGE TOGGLE & LOCALIZATION (English Default, Sinhala, Tamil)
   ============================================================ */
function getCurrentLanguage() {
  return localStorage.getItem('nilwala_lang') || 'en';
}

function setLanguage(lang) {
  if (!['en', 'si', 'ta'].includes(lang)) lang = 'en';
  localStorage.setItem('nilwala_lang', lang);

  // Update HTML and body classes
  document.documentElement.lang = lang;
  document.body.className = document.body.className.replace(/lang-[a-z]+/g, '').trim();
  document.body.classList.add(`lang-${lang}`);

  // Update all language toggle buttons (navbar & mobile menu)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Apply translations to all elements with data-i18n
  if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) {
    const dict = TRANSLATIONS[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });
  }

  // Update filter dropdown text
  updateFilterOptions(lang);

  // Re-run dynamic renders
  renderJobCategories();
  renderCountries();
  renderJobs();
  renderTimeline();
  renderTraining();
  renderFAQ();
  renderNews();
  initTypewriter();
  updateVacancyCount();
}

function updateFilterOptions(lang) {
  if (typeof TRANSLATIONS === 'undefined' || !TRANSLATIONS[lang]) return;
  const t = TRANSLATIONS[lang];

  // Country filter options
  const countrySelect = document.getElementById('filter-country');
  if (countrySelect && countrySelect.options.length > 0) {
    countrySelect.options[0].text = t.filter_all_countries || 'All Countries';
    if (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.countries) {
      for (let i = 1; i < countrySelect.options.length; i++) {
        const val = countrySelect.options[i].value;
        const parts = countrySelect.options[i].text.trim().split(' ');
        const flag = parts.length > 1 ? parts[parts.length - 1] : '';
        const name = (DYNAMIC_TRANSLATIONS.countries[val] && DYNAMIC_TRANSLATIONS.countries[val][lang])
          ? DYNAMIC_TRANSLATIONS.countries[val][lang]
          : val;
        countrySelect.options[i].text = flag ? `${name} ${flag}` : name;
      }
    }
  }

  // Category filter options
  const catSelect = document.getElementById('filter-category');
  if (catSelect && catSelect.options.length > 0) {
    catSelect.options[0].text = t.filter_all_categories || 'All Categories';
    if (typeof DYNAMIC_TRANSLATIONS !== 'undefined' && DYNAMIC_TRANSLATIONS.categories) {
      for (let i = 1; i < catSelect.options.length; i++) {
        const val = catSelect.options[i].value;
        const trans = (DYNAMIC_TRANSLATIONS.categories[val] && DYNAMIC_TRANSLATIONS.categories[val][lang])
          ? DYNAMIC_TRANSLATIONS.categories[val][lang].name
          : null;
        if (trans) catSelect.options[i].text = trans;
      }
    }
  }

  // Experience filter options
  const expSelect = document.getElementById('filter-exp');
  if (expSelect && expSelect.options.length >= 4) {
    expSelect.options[0].text = t.filter_any_exp || 'Any Level';
    expSelect.options[1].text = t.filter_no_exp || 'No Experience Required';
    expSelect.options[2].text = t.filter_exp_1_3 || 'Experienced (1-3 yrs)';
    expSelect.options[3].text = t.filter_exp_senior || 'Senior (3+ yrs)';
  }

  // Salary filter options (LKR)
  const salSelect = document.getElementById('filter-salary');
  if (salSelect && salSelect.options.length >= 4) {
    salSelect.options[0].text = t.filter_all_salaries || 'All Salaries (LKR)';
    salSelect.options[1].text = t.filter_sal_1 || 'Up to LKR 100,000';
    salSelect.options[2].text = t.filter_sal_2 || 'LKR 100,000 – 250,000';
    salSelect.options[3].text = t.filter_sal_3 || 'LKR 250,000+';
  }
}

function initLanguageToggle() {
  const btns = document.querySelectorAll('.lang-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
    });
  });

  // Apply initial language (defaults to English 'en')
  const initialLang = getCurrentLanguage();
  setLanguage(initialLang);
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   NEWSLETTER FORM
   ============================================================ */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input?.value) {
      DB.addNewsletterEmail(input.value);
      const lang = getCurrentLanguage();
      const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : TRANSLATIONS.en;
      showToast(t.toast_subscribed);
      input.value = '';
    }
  });
}

/* ============================================================
   HERO STATS & VACANCY BADGE
   ============================================================ */
function initHeroStats() {
  // Counters initialized in initCounters
}

function updateVacancyCount() {
  const jobs = DB.getJobs();
  document.querySelectorAll('.vacancy-count').forEach(el => {
    el.textContent = jobs.length;
  });
}

/* ============================================================
   UTILITIES
   ============================================================ */
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);
    background:var(--primary);color:white;padding:14px 28px;border-radius:50px;
    font-family:var(--font-main);font-weight:600;font-size:0.95rem;
    box-shadow:0 8px 30px rgba(10,36,114,0.4);z-index:99999;
    opacity:0;transition:all 0.4s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Expose globals
window.scrollToSection = scrollToSection;
window.toggleFAQ = toggleFAQ;
window.goToSlide = goToSlide;
window.openApplyModal = openApplyModal;
window.closeModal = closeModal;
window.submitQuickApply = submitQuickApply;
window.openJobDetail = openJobDetail;
window.closeJobDetail = closeJobDetail;
window.getCurrentLanguage = getCurrentLanguage;
window.setLanguage = setLanguage;
