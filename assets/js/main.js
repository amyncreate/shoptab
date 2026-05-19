/* ============================================
   SHOP STORE - Main Application JS
   AmeenDesigns © 2026
   ============================================ */

'use strict';

/* ─── CONSTANTS ─── */
const APPS_JSON_PATH = './data/apps.json';
const SLIDE_INTERVAL = 3000;

/* ─── STATE ─── */
let allApps = [];
let filteredApps = [];
let currentCategory = 'All';
let searchQuery = '';
let countersStarted = false;

/* ─── DOM READY ─── */
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initBgCanvas();
  initTheme();
  initNavbar();
  initTypewriter();
  initSearchModal();
  loadApps();
  initServiceWorker();
});

/* ═══════════════════════════════════════
   LOADING SCREEN
═══════════════════════════════════════ */
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  // Hide after 2s
  setTimeout(() => {
    screen.classList.add('hidden');
    // Trigger counter animations after load
    setTimeout(() => initCounters(), 400);
  }, 2000);
}

/* ═══════════════════════════════════════
   BACKGROUND CANVAS - PARTICLE FIELD
═══════════════════════════════════════ */
function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Generate particles
  const COUNT = 60;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const baseColor = isDark ? '0,229,255' : '124,58,237';

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${baseColor},${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseColor},${p.alpha})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('ss_theme') || 'dark';
  setTheme(saved);

  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ss_theme', theme);
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
}

/* ═══════════════════════════════════════
   NAVBAR
═══════════════════════════════════════ */
function initNavbar() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      const isOpen = mobileNav.classList.contains('open');
      hamburger.querySelectorAll('span')[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
      hamburger.querySelectorAll('span')[1].style.opacity = isOpen ? '0' : '1';
      hamburger.querySelectorAll('span')[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll('.mobile-nav a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav?.classList.remove('open');
    });
  });

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });

  // Navbar scroll shadow
  window.addEventListener('scroll', () => {
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ═══════════════════════════════════════
   TYPEWRITER HERO
═══════════════════════════════════════ */
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const phrases = [
    'Your #1 Marketplace for Business Apps in Nigeria.',
    'Download APKs Built for Provision Store Owners.',
    'Track Debts, Balances & Sales — All in One Place.',
    'Powerful Tools for the Modern Market Trader.',
    'Install. Grow. Dominate Your Business.',
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = phrases[phraseIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
    }
    setTimeout(type, deleting ? 35 : 55);
  }
  type();
}

/* ═══════════════════════════════════════
   ANIMATED COUNTERS
═══════════════════════════════════════ */
function initCounters() {
  if (countersStarted) return;
  countersStarted = true;

  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString() + suffix;
      if (current >= target) clearInterval(timer);
    }, 25);
  });
}

/* ═══════════════════════════════════════
   LOAD APPS FROM JSON
═══════════════════════════════════════ */
async function loadApps() {
  renderSkeletons();

  try {
    // Try fetching live JSON
    const res = await fetch(`${APPS_JSON_PATH}?t=${Date.now()}`);
    if (!res.ok) throw new Error('Failed to fetch apps.json');
    const data = await res.json();
    allApps = data.apps || [];

    // Update meta counters if present
    if (data.meta) {
      updateMetaCounters(data.meta);
    }
  } catch (err) {
    console.warn('[ShopStore] Could not load apps.json, using demo data.', err);
    allApps = getDemoApps();
  }

  filteredApps = [...allApps];
  initCategoryFilter();
  renderApps(filteredApps, 'apps-grid');
  renderApps(allApps.filter(a => a.featured), 'featured-grid');
  renderApps([...allApps].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 4), 'recent-grid');
}

function updateMetaCounters(meta) {
  const totalEl = document.querySelector('[data-counter="total-installs"]');
  if (totalEl) totalEl.setAttribute('data-counter', meta.totalInstalls);
  const appsEl = document.querySelector('[data-counter="total-apps"]');
  if (appsEl) appsEl.setAttribute('data-counter', meta.totalApps);
}

/* ─── RENDER SKELETONS ─── */
function renderSkeletons() {
  ['apps-grid', 'featured-grid', 'recent-grid'].forEach(id => {
    const grid = document.getElementById(id);
    if (!grid) return;
    grid.innerHTML = Array(3).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton sk-image"></div>
        <div class="sk-body">
          <div class="sk-row">
            <div class="skeleton sk-icon"></div>
            <div class="sk-lines">
              <div class="skeleton sk-line"></div>
              <div class="skeleton sk-line short"></div>
            </div>
          </div>
          <div class="skeleton sk-desc"></div>
          <div class="skeleton sk-desc shorter"></div>
          <div class="skeleton sk-btn"></div>
        </div>
      </div>
    `).join('');
  });
}

/* ─── RENDER APP CARDS ─── */
function renderApps(apps, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!apps.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <div class="empty-state-icon">📦</div>
        <h3>No Apps Found</h3>
        <p>No apps match your current filter. Try a different category or search term.</p>
      </div>`;
    return;
  }

  grid.innerHTML = apps.map((app, idx) => buildAppCard(app, idx)).join('');

  // Init screenshot sliders for this grid
  grid.querySelectorAll('.card-screenshots').forEach(el => initScreenshotSlider(el));

  // Stagger animation
  grid.querySelectorAll('.app-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 80}ms`;
  });
}

