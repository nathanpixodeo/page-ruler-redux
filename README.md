# Page Ruler Redux

A Chrome extension for web developers and designers to measure pixel dimensions and positioning of elements on any web page.

**Forked from the original Page Ruler** — optimized for modern Chrome (Manifest V3), clean, ad-free, and open source.

---

## Features

- **Pixel-perfect ruler** — Drag to create, move, and resize a measurement overlay on any page
- **Element inspection** — Hover to highlight and measure any element; navigate parent/child/sibling tree
- **Border Search** — Click corner arrows to auto-snap the ruler edge to the nearest visible element border
- **Editable dimensions** — Manually type Width, Height, Left, Top, Right, Bottom values
- **Keyboard navigation** — Arrow keys to nudge, Shift for 10px, Ctrl to expand, Ctrl+Alt to shrink
- **Color picker** — Customize the ruler border color
- **Guide lines** — Toggle quadrant guides around the measured area
- **Dock position** — Move the toolbar to top or bottom of the page
- **Persistent settings** — Color, dock position, guides, border search saved via `chrome.storage.sync`
- **Keyboard shortcut** — `Alt+P` to toggle the ruler on/off
- **i18n** — Fully translated into 9 languages
- **No tracking** — Google Analytics completely removed in v2.0.0

---

## Installation

### Chrome Web Store *(when published)*
Search for **Page Ruler Redux** in the [Chrome Web Store](https://chrome.google.com/webstore) and click **Add to Chrome**.

### Developer Mode (local)
1. Clone or download this repository:
   ```bash
   git clone https://github.com/nathanpixodeo/page-ruler-redux.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `page-ruler-redux` folder

---

## Usage

### Basic
1. Click the **Page Ruler Redux** icon in the toolbar (or press `Alt+P`)
2. Click and drag anywhere on the page to create a ruler
3. Drag the ruler border to reposition; drag edges/corners to resize
4. View exact pixel values in the toolbar

### Element Mode
1. Click the **orange element-mode button** (or press while ruler is active)
2. Hover over any element on the page — it will be highlighted automatically
3. Use the navigation arrows in the toolbar to traverse parent/child/sibling elements
4. Click the tracked element to lock the selection onto it

### Border Search
1. Click any of the **8 arrow indicators** at the ruler corners
2. The extension captures a screenshot, detects the nearest color boundary, and snaps the edge to it

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt + P` | Toggle Page Ruler on/off |
| `↑` `↓` `←` `→` | Move ruler 1px |
| `Shift` + arrow | Move ruler 10px |
| `Ctrl` + arrow | Expand ruler outward 1px |
| `Ctrl + Shift` + arrow | Expand ruler outward 10px |
| `Ctrl + Alt` + arrow | Shrink ruler inward 1px |
| `Ctrl + Alt + Shift` + arrow | Shrink ruler inward 10px |
| `Enter` (on input) | Apply typed dimension value |
| `Shift + ↑/↓` (on input) | Increase/decrease value by 10 |

---

## Changelog

### 2.0.0 (2025)
- **Upgraded to Manifest V3** — compatible with latest Chrome
- **Background page → Service Worker** — no DOM access; uses `OffscreenCanvas` for border search
- **`chrome.browserAction` → `chrome.action`** — MV3 API
- **`chrome.tabs.executeScript` → `chrome.scripting.executeScript`** — MV3 scripting API
- **`chrome.extension.getURL` → `chrome.runtime.getURL`** — deprecated API replaced
- **Google Analytics removed** — no tracking, no telemetry, no external requests
- **Fixed bug**: `this.version` was undefined in content.js (CSS cache-busting broken)
- **Permissions minimized**: `activeTab` + `scripting` + `storage` only

[See full changelog →](docs/CHANGELOG.md)

---

## Project Structure

```
page-ruler-redux/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker (event handling, border search)
├── content.js             # Injected script (ruler UI, mouse handling)
├── content.css            # Styles injected into the page
├── popup.html / popup.js  # Error popup for restricted pages
├── options.html / options.js  # Settings page
├── update.html / update.js     # Install/update/help page
├── update.css             # Bootstrap-based styles for update page
├── _locales/              # i18n translations (9 languages)
├── icons/                 # Extension icons (16, 48, 128px)
├── images/                # UI images (arrows, close, dock, etc.)
└── fonts/                 # Glyphicons icon font (Bootstrap)
```

---

## Development

No build system required — this is a plain JavaScript extension. Edit the files directly and reload at `chrome://extensions`.

### Loading changes
1. Go to `chrome://extensions`
2. Click the refresh icon on the **Page Ruler Redux** card
3. Or press `Ctrl+R` / `Cmd+R` while the extensions page is focused

### Adding translations
1. Copy `_locales/en/messages.json` to a new locale folder (e.g., `_locales/de/`)
2. Translate the `"message"` values
3. Reload the extension

---

## Contributing

Contributions are welcome! Please open an issue first to discuss changes.

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

Bug reports and feature requests: [GitHub Issues](https://github.com/nathanpixodeo/page-ruler-redux/issues)

---

## License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Peter Newnham** — Author of the original Page Ruler
- **Esteban Rocha** — Creator of Page Ruler Redux (forked to remove malware tracking)
- **Contributors** — All translators and bug reporters
