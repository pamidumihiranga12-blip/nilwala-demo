/**
 * NILWALA AGENCY – DATA LAYER
 * All data stored in localStorage with full CRUD operations
 */

const DB = {
  // ── Keys ──
  KEYS: {
    JOBS: 'na_jobs',
    APPLICATIONS: 'na_applications',
    TESTIMONIALS: 'na_testimonials',
    NEWS: 'na_news',
    FAQ: 'na_faq',
    SETTINGS: 'na_settings',
    COUNTRIES: 'na_countries',
    CATEGORIES: 'na_categories',
    NEWSLETTER: 'na_newsletter',
  },

  // ── Generic CRUD ──
  getAll(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch { return []; }
  },
  getObj(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch { return {}; }
  },
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  getId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },
  addItem(key, item) {
    const list = this.getAll(key);
    const newItem = { ...item, id: this.getId(), createdAt: new Date().toISOString() };
    list.unshift(newItem);
    this.save(key, list);
    return newItem;
  },
  updateItem(key, id, updates) {
    const list = this.getAll(key);
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(key, list);
    return list[idx];
  },
  deleteItem(key, id) {
    const list = this.getAll(key);
    const filtered = list.filter(i => i.id !== id);
    this.save(key, filtered);
    return filtered;
  },
  getById(key, id) {
    return this.getAll(key).find(i => i.id === id) || null;
  },

  // ── Jobs ──
  getJobs(filters = {}) {
    let jobs = this.getAll(this.KEYS.JOBS).filter(j => j.active);
    if (filters.country) jobs = jobs.filter(j => j.country === filters.country);
    if (filters.category) jobs = jobs.filter(j => j.category === filters.category);
    if (filters.experience) jobs = jobs.filter(j => j.experience === filters.experience);
    if (filters.salary) {
      const [min, max] = filters.salary.split('-').map(Number);
      if (max) jobs = jobs.filter(j => j.salaryNum >= min && j.salaryNum <= max);
    }
    return jobs;
  },
  addJob(job) { return this.addItem(this.KEYS.JOBS, { ...job, active: true }); },
  updateJob(id, data) { return this.updateItem(this.KEYS.JOBS, id, data); },
  deleteJob(id) { return this.deleteItem(this.KEYS.JOBS, id); },
  toggleJob(id) {
    const job = this.getById(this.KEYS.JOBS, id);
    if (job) this.updateItem(this.KEYS.JOBS, id, { active: !job.active });
  },

  // ── Applications ──
  getApplications() { return this.getAll(this.KEYS.APPLICATIONS); },
  addApplication(app) { return this.addItem(this.KEYS.APPLICATIONS, { ...app, status: 'new' }); },
  updateApplicationStatus(id, status) { return this.updateItem(this.KEYS.APPLICATIONS, id, { status }); },
  deleteApplication(id) { return this.deleteItem(this.KEYS.APPLICATIONS, id); },

  // ── Testimonials ──
  getTestimonials() { return this.getAll(this.KEYS.TESTIMONIALS).filter(t => t.active); },
  addTestimonial(t) { return this.addItem(this.KEYS.TESTIMONIALS, { ...t, active: true }); },
  updateTestimonial(id, data) { return this.updateItem(this.KEYS.TESTIMONIALS, id, data); },
  deleteTestimonial(id) { return this.deleteItem(this.KEYS.TESTIMONIALS, id); },

  // ── News ──
  getNews() { return this.getAll(this.KEYS.NEWS).filter(n => n.active); },
  addNews(n) { return this.addItem(this.KEYS.NEWS, { ...n, active: true }); },
  updateNews(id, data) { return this.updateItem(this.KEYS.NEWS, id, data); },
  deleteNews(id) { return this.deleteItem(this.KEYS.NEWS, id); },

  // ── FAQ ──
  getFAQ() { return this.getAll(this.KEYS.FAQ).filter(f => f.active); },
  addFAQ(f) { return this.addItem(this.KEYS.FAQ, { ...f, active: true }); },
  updateFAQ(id, data) { return this.updateItem(this.KEYS.FAQ, id, data); },
  deleteFAQ(id) { return this.deleteItem(this.KEYS.FAQ, id); },

  // ── Settings ──
  getSettings() {
    return {
      siteName: 'Nilwala Agencies',
      tagline: 'Since 1996 – Kurunegala',
      address: 'No. 135, 2nd Floor, Sarasavi Building, Colombo Road, Kurunegala, Sri Lanka',
      phone: '037 223 2000',
      hotlines: '037 223 2000, 037 205 6000, 072 780 0800',
      hotline1: '037 223 2000',
      hotline2: '037 205 6000',
      hotline3: '072 780 0800',
      mdName: 'W.A.N.S. Wijesinghe',
      mdPhone: '0777-209 189',
      whatsapp: '+94 77 720 9189',
      email: 'info@nilwalaagencies.com',
      domain: 'nilwalaagencies.com',
      facebook: 'https://facebook.com/nilwalaagencies',
      instagram: '#',
      youtube: '#',
      mapEmbed: 'https://maps.google.com/?q=No.135,2nd+floor,Sarasavi+building,Colombo+road,Kurunegala',
      adminPassword: 'nilwala2026',
      ...this.getObj(this.KEYS.SETTINGS),
    };
  },
  saveSettings(settings) { this.save(this.KEYS.SETTINGS, settings); },

  // ── Countries ──
  getCountries() { return this.getAll(this.KEYS.COUNTRIES); },

  // ── Newsletter ──
  addNewsletterEmail(email) {
    const list = this.getAll(this.KEYS.NEWSLETTER);
    if (!list.find(e => e.email === email)) {
      list.push({ email, date: new Date().toISOString() });
      this.save(this.KEYS.NEWSLETTER, list);
    }
  },

  // ── Seed default data ──
  seed() {
    // Re-seed if empty or if jobs still use foreign currencies
    const existingJobs = this.getAll(this.KEYS.JOBS);
    if (existingJobs.length === 0 || !existingJobs.some(j => j.salaryCurrency === 'LKR')) {
      this.save(this.KEYS.JOBS, []);
      this._seedJobs();
    }
    if (this.getAll(this.KEYS.TESTIMONIALS).length === 0) this._seedTestimonials();
    if (this.getAll(this.KEYS.NEWS).length === 0) this._seedNews();
    if (this.getAll(this.KEYS.FAQ).length === 0) this._seedFAQ();
    const existingCountries = this.getAll(this.KEYS.COUNTRIES);
    if (existingCountries.length === 0 || !existingCountries.some(c => c.code)) {
      this.save(this.KEYS.COUNTRIES, []);
      this._seedCountries();
    }
  },

  _seedJobs() {
    const jobs = [
      {
        title: 'Construction Worker – Steel Fixer',
        country: 'Israel',
        countryFlag: '🇮🇱',
        category: 'Construction',
        salary: 'LKR 750,000',
        salaryNum: 750000,
        salaryCurrency: 'LKR',
        salaryNote: '~8,890 NIS (Including Overtime)',
        contract: '05 Years',
        experience: 'Experienced',
        requirements: [
          '05 Years of Experience in Construction Field',
          'Age: 25 – 44 years old',
          'English speaking is an added advantage',
          'Good health condition'
        ],
        benefits: ['Medical Insurance', 'Accommodation', 'Annual Bonus & Leave'],
        description: 'Exciting opportunity for experienced steel fixers in Israel. Work on major construction projects with excellent remuneration in LKR.',
        active: true,
      },
      {
        title: 'Caregiver',
        country: 'Israel',
        countryFlag: '🇮🇱',
        category: 'Healthcare',
        salary: 'LKR 580,000',
        salaryNum: 580000,
        salaryCurrency: 'LKR',
        salaryNote: 'As per Israeli law',
        contract: '02 Years',
        experience: 'Experienced',
        requirements: [
          'Experience in caregiving',
          'Age: 25 – 50 years old',
          'Basic English communication',
          'Good health condition',
          'Medical certificate required'
        ],
        benefits: ['Medical Insurance', 'Accommodation', 'Return Air Ticket'],
        description: 'Professional caregiver position in Israel. Care for elderly patients with full support and attractive salary in LKR.',
        active: true,
      },
      {
        title: 'Domestic Worker',
        country: 'Saudi Arabia',
        countryFlag: '🇸🇦',
        category: 'Domestic',
        salary: 'LKR 85,000',
        salaryNum: 85000,
        salaryCurrency: 'LKR',
        salaryNote: '~800 SAR / month',
        contract: '02 Years',
        experience: 'Any',
        requirements: [
          'Female candidates preferred',
          'Age: 22 – 45 years old',
          'No prior experience required',
          'Good health'
        ],
        benefits: ['Free Accommodation', 'Free Meals', 'Annual Leave'],
        description: 'Domestic worker positions available in Saudi Arabia with reputable families. Full safety and welfare guaranteed.',
        active: true,
      },
      {
        title: 'Mason / Plasterer',
        country: 'Qatar',
        countryFlag: '🇶🇦',
        category: 'Construction',
        salary: 'LKR 135,000',
        salaryNum: 135000,
        salaryCurrency: 'LKR',
        salaryNote: '~1,500 QAR + Overtime',
        contract: '02 Years',
        experience: 'Experienced',
        requirements: [
          'Minimum 3 years experience',
          'Age: 22 – 45 years old',
          'Valid passport',
          'Medical fitness certificate'
        ],
        benefits: ['Free Accommodation', 'Transportation', 'Medical Insurance'],
        description: 'Skilled mason and plasterer positions for major construction projects in Qatar with overtime benefits.',
        active: true,
      },
      {
        title: 'House Nurse',
        country: 'UAE',
        countryFlag: '🇦🇪',
        category: 'Healthcare',
        salary: 'LKR 165,000',
        salaryNum: 165000,
        salaryCurrency: 'LKR',
        salaryNote: '~1,800 AED / month',
        contract: '02 Years',
        experience: 'Experienced',
        requirements: [
          'Nursing qualification required',
          'Age: 22 – 40 years old',
          'English proficiency',
          'Experience in home nursing'
        ],
        benefits: ['Free Accommodation', 'Medical Insurance', 'Annual Leave with Air Ticket'],
        description: 'Professional house nursing positions in UAE with reputable employer families and full benefits.',
        active: true,
      },
      {
        title: 'Domestic Worker with Cook',
        country: 'Kuwait',
        countryFlag: '🇰🇼',
        category: 'Domestic',
        salary: 'LKR 140,000',
        salaryNum: 140000,
        salaryCurrency: 'LKR',
        salaryNote: '~140 KWD / month',
        contract: '02 Years',
        experience: 'Experienced',
        requirements: [
          'Cooking experience required',
          'Age: 25 – 45 years old',
          'Knowledge of Asian cuisine',
          'Good communication skills'
        ],
        benefits: ['Free Accommodation', 'Free Meals', 'Annual Leave'],
        description: 'Combined domestic worker and cook position in Kuwait. Cooking skills essential with excellent family placement.',
        active: true,
      },
    ];
    jobs.forEach(j => this.addJob(j));
  },

  _seedTestimonials() {
    const testimonials = [
      {
        name: 'Kumara Perera',
        role: 'Construction Worker – Israel',
        country: 'Israel 🇮🇱',
        text: 'Nilwala Agencies helped me achieve my dream of working overseas. Their guidance throughout the process made my journey much easier. I am now earning well and supporting my family.',
        rating: 5,
        initials: 'KP',
        active: true,
      },
      {
        name: 'Nirosha Fernando',
        role: 'Caregiver – Israel',
        country: 'Israel 🇮🇱',
        text: 'I am very grateful to Nilwala Agencies. They provided complete support from documentation to departure. The team was always available to answer my questions. Highly recommended!',
        rating: 5,
        initials: 'NF',
        active: true,
      },
      {
        name: 'Suresh Silva',
        role: 'Mason – Qatar',
        country: 'Qatar 🇶🇦',
        text: 'Professional and trustworthy agency. They helped me get a genuine job in Qatar with good salary and accommodation. The process was transparent and smooth.',
        rating: 5,
        initials: 'SS',
        active: true,
      },
      {
        name: 'Priyanka Jayawardena',
        role: 'Domestic Worker – Saudi Arabia',
        country: 'Saudi Arabia 🇸🇦',
        text: 'Excellent service! Nilwala Agencies made the whole process stress-free. The pre-departure training was very helpful for me as a first-time overseas worker.',
        rating: 5,
        initials: 'PJ',
        active: true,
      },
    ];
    testimonials.forEach(t => this.addTestimonial(t));
  },

  _seedNews() {
    const news = [
      {
        title: 'New Construction Vacancies Open in Israel – Apply Now',
        excerpt: 'Exciting new opportunities for skilled construction workers in Israel with competitive salaries and full benefits package including accommodation.',
        category: 'Job Opening',
        emoji: '🏗️',
        date: new Date().toISOString(),
        active: true,
      },
      {
        title: 'Israel Caregiver Program 2024 – Recruitment Open',
        excerpt: 'Applications are now open for the Israel Caregiver Program. Qualified candidates with caregiving experience are encouraged to apply immediately.',
        category: 'Recruitment',
        emoji: '🏥',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        active: true,
      },
      {
        title: 'Important: New Document Requirements for Saudi Arabia',
        excerpt: 'The Saudi Arabia government has updated documentation requirements for domestic workers. Please visit our office for latest information.',
        category: 'Visa Update',
        emoji: '📋',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        active: true,
      },
    ];
    news.forEach(n => this.addNews(n));
  },

  _seedFAQ() {
    const faqs = [
      {
        question: 'How can I apply for overseas jobs through Nilwala Agencies?',
        answer: 'You can apply by visiting our office in Kurunegala, calling us directly, or using the online application form on this website. Our team will guide you through the entire process.',
        active: true,
      },
      {
        question: 'What documents are required to apply?',
        answer: 'Basic documents include: Valid Passport, National ID Card (NIC), Birth Certificate, Educational Certificates, Experience Letters, Police Clearance Report, and Medical Certificate. Additional documents may be required based on the country and job position.',
        active: true,
      },
      {
        question: 'How long does the visa process take?',
        answer: 'The visa processing time varies by country. Generally, it takes 2 to 6 months from application submission to departure. Our team will keep you updated throughout the process.',
        active: true,
      },
      {
        question: 'Do you provide job opportunities for skilled workers?',
        answer: 'Yes! We provide opportunities for a wide range of skilled workers including electricians, welders, plumbers, mechanics, construction workers, caregivers, nurses, and more.',
        active: true,
      },
      {
        question: 'Which countries are currently available?',
        answer: 'We currently have vacancies in Israel, Saudi Arabia, UAE (Dubai/Abu Dhabi), Qatar, Kuwait, Oman, and Bahrain. Contact us for the latest available positions.',
        active: true,
      },
      {
        question: 'What fees do I need to pay?',
        answer: 'Our agency fees are transparent and clearly communicated upfront. There are no hidden charges. Please visit our office or contact us for the current fee structure for your desired country and position.',
        active: true,
      },
      {
        question: 'Is Nilwala Agencies a licensed agency?',
        answer: 'Yes, we are fully licensed by the Sri Lanka Bureau of Foreign Employment. Our license numbers are: Nilwala Agencies (L.L. No: 1268), Nilwala Foreign Employment (L.L. No: 1964), and Nilwala Agencies (L.L. No: 2618).',
        active: true,
      },
      {
        question: 'Do you provide pre-departure training?',
        answer: 'Yes, we offer comprehensive pre-departure training including language training, cultural awareness, interview preparation, and job readiness orientation to help candidates prepare for their overseas journey.',
        active: true,
      },
    ];
    faqs.forEach(f => this.addFAQ(f));
  },

  _seedCountries() {
    const countries = [
      { name: 'Israel', code: 'il', flag: '🇮🇱', jobs: 12, region: 'Middle East', active: true },
      { name: 'Saudi Arabia', code: 'sa', flag: '🇸🇦', jobs: 8, region: 'Middle East', active: true },
      { name: 'UAE (Dubai / Abu Dhabi)', code: 'ae', flag: '🇦🇪', jobs: 10, region: 'Middle East', active: true },
      { name: 'Qatar', code: 'qa', flag: '🇶🇦', jobs: 6, region: 'Middle East', active: true },
      { name: 'Kuwait', code: 'kw', flag: '🇰🇼', jobs: 4, region: 'Middle East', active: true },
      { name: 'Oman', code: 'om', flag: '🇴🇲', jobs: 5, region: 'Middle East', active: true },
      { name: 'Bahrain', code: 'bh', flag: '🇧🇭', jobs: 3, region: 'Middle East', active: true },
    ];
    countries.forEach(c => this.addItem(this.KEYS.COUNTRIES, c));
  },
};

// Initialize data on page load
document.addEventListener('DOMContentLoaded', () => DB.seed());
