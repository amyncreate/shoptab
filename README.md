# 🛍️ Shop Store — Premium APK Marketplace

**By AmeenDesigns | Version 1.0.0**

A modern, animated, static APK marketplace built with pure HTML, CSS, and vanilla JavaScript.
No PHP. No backend. No database. Just files and a JSON store.

---

## 📁 Folder Structure

```
shopstore/
├── index.html              ← Main storefront
├── offline.html            ← PWA offline page
├── sw.js                   ← Service Worker (PWA)
├── manifest.json           ← PWA manifest
├── .htaccess               ← Root security rules
│
├── data/
│   ├── apps.json           ← App catalogue (you edit this manually)
│   └── .htaccess           ← Protects JSON from raw browser view
│
├── apps/                   ← Store your APK files here
│   └── .htaccess
│
├── images/
│   ├── icons/              ← App icons (512×512 PNG recommended)
│   └── screenshots/        ← App screenshots
│
├── upload/
│   ├── index.html          ← Hidden admin upload panel
│   └── .htaccess           ← Restricts indexing
│
└── assets/
    ├── css/
    │   ├── main.css         ← Store stylesheet
    │   └── upload.css       ← Admin panel stylesheet
    └── js/
        ├── main.js          ← Store logic
        └── upload.js        ← Admin auth + upload logic
```

---

## 🚀 Quick Setup

### 1. Upload files to your web host
Upload all files while maintaining the folder structure.

### 2. Add your first app manually
Edit `/data/apps.json` and add an entry inside the `"apps"` array:

```json
{
  "id": "app_001",
  "title": "My App Name",
  "slug": "my-app-name",
  "description": "What your app does.",
  "version": "1.0.0",
  "category": "Business",
  "size": "3.5 MB",
  "installs": 0,
  "rating": 5.0,
  "reviews": 0,
  "featured": false,
  "icon": "../images/icons/my-app-name.png",
  "apk": "../apps/my-app-name.apk",
  "screenshots": [
    "../images/screenshots/my-app-name-1.png",
    "../images/screenshots/my-app-name-2.png"
  ],
  "developer": "YourName",
  "dateAdded": "2026-05-19T00:00:00Z",
  "permissions": ["Storage"],
  "tags": ["business", "shop"]
}
```

### 3. Place your files
- APK → `/apps/your-app.apk`
- Icon → `/images/icons/your-app.png`
- Screenshots → `/images/screenshots/your-app-1.png`, etc.

---

## 🔐 Admin Upload Panel

### Access
Visit: `https://yoursite.com/upload/`

### Default Credentials
```
Password: ShopStore2026!
PIN:      123456
```

> ⚠️ **IMPORTANT:** Change these before going live!
> Open `/assets/js/upload.js` and update the two `atob(...)` values:

```js
// Line ~14-15 in upload.js
const _cA = atob('base64_of_your_password');
const _cB = atob('base64_of_your_pin');
```

To get base64 of your new password, run in browser console:
```js
btoa('YourNewPassword!')  // → paste result into atob(...)
btoa('9876')              // → PIN
```

### Security Features
- ✅ 5 incorrect attempts → 15-minute lockout
- ✅ Lockout persists through page refresh (localStorage)
- ✅ Two-step: password + 6-digit PIN
- ✅ Fake security boot screen (deters casual visitors)
- ✅ Matrix background + cyberpunk animations
- ✅ `.htaccess` blocks search engine indexing of `/upload/`

### How Upload Works (Static Site Mode)
Since this is a pure static site with no PHP backend, the upload panel:
1. Authenticates you securely
2. Lets you fill in all app details
3. **Generates the JSON entry** you need to paste into `apps.json`
4. Shows a "Copy JSON" button

You then manually:
- Copy the JSON entry into `/data/apps.json`
- Upload the APK to `/apps/`
- Upload the icon to `/images/icons/`
- Upload screenshots to `/images/screenshots/`

