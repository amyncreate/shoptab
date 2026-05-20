/* =========================================
   SHOP STORE — script.js
   ========================================= */

/* ------------------------------------------
   APP CONFIGURATION
   Edit these values to update your app info.
   ------------------------------------------ */
const app = {
  name:        "ShopTab",
  description: "Debt management app for shop owners. Track customer debt, manage credit, save debt proof, and stay organized. All in one place application.",
  version:     "1.0.1",
  apk:         "apps/Shoptab.apk",
  icon:        "images/icon-512x512.png"
};

/* ------------------------------------------
   TYPING SUBTITLE PHRASES
   ------------------------------------------ */
const phrases = [
  "Fast Business Solutions",
  "Apps Market For Shop Owners",
  "Business Management Tools"
];

/* ==========================================
   TYPING EFFECT
   ========================================== */
(function initTyping() {
  const el     = document.getElementById("typing-text");
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? 45 : 80);
  }

  tick();
})();

/* ==========================================
   OFFLINE DETECTION
   ========================================== */
function updateOnlineStatus() {
  const banner = document.getElementById("offline-banner");
  if (!navigator.onLine) {
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
}

window.addEventListener("online",  updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();

/* ==========================================
   YEAR IN FOOTER
   ========================================== */
document.getElementById("year").textContent = new Date().getFullYear();

/* ==========================================
   APP CARD BUILDER
   ========================================== */
function buildCard() {
  const container = document.getElementById("app-card-container");
  const errorBox  = document.getElementById("error-message");

  /* Icon: try loading, fall back to SVG placeholder */
  const iconEl = new Image();
  iconEl.src   = app.icon;
  iconEl.alt   = app.name + " icon";
  iconEl.className = "app-icon";

  const iconFallback = `
    `;

  let iconHTML = `<img src="${app.icon}" alt="${app.name} 
  icon" class="app-icon" onerror="this.outerHTML='${iconFallback.replace(/\n\s*/g, ' ')}`;

  const card = document.createElement("div");
  card.className = "app-card";
  card.innerHTML = `
    <div class="app-card-top">
      ${iconHTML}
      <div class="app-info">
        <div class="app-name">${escHtml(app.name)}</div>
        <span class="app-version">v${escHtml(app.version)}</span>
      </div>
    </div>
    <p class="app-description">${escHtml(app.description)}</p>
    <a
      class="install-btn"
      href="${escHtml(app.apk)}"
      download="${escHtml(app.name)}.apk"
      id="install-btn"
      aria-label="Download and install ${escHtml(app.name)}"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Install App
    </a>
  `;

  /* Verify APK exists before showing card */
  fetch(app.apk, { method: "HEAD" })
    .then(res => {
      if (!res.ok) throw new Error("APK not found");
      container.appendChild(card);
    })
    .catch(() => {
      /* Show error only if offline check already passed */
      if (navigator.onLine) {
        errorBox.classList.remove("hidden");
      } else {
        /* Offline — show card anyway so user sees info */
        container.appendChild(card);
        const btn = card.querySelector("#install-btn");
        btn.style.opacity = "0.6";
        btn.style.pointerEvents = "none";
        btn.innerHTML = btn.innerHTML.replace("Install App", "Unavailable Offline");
      }
    });
}

/* ==========================================
   HTML ESCAPE HELPER
   ========================================== */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ==========================================
   PAGE LOAD SEQUENCE
   ========================================== */
window.addEventListener("load", () => {
  const loader = document.getElementById("loading-screen");
  const main   = document.getElementById("main-content");

  /* Minimum 600ms so spinner doesn't flash */
  const MIN_LOAD = 600;
  const start    = Date.now();

  buildCard();

  function reveal() {
    const elapsed = Date.now() - start;
    const delay   = Math.max(0, MIN_LOAD - elapsed);

    setTimeout(() => {
      loader.classList.add("fade-out");
      main.classList.remove("hidden");
      requestAnimationFrame(() => main.classList.add("visible"));
      setTimeout(() => loader.remove(), 450);
    }, delay);
  }

  reveal();
});
