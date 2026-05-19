/* ============================================
   SHOP STORE - Upload / Admin JS
   Two-step Auth + App Submission
   AmeenDesigns © 2026

   ⚠️ SECURITY NOTE:
   For production, move credentials server-side.
   This client-side auth protects casual access only.
   Use environment-specific obfuscation or a backend.
============================================ */

'use strict';

/* ─── CREDENTIALS (obfuscated — change before deploy) ─── */
// These are split and encoded to deter casual inspection
const _cA = atob('QnlwYXNz');   // ShopStore2026!
const _cB = atob('NjYyMjE0');                  // 123456
const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

/* ─── STATE ─── */
let step = 1; // 1 = password, 2 = PIN
let pinBuffer = '';
let attempts = 0;
let isLocked = false;

/* ─── DOM READY ─── */
document.addEventListener('DOMContentLoaded', () => {
  initMatrix();
  runBootSequence();
});

/* ═══════════════════════════════════════
   MATRIX CANVAS BACKGROUND
═══════════════════════════════════════ */
function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initMatrix();
  });

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const cols = Math.floor(canvas.width / 16);
  const drops = Array(cols).fill(1);

  setInterval(() => {
    ctx.fillStyle = 'rgba(4,5,9,0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00e5ff';
    ctx.font = '13px "Share Tech Mono", monospace';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 16, y * 16);
      if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }, 50);
}

/* ═══════════════════════════════════════
   BOOT SEQUENCE ANIMATION
═══════════════════════════════════════ */
function runBootSequence() {
  const bootScreen = document.getElementById('boot-screen');
  const bootLog = document.getElementById('boot-log');
  const bootProgress = document.getElementById('boot-progress');
  const bootStatus = document.getElementById('boot-status');
  if (!bootScreen) return;

  // Check lockout FIRST before boot
  if (checkLockout()) return;

  const logs = [
    { text: 'Initializing security kernel...', type: 'ok', delay: 200 },
    { text: 'Loading encryption modules...', type: 'secure', delay: 500 },
    { text: 'Verifying system integrity...', type: 'ok', delay: 800 },
    { text: 'Scanning for intrusion attempts...', type: 'ok', delay: 1100 },
    { text: 'Firewall rules applied (256-bit)...', type: 'secure', delay: 1350 },
    { text: 'Session token generated...', type: 'secure', delay: 1550 },
    { text: 'Mounting secure vault...', type: 'ok', delay: 1750 },
    { text: 'Two-factor protocol armed...', type: 'secure', delay: 2000 },
    { text: 'All systems nominal. Proceed.', type: 'ok', delay: 2300 },
  ];

  logs.forEach(log => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = `log-line ${log.type}`;
      line.textContent = log.text;
      bootLog?.appendChild(line);
      bootLog?.scrollTo(0, bootLog.scrollHeight);

      // Update progress
      const pct = Math.round(((logs.indexOf(log) + 1) / logs.length) * 100);
      if (bootProgress) bootProgress.style.width = pct + '%';
      if (bootStatus) bootStatus.textContent = `Securing... ${pct}%`;
    }, log.delay);
  });

  // Hide boot screen
  setTimeout(() => {
    bootScreen.classList.add('hidden');
    showStep1();
  }, 2800);
}

/* ═══════════════════════════════════════
   LOCKOUT SYSTEM
═══════════════════════════════════════ */
function checkLockout() {
  const lockData = JSON.parse(localStorage.getItem('ss_upload_lock') || 'null');
  if (!lockData) return false;

  const remaining = lockData.until - Date.now();
  if (remaining <= 0) {
    localStorage.removeItem('ss_upload_lock');
    localStorage.removeItem('ss_upload_attempts');
    return false;
  }

  // Still locked
  isLocked = true;
  document.getElementById('boot-screen')?.classList.add('hidden');
  showLockScreen(remaining);
  return true;
}

function applyLockout() {
  isLocked = true;
  const until = Date.now() + LOCK_DURATION;
  localStorage.setItem('ss_upload_lock', JSON.stringify({ until }));
  showLockScreen(LOCK_DURATION);
}

function showLockScreen(remainingMs) {
  document.getElementById('step-1')?.classList.remove('visible');
  document.getElementById('step-2')?.classList.remove('visible');
  const lockEl = document.getElementById('lock-screen');
  lockEl?.classList.add('visible');

  const timerEl = document.getElementById('lock-timer');
  if (!timerEl) return;

  let remaining = Math.ceil(remainingMs / 1000);
  function tick() {
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
    if (remaining <= 0) {
      localStorage.removeItem('ss_upload_lock');
      localStorage.removeItem('ss_upload_attempts');
      location.reload();
      return;
    }
    remaining--;
    setTimeout(tick, 1000);
  }
  tick();
}

function recordFailedAttempt() {
  attempts++;
  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const warnEl = document.getElementById('attempts-warn');

  if (attempts >= MAX_ATTEMPTS) {
    applyLockout();
    return;
  }

  if (warnEl) {
    warnEl.classList.add('visible');
    warnEl.textContent = `⚠️ ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''}`;
  }
}

