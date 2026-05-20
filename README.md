# Shop Store

A clean, professional APK download website hosted on Netlify.  
No backend. No database. Pure HTML, CSS, and JavaScript.

---

## Folder Structure

```
/
├── index.html
├── style.css
├── script.js
├── assets/
│   └── favicon.svg
├── apps/
│   └── Shoptab.apk          ← place your APK here
└── images/
    └── icon-512x512.png     ← place your app icon here
```

---

## How To Update The App

Open `script.js` and edit the `app` object at the top:

```js
const app = {
  name:        "ShopTab",
  description: "Debt management app for shop owners.",
  version:     "1.0.1",
  apk:         "apps/Shoptab.apk",     // path to your APK file
  icon:        "images/icon-512x512.png" // path to your app icon
};
```

That's it. Save the file and redeploy.

---

## Deploy To Netlify

### Option A — Drag & Drop (fastest)
1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag the entire project folder onto the Netlify deploy area
3. Done — your site is live instantly

### Option B — Git (recommended for updates)
1. Push this project to a GitHub repository
2. In Netlify: **Add new site → Import an existing project → GitHub**
3. Select the repo, leave build settings blank, click **Deploy**
4. Every `git push` auto-redeploys the site

---

## Adding / Updating The APK

1. Place the new `.apk` file inside the `/apps` folder
2. Update the `apk` path in `script.js` if the filename changed
3. Redeploy via Netlify (drag & drop or git push)

---

## Features

- ✅ Auto-typing subtitle
- ✅ Loading spinner with minimum delay
- ✅ APK availability check (shows error if file is missing)
- ✅ Offline detection banner
- ✅ Graceful icon fallback
- ✅ Mobile responsive
- ✅ Fade-in animation
- ✅ Custom SVG favicon
- ✅ Zero dependencies (no npm, no build step)

---

## Customising Typing Phrases

In `script.js`, edit the `phrases` array:

```js
const phrases = [
  "Fast Business Solutions",
  "Apps Market For Shop Owners",
  "Business Management Tools"
];
```

---

## License

MIT — free to use and modify.
