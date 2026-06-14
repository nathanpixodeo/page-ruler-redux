# Changelog

## 2.0.0 (2025)

### Breaking Changes
- **Manifest V3 upgrade** — Chrome no longer accepts MV2 extensions for new submissions; MV3 is required
- **Background page converted to Service Worker** — no DOM access; all canvas operations use `OffscreenCanvas`
- **Google Analytics removed** — all telemetry tracking and external requests eliminated

### API Changes
| Old API | New API |
|---|---|
| `manifest_version: 2` | `manifest_version: 3` |
| `background.scripts: ["background.js"]` | `background.service_worker: "background.js"` |
| `background.persistent: false` | removed (always non-persistent in MV3) |
| `browser_action` | `action` |
| `chrome.browserAction.onClicked` | `chrome.action.onClicked` |
| `chrome.browserAction.setIcon` | `chrome.action.setIcon` |
| `chrome.browserAction.setPopup` | `chrome.action.setPopup` |
| `chrome.tabs.executeScript` | `chrome.scripting.executeScript` |
| `chrome.extension.getURL` | `chrome.runtime.getURL` |
| `web_accessible_resources: [...]` | `web_accessible_resources: [{resources: [...], matches: [...]}]` |
| `options_page` | `options_ui` |
| `content_security_policy` | removed (MV3 enforces CSP internally) |
| `update_url` | removed (Chrome Web Store handles updates) |
| `commands._execute_browser_action` | `commands._execute_action` |

### Bug Fixes
- Fixed `this.version` being `undefined` in `content.js` line 17 (CSS cache-busting query string was broken)
- Content script now uses `chrome.runtime.getManifest().version` for cache busting

### Performance
- Removed Google Analytics: `_gaq` queue, script injection, and all `trackEvent`/`trackPageview` messages
- Removed 16 redundant GA tracking calls from content.js
- Removed `tabs` permission (unnecessary with `activeTab` + `scripting`)
- Removed `host_permissions` (unnecessary with `activeTab` + `scripting`)

### v1.x History (original Page Ruler Redux by Esteban Rocha)

#### 1.2.0 (February 28, 2019)
- Translation fixes, design updates
- Google Analytics opt-out option in settings
- New logo and branding

#### 1.1.0 (March 21, 2018)
- Reduced extension permissions
- Better arrow icons
- Element tracking mode and border search improvements

#### 1.0.0 (February 8, 2018)
- Initial fork from original Page Ruler
- Removal of Mixpanel malware tracking
- Community-driven development begins