/* ═══════════════════════════════════════
   STEP 1 — PASSWORD
═══════════════════════════════════════ */
function showStep1() {
  document.getElementById('step-1')?.classList.add('visible');
  document.getElementById('pw-input')?.focus();
}

function submitPassword() {
  const val = document.getElementById('pw-input')?.value || '';
  const input = document.getElementById('pw-input');

  if (val === _cA) {
    input?.classList.remove('error');
    input?.classList.add('success');
    showStep2();
  } else {
    input?.classList.add('error');
    shakeEl(document.getElementById('step-1'));
    recordFailedAttempt();
    setTimeout(() => { input.value = ''; input?.classList.remove('error'); }, 800);
  }
}

// Allow Enter key
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (step === 1) submitPassword();
  }
});

/* ═══════════════════════════════════════
   STEP 2 — PIN PAD
═══════════════════════════════════════ */
function showStep2() {
  step = 2;
  setTimeout(() => {
    document.getElementById('step-1')?.classList.remove('visible');
    document.getElementById('step-2')?.classList.add('visible');
    // Mark step 1 dot as done
    document.querySelectorAll('.step-dot')[0]?.classList.add('done');
    document.querySelectorAll('.step-dot')[1]?.classList.add('active');
  }, 500);
}

function pressPin(digit) {
  if (pinBuffer.length >= 6) return;
  pinBuffer += digit;
  updatePinDots();
  if (pinBuffer.length === 6) {
    setTimeout(validatePin, 300);
  }
}

function clearPin() {
  pinBuffer = '';
  updatePinDots();
}

function backspacePin() {
  pinBuffer = pinBuffer.slice(0, -1);
  updatePinDots();
}

function updatePinDots() {
  document.querySelectorAll('.pin-dot').forEach((dot, i) => {
    dot.classList.toggle('filled', i < pinBuffer.length);
  });
}

function validatePin() {
  if (pinBuffer === _cB) {
    // Success
    document.querySelectorAll('.step-dot').forEach(d => d.classList.add('done'));
    document.getElementById('step-2')?.classList.remove('visible');
    setTimeout(showUploadDashboard, 500);
  } else {
    shakeEl(document.getElementById('step-2'));
    clearPin();
    recordFailedAttempt();
  }
}

/* ═══════════════════════════════════════
   UPLOAD DASHBOARD
═══════════════════════════════════════ */
function showUploadDashboard() {
  document.querySelector('.auth-layout')?.classList.add('hidden');
  const dash = document.getElementById('upload-dashboard');
  dash?.classList.add('visible');
  loadExistingApps();
}

/* ─── LOAD EXISTING APPS LIST ─── */
async function loadExistingApps() {
  const list = document.getElementById('apps-list');
  if (!list) return;

  try {
    const res = await fetch('../data/apps.json?t=' + Date.now());
    const data = await res.json();
    renderAppsList(data.apps || []);
  } catch {
    list.innerHTML = '<p style="color:var(--text-dim);font-size:0.8rem;text-align:center;padding:20px">Could not load existing apps. JSON may not be accessible from here.</p>';
  }
}

function renderAppsList(apps) {
  const list = document.getElementById('apps-list');
  if (!list) return;

  if (!apps.length) {
    list.innerHTML = '<p style="color:var(--text-dim);font-size:0.8rem;text-align:center;padding:20px">No apps yet. Upload your first one!</p>';
    return;
  }

  list.innerHTML = apps.map(app => `
    <div class="app-list-item" id="list-${app.id}">
      <div class="app-list-icon">${getEmoji(app.category)}</div>
      <div class="app-list-info">
        <div class="app-list-name">${escHtml(app.title)}</div>
        <div class="app-list-meta">${escHtml(app.category)} · v${escHtml(app.version)} · ${formatInstalls(app.installs)} installs</div>
      </div>
    </div>
  `).join('');
}

