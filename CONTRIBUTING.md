# Contributing to EdgeTabsPlus

Thanks for helping improve **EdgeTabsPlus**! All changes go through a Pull Request review process before merging into `main`.

## Core Principles
- **100% Local-First:** No external analytics, telemetry, or remote scripts (`chrome.storage.sync` only).
- **Minimal Permissions:** Avoid adding new `manifest.json` permissions unless strictly necessary.
- **Edge Compatibility:** Ensure tab group colors map cleanly to valid Chromium `tabGroups.Color` enum values.

## How to Contribute
1. Fork this repository and create a new branch from `main` (e.g., `fix/url-matching` or `feat/dark-mode`).
2. Test your changes locally via `edge://extensions` (**Developer mode** → **Load unpacked**).
3. Open a Pull Request against `main` describing what changed and why.
4. Once reviewed and approved, your changes will be merged and included in the next EdgeTabsPlus release.