/* ─── BUILD APP CARD HTML ─── */
function buildAppCard(app, idx) {
  const screenshots = (app.screenshots || []).filter(Boolean);
  const hasScreenshots = screenshots.length > 0;
  const stars = buildStars(app.rating || 0);
  const installCount = app.installs ? formatNumber(app.installs) : '0';

  const screenshotHTML = hasScreenshots
    ? screenshots.map((src, i) =>
        `<img src="${escapeHtml(src)}" alt="Screenshot ${i+1}" loading="lazy" class="${i === 0 ? 'active' : ''}" onerror="this.style.display='none'">`
      ).join('') +
      (screenshots.length > 1
        ? `<div class="screenshot-dots">${screenshots.map((_, i) =>
            `<span class="ss-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>`
        : '')
    : `<div class="no-screenshot">📱</div>`;

  const iconHTML = app.icon
    ? `<img src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.title)} icon" loading="lazy" onerror="this.parentElement.innerHTML='${getAppEmoji(app.category)}'">`
    : getAppEmoji(app.category);

  return `
    <div class="app-card${app.featured ? ' featured-card' : ''}" data-id="${app.id}" data-category="${escapeHtml(app.category || '')}">
      ${app.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
      <div class="card-screenshots" data-screenshots='${JSON.stringify(screenshots)}'>
        ${screenshotHTML}
      </div>
      <div class="card-body">
        <div class="card-header-row">
          <div class="card-icon">${iconHTML}</div>
          <div class="card-info">
            <div class="card-name">${escapeHtml(app.title)}</div>
            <div class="card-category">${escapeHtml(app.category || 'App')}</div>
          </div>
        </div>
        <p class="card-desc">${escapeHtml(app.description || '')}</p>
        <div class="card-meta">
          <span>💾 ${escapeHtml(app.size || 'N/A')}</span>
          <span>⬇️ ${installCount}</span>
          <span class="card-rating">${stars} ${(app.rating || 0).toFixed(1)}</span>
        </div>
        <div class="card-footer">
          <span class="card-version">v${escapeHtml(app.version || '1.0.0')}</span>
          <button class="btn-install" onclick="installApp('${app.id}', this)" ${!app.apk ? 'disabled title="APK not available"' : ''}>
            ⬇ Install
          </button>
        </div>
      </div>
    </div>`;
}