> To enable true auto-write, add a PHP backend (see PHP upgrade below).

---

## ☁️ Vercel Deployment Guide

Vercel is the fastest way to host Shop Store for free.

### Steps

1. **Create a GitHub repository**
   - Push all Shop Store files to a new repo

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repo

3. **Configure build settings**
   - Framework: **Other**
   - Build Command: *(leave empty)*
   - Output Directory: `.` *(root)*
   - Install Command: *(leave empty)*

4. **Deploy**
   - Click Deploy — your site will be live in ~30 seconds

5. **Custom Domain** (optional)
   - Go to Project Settings → Domains
   - Add `shopstore.ng` or your domain

### Vercel notes
- `.htaccess` rules do NOT work on Vercel (Apache-specific)
- Add a `vercel.json` for equivalent redirects and headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🔒 Security Instructions

### Must-do before going live

| Action | How |
|---|---|
| Change admin password | Edit `_cA` in `upload.js` |
| Change admin PIN | Edit `_cB` in `upload.js` |
| Enable HTTPS redirect | Uncomment HTTPS block in `.htaccess` |
| Restrict upload by IP | Uncomment IP block in `upload/.htaccess` |
| Enable CSP header | Uncomment CSP line in `.htaccess` |

### Optional hardening
- Rename `/upload/` to something obscure like `/xpanel8a3/`
- Add a server-side password layer (Basic Auth via cPanel)
- Rotate credentials every 90 days

---

## ✏️ Customization Tips

### Change store name
Search and replace `Shop Store` in:
- `index.html` (title, navbar, footer, meta)
- `manifest.json`

### Add your WhatsApp support link
In `index.html`, find:
```html
<a href="https://wa.me/2348000000000" ...>
```
Replace with your number.

### Change hero typewriter phrases
In `main.js`, find `const phrases = [...]` and edit the array.

### Change theme colours
In `main.css`, update the `:root` CSS variables:
```css
--accent: #00e5ff;       /* Primary glow colour */
--accent-2: #7c3aed;     /* Secondary (purple) */
--accent-3: #f59e0b;     /* Accent amber */
```

---

## 📦 PHP Upgrade (Auto-write JSON)

To enable true auto-upload without manual JSON editing:

1. Add `save-app.php` to `/data/`:
```php
<?php
header('Content-Type: application/json');
$secret = 'YOUR_SERVER_SECRET';
if ($_POST['secret'] !== $secret) { http_response_code(403); die('{"error":"Forbidden"}'); }

$data = json_decode(file_get_contents('apps.json'), true);
$newApp = json_decode($_POST['app'], true);
$data['apps'][] = $newApp;
$data['meta']['totalApps'] = count($data['apps']);
$data['meta']['lastUpdated'] = date('c');
file_put_contents('apps.json', json_encode($data, JSON_PRETTY_PRINT));
echo json_encode(['success' => true]);
```

2. In `upload.js`, replace `showGeneratedJSON(newApp)` with a `fetch` POST to this endpoint.
3. Handle file uploads with `move_uploaded_file()`.

---

## 🐛 Troubleshooting

**Apps not loading?**
- Make sure `/data/apps.json` exists and is valid JSON
- Check browser console for fetch errors
- Ensure the file paths in `apps.json` are correct

**Upload page not showing?**
- Visit `/upload/index.html` directly
- Check that JavaScript is enabled

**APK not downloading?**
- Verify the APK file exists at the path specified in `apps.json`
- Some browsers block `.apk` downloads — user may need to allow it

**PWA not installing?**
- Must be served over HTTPS
- `manifest.json` must be accessible
- Service worker must register without errors

---

## 📄 License

Built and maintained by **AmeenDesigns** for Nigerian businesses.
Free to use and customize for personal and commercial projects.

---

*Shop Store — Your business. Your apps. Your store. 🇳🇬*