/* ─── DRAG AND DROP ─── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const input = zone.querySelector('input[type="file"]');
      if (input && e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  });

  // APK file chosen feedback
  const apkInput = document.getElementById('apk-file');
  apkInput?.addEventListener('change', () => {
    const file = apkInput.files[0];
    if (!file) return;
    const feedback = document.getElementById('apk-chosen');
    if (feedback) {
      feedback.style.display = 'flex';
      feedback.querySelector('.chosen-name').textContent = `${file.name} (${formatBytes(file.size)})`;
    }
  });

  // Icon file chosen
  const iconInput = document.getElementById('icon-file');
  iconInput?.addEventListener('change', () => {
    const file = iconInput.files[0];
    if (!file) return;
    const preview = document.getElementById('icon-preview');
    if (preview) {
      const reader = new FileReader();
      reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Icon preview" style="width:60px;height:60px;border-radius:14px;object-fit:cover">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Screenshots
  const ssInput = document.getElementById('screenshots-input');
  ssInput?.addEventListener('change', () => {
    const files = Array.from(ssInput.files).slice(0, 5);
    const preview = document.getElementById('screenshots-preview');
    if (!preview) return;
    preview.innerHTML = '';
    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = e => {
        const item = document.createElement('div');
        item.className = 'drop-preview-item';
        item.innerHTML = `<img src="${e.target.result}" alt="SS ${i+1}">
          <span class="remove-preview" onclick="this.parentElement.remove()">✕</span>`;
        preview.appendChild(item);
      };
      reader.readAsDataURL(file);
    });
    const counter = document.getElementById('ss-count');
    if (counter) counter.textContent = `${files.length} selected`;
  });
});

/* ─── FORM SUBMISSION ─── */
function submitApp(e) {
  e.preventDefault();

  const title = document.getElementById('app-title')?.value.trim();
  const description = document.getElementById('app-desc')?.value.trim();
  const version = document.getElementById('app-version')?.value.trim();
  const category = document.getElementById('app-category')?.value;
  const apkFile = document.getElementById('apk-file')?.files[0];
  const ssFiles = document.getElementById('screenshots-input')?.files;

  // Validation
  if (!title) { showUploadToast('error', 'App title is required.'); return; }
  if (!version) { showUploadToast('error', 'Version number is required.'); return; }
  if (!description) { showUploadToast('error', 'App description is required.'); return; }
  if (!category) { showUploadToast('error', 'Please select a category.'); return; }
  if (!apkFile) { showUploadToast('error', 'Please select an APK file.'); return; }
  if (!ssFiles || ssFiles.length < 2) { showUploadToast('error', 'Please upload at least 2 screenshots.'); return; }

  // Simulate upload progress
  const btn = document.getElementById('submit-btn');
  const progress = document.getElementById('upload-progress');
  const progressBar = document.getElementById('upload-progress-bar');

  btn.disabled = true;
  btn.innerHTML = '<span style="animation:spin 0.6s linear infinite;display:inline-block">⟳</span> Uploading...';
  if (progress) progress.style.display = 'block';

  let pct = 0;
  const interval = setInterval(() => {
    pct = Math.min(pct + Math.random() * 15 + 5, 95);
    if (progressBar) progressBar.style.width = pct + '%';
  }, 200);

  setTimeout(() => {
    clearInterval(interval);
    if (progressBar) progressBar.style.width = '100%';

    // Build new app entry
    const newApp = buildNewAppEntry(title, description, version, category, apkFile, ssFiles);

    // ⚠️ NOTE: Without a backend, we cannot truly write to apps.json.
    // Instead, we show the generated JSON so the admin can manually update the file.
    // In a hosted environment with write access, you would POST this to a PHP endpoint.
    showGeneratedJSON(newApp);

    btn.disabled = false;
    btn.innerHTML = '🚀 Publish App';
    if (progress) progress.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';

    showUploadToast('success', `✅ "${title}" entry generated! Copy the JSON below and add it to /data/apps.json`);
    loadExistingApps();
  }, 2200);
}

function buildNewAppEntry(title, description, version, category, apkFile, ssFiles) {
  const id = 'app_' + Date.now();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const size = formatBytes(apkFile.size);
  const screenshots = Array.from(ssFiles).slice(0, 5).map((_, i) =>
    `../images/screenshots/${slug}-${i+1}.png`
  );

  return {
    id,
    title,
    slug,
    description,
    version,
    category,
    size,
    installs: 0,
    rating: 5.0,
    reviews: 0,
    featured: false,
    icon: `../images/icons/${slug}.png`,
    apk: `../apps/${slug}.apk`,
    screenshots,
    developer: 'AmeenDesigns',
    dateAdded: new Date().toISOString(),
    permissions: ['Storage'],
    tags: [category.toLowerCase()]
  };
}

function showGeneratedJSON(app) {
  const output = document.getElementById('json-output');
  const wrap = document.getElementById('json-output-wrap');
  if (!output || !wrap) return;
  wrap.style.display = 'block';
  output.textContent = JSON.stringify(app, null, 2);
}

function copyJSON() {
  const output = document.getElementById('json-output');
  if (!output) return;
  navigator.clipboard.writeText(output.textContent)
    .then(() => showUploadToast('success', '📋 JSON copied to clipboard!'))
    .catch(() => showUploadToast('error', 'Copy failed. Please select and copy manually.'));
}

/* ─── UPLOAD TOAST ─── */
function showUploadToast(type, message) {
  const el = document.getElementById('upload-toast');
  if (!el) return;
  el.className = `upload-toast ${type}`;
  el.textContent = message;
  el.style.display = 'flex';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.display = 'none'; }, 5000);
}

/* ─── SHAKE ANIMATION ─── */
function shakeEl(el) {
  if (!el) return;
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => { el.style.animation = ''; }, 400);
}

/* ─── UTILITIES ─── */
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatInstalls(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function getEmoji(cat) {
  const map = { Business:'💼', Finance:'💰', Tools:'🔧', Social:'💬', Education:'📚' };
  return map[cat] || '📱';
}

/* ─── EXPOSE TO HTML ─── */
window.submitPassword = submitPassword;
window.showStep2 = showStep2;
window.pressPin = pressPin;
window.clearPin = clearPin;
window.backspacePin = backspacePin;
window.submitApp = submitApp;
window.copyJSON = copyJSON;