/* ─── SCREENSHOT SLIDER ─── */
function initScreenshotSlider(el) {
  const imgs = el.querySelectorAll('img');
  const dots = el.querySelectorAll('.ss-dot');
  if (imgs.length < 2) return;

  let current = 0;
  setInterval(() => {
    imgs[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (current + 1) % imgs.length;
    imgs[current].classList.add('active');
    dots[current]?.classList.add('active');
  }, SLIDE_INTERVAL);
}

/* ─── CATEGORY FILTER ─── */
function initCategoryFilter() {
  const wrap = document.querySelector('.category-filter');
  if (!wrap) return;

  const categories = ['All', ...new Set(allApps.map(a => a.category).filter(Boolean))];
  wrap.innerHTML = categories.map(cat =>
    `<button class="cat-btn${cat === 'All' ? ' active' : ''}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
  ).join('');

  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    wrap.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    applyFilters();
  });
}

function applyFilters() {
  filteredApps = allApps.filter(app => {
    const matchCat = currentCategory === 'All' || app.category === currentCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      app.title?.toLowerCase().includes(q) ||
      app.description?.toLowerCase().includes(q) ||
      app.category?.toLowerCase().includes(q) ||
      (app.tags || []).some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });
  renderApps(filteredApps, 'apps-grid');
}

/* ═══════════════════════════════════════
   SEARCH MODAL
═══════════════════════════════════════ */
function initSearchModal() {
  const overlay = document.getElementById('search-overlay');
  const input = document.getElementById('search-main-input');
  const resultsEl = document.getElementById('search-results');

  // Open via nav search button
  document.querySelectorAll('.open-search').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay?.classList.add('open');
      setTimeout(() => input?.focus(), 100);
    });
  });

  // Close on backdrop click
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) closeSearch();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      overlay?.classList.add('open');
      setTimeout(() => input?.focus(), 100);
    }
  });

  // Live search
  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    searchQuery = q;

    if (!q) {
      resultsEl.innerHTML = `<p class="search-empty">Start typing to search apps…</p>`;
      return;
    }

    const results = allApps.filter(app =>
      app.title?.toLowerCase().includes(q) ||
      app.category?.toLowerCase().includes(q) ||
      (app.tags || []).some(t => t.toLowerCase().includes(q))
    ).slice(0, 8);

    if (!results.length) {
      resultsEl.innerHTML = `<p class="search-empty">No apps found for "<strong>${escapeHtml(q)}</strong>"</p>`;
      return;
    }

    resultsEl.innerHTML = results.map(app => `
      <div class="search-result-item" onclick="goToApp('${app.id}')">
        <div class="search-result-icon">${getAppEmoji(app.category)}</div>
        <div>
          <div class="search-result-name">${escapeHtml(app.title)}</div>
          <div class="search-result-cat">${escapeHtml(app.category)} · v${escapeHtml(app.version || '1.0')}</div>
        </div>
      </div>
    `).join('');
  });
}

function closeSearch() {
  document.getElementById('search-overlay')?.classList.remove('open');
}

function goToApp(id) {
  closeSearch();
  applyFilters();
  setTimeout(() => {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.boxShadow = '0 0 0 2px var(--accent), 0 0 40px var(--accent-glow)';
      setTimeout(() => card.style.boxShadow = '', 2000);
    }
  }, 300);
}

/* ═══════════════════════════════════════
   INSTALL APP
═══════════════════════════════════════ */
function installApp(appId, btn) {
  const app = allApps.find(a => a.id === appId);
  if (!app) return;

  if (!app.apk) {
    showToast('warning', '⚠️ Unavailable', 'APK file is not available for this app.');
    return;
  }

  // Animate button
  const originalHTML = btn.innerHTML;
  btn.classList.add('installing');
  btn.innerHTML = '<span style="animation:spin 0.6s linear infinite;display:inline-block">⟳</span> Installing…';

  setTimeout(() => {
    btn.classList.remove('installing');
    btn.innerHTML = originalHTML;

    // Try triggering native install / download
    const link = document.createElement('a');
    link.href = app.apk;
    link.download = `${app.slug || app.id}.apk`;
    link.click();

    // Update install counter locally
    app.installs = (app.installs || 0) + 1;

    showToast('success', '✅ Download Started', `${app.title} is downloading. Open the file to install.`);
  }, 1600);
}

/* ═══════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════ */
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast-msg">${escapeHtml(message)}</div>` : ''}
    </div>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
// Expose globally
window.showToast = showToast;

/* ═══════════════════════════════════════
   SERVICE WORKER (PWA)
═══════════════════════════════════════ */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('[ShopStore] Service Worker registered.'))
      .catch(err => console.warn('[ShopStore] SW registration failed:', err));
  }
}

/* ═══════════════════════════════════════
   UTILITIES
═══════════════════════════════════════ */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function buildStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

function getAppEmoji(category) {
  const map = {
    'Business': '💼', 'Finance': '💰', 'Tools': '🔧',
    'Social': '💬', 'Education': '📚', 'Shopping': '🛒',
    'Health': '❤️', 'Entertainment': '🎬', 'Productivity': '⚡'
  };
  return map[category] || '📱';
}

/* ─── DEMO DATA (fallback when no server) ─── */
function getDemoApps() {
  return [
    {
      id: 'app_001',
      title: 'Balance Book Pro',
      slug: 'balance-book-pro',
      description: 'Track customer balances, debts, and payments for your recharge card business. Offline-ready and mobile-first.',
      version: '2.1.0', category: 'Business', size: '4.2 MB',
      installs: 8340, rating: 4.8, reviews: 212, featured: true,
      icon: null, apk: null, screenshots: [],
      developer: 'AmeenDesigns', dateAdded: '2026-04-10T08:00:00Z'
    },
    {
      id: 'app_002',
      title: 'Debt Manager Plus',
      slug: 'debt-manager-plus',
      description: 'Multi-shop debt management for provision store owners. Track debts, send WhatsApp reminders, manage branches.',
      version: '3.0.1', category: 'Finance', size: '6.1 MB',
      installs: 5210, rating: 4.6, reviews: 134, featured: true,
      icon: null, apk: null, screenshots: [],
      developer: 'AmeenDesigns', dateAdded: '2026-03-22T10:00:00Z'
    },
    {
      id: 'app_003',
      title: 'Number Manager Pro',
      slug: 'number-manager-pro',
      description: 'Manage phone number inventories for VTU and recharge card businesses. Real-time sync across devices.',
      version: '1.5.2', category: 'Tools', size: '2.8 MB',
      installs: 1870, rating: 4.9, reviews: 67, featured: false,
      icon: null, apk: null, screenshots: [],
      developer: 'AmeenDesigns', dateAdded: '2026-05-01T09:30:00Z'
    }
  ];
}

/* ─── EXPOSE GLOBALS for inline HTML ─── */
window.installApp = installApp;
window.goToApp = goToApp;
