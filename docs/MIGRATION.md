# Migration Guide: Manifest V2 → Manifest V3

This document details every change made to upgrade Page Ruler Redux from Chrome Manifest V2 to Manifest V3.

## Why MV3?

Chrome is phasing out Manifest V2. Extensions still on MV2 will:
- Show deprecation warnings in the extensions management page
- Eventually be disabled by Chrome
- Be rejected from the Chrome Web Store

Manifest V3 brings:
- Better security (no remotely hosted code, no inline execution)
- Improved privacy (host permissions opt-in)
- Service worker-based background pages (lower memory usage)

---

## Summary of Changes

### 1. `manifest.json`

**Before (MV2):**
```json
{
    "manifest_version": 2,
    "background": {
        "scripts": ["background.js"],
        "persistent": false
    },
    "options_page": "options.html",
    "permissions": ["activeTab", "tabs", "storage"],
    "web_accessible_resources": ["content.css", "images/..."],
    "content_security_policy": "script-src 'self' https://ssl.google-analytics.com; object-src 'self'",
    "browser_action": { ... },
    "commands": { "_execute_browser_action": { ... } },
    "update_url": "https://clients2.google.com/service/update2/crx"
}
```

**After (MV3):**
```json
{
    "manifest_version": 3,
    "background": {
        "service_worker": "background.js"
    },
    "options_ui": {
        "page": "options.html",
        "open_in_tab": true
    },
    "permissions": ["activeTab", "scripting", "storage"],
    "web_accessible_resources": [{
        "resources": ["content.css", "images/..."],
        "matches": ["<all_urls>"]
    }],
    "action": { ... },
    "commands": { "_execute_action": { ... } }
}
```

**Key differences:**
- `"persistent"` removed — service workers are always non-persistent
- `options_page` → `options_ui` (deprecated but still functional; `options_ui` is recommended)
- `"tabs"` permission removed — `activeTab` + `scripting` covers all needs
- `web_accessible_resources` now requires a `matches` array
- `content_security_policy` removed — MV3 enforces CSP automatically
- `update_url` removed — Chrome Web Store handles updates
- `browser_action` → `action`
- `_execute_browser_action` → `_execute_action`

### 2. `background.js` — Service Worker Conversion

#### What changed

| Feature | MV2 (Event Page) | MV3 (Service Worker) |
|---|---|---|
| DOM access | Full (`document`, `window`, `Image`, `canvas`) | **None** |
| `new Image()` | Yes | No — use `fetch()` + `createImageBitmap()` |
| `document.createElement('canvas')` | Yes | No — use `new OffscreenCanvas()` |
| `canvas.getContext('2d').getImageData()` | Yes | Yes — `OffscreenCanvas` supports this |
| `document.createElement('script')` | Yes (for GA) | No — removed entirely |
| Console | `console.log`, `console.group` | `console.log` only (no `group`) |
| Tab-specific state | Stored in memory | Must re-fetch from `chrome.storage` or message passing |
| Lifecycle | Persistent or event-driven | Terminates after ~30s idle; listeners must be synchronous |

#### Border Search Migration

The border search feature captures a screenshot and analyzes pixels to find color boundaries.

**MV2 approach:**
```javascript
var screenshot = new Image();
var canvas = document.createElement('canvas');
screenshot.onload = function() {
    var ctx = canvas.getContext('2d');
    ctx.drawImage(screenshot, 0, 0);
    var data = ctx.getImageData(...).data;
    // ... process pixels ...
};
screenshot.src = dataUrl;
```

**MV3 approach:**
```javascript
const response = await fetch(dataUrl);
const blob = await response.blob();
const bitmap = await createImageBitmap(blob);
const canvas = new OffscreenCanvas(width, height);
const ctx = canvas.getContext('2d');
ctx.drawImage(bitmap, 0, 0);
const data = ctx.getImageData(...).data;
// ... process pixels ...
```

### 3. `content.js` — API Updates

| Deprecated | Replacement |
|---|---|
| `chrome.extension.getURL(...)` | `chrome.runtime.getURL(...)` |
| `this.version` (undefined) | `chrome.runtime.getManifest().version` |

### 4. Google Analytics Removal

All GA-related code has been removed:

- `_gaq` queue variable
- GA script injection (`document.createElement('script')`)
- `content_security_policy` entry for `ssl.google-analytics.com`
- All `trackEvent` and `trackPageview` chrome.runtime.sendMessage calls
- `PageRuler.Analytics` namespace (background.js)
- Statistics checkbox (options page) — UI preserved but no GA logic behind it

**Why removed:** Service workers have no DOM, so GA's script injection cannot work. MV3 CSP also blocks remote script loading.

### 5. Script Injection

| Deprecated | Replacement |
|---|---|
| `chrome.tabs.executeScript(tabId, {file: "content.js"})` | `chrome.scripting.executeScript({target: {tabId}, files: ["content.js"]})` |
| `chrome.tabs.executeScript(tabId, {code: "..."})` | `chrome.scripting.executeScript({target: {tabId}, func: () => { ... }})` |

Requires the `"scripting"` permission in manifest.

### 6. Permissions

**Before:** `activeTab`, `tabs`, `storage`
**After:** `activeTab`, `scripting`, `storage`

`"tabs"` was only used for `chrome.tabs.executeScript` and `chrome.tabs.captureVisibleTab`. The former is replaced by `chrome.scripting.executeScript` (needs `"scripting"`), and `captureVisibleTab` works with `activeTab` alone.

---

## Testing the Migration

1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click **Load unpacked** and select the extension folder
4. Verify:
   - Click the toolbar icon — ruler appears
   - Click and drag to create a ruler
   - Resize handles work on edges and corners
   - Element mode toggle highlights elements on hover
   - Border search snaps ruler edges
   - Keyboard shortcuts: arrows, `Alt+P`
   - Color picker, guides toggle, dock position
   - Settings persist across page reloads
   - Error popup on `chrome://` and webstore pages
