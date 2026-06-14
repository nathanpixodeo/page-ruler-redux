# Security Policy

## Minimal Permissions

Page Ruler Redux uses the minimum permissions required to function:

| Permission | Reason |
|---|---|
| `activeTab` | Access the current tab only when the user clicks the extension icon |
| `scripting` | Inject the ruler UI into the page |
| `storage` | Save user preferences (color, dock position, etc.) |

- No `tabs` permission — the extension cannot read all tabs' URLs
- No `host_permissions` — access is granted by `activeTab` only on user action
- No `webRequest` — the extension does not observe or modify network requests
- No `cookies` — the extension does not read cookies
- No remotely hosted code — all scripts are bundled in the extension package

## Data Collection

**None.** All Google Analytics tracking code has been removed as of version 2.0.0.

The extension does not:
- Send data to any external server
- Collect usage statistics
- Store personal information
- Use third-party analytics or tracking services

## Content Script Isolation

The ruler UI runs as a content script in an isolated world. It cannot:
- Access the page's JavaScript variables or functions (and vice versa)
- Modify the page's JavaScript behavior
- Read form inputs, passwords, or sensitive data

## Reporting a Vulnerability

If you discover a security issue, please open a GitHub issue:
https://github.com/nathanpixodeo/page-ruler-redux/issues
