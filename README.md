# 🧩 EdgeTabsPlus

A lightweight, high-performance browser extension for **Microsoft Edge** (and Chromium browsers) that automatically organizes your tabs into custom color-coded groups based on user-defined domain and URL patterns.

## 🔗 Install

- **Manual / Developer Mode (Edge, Brave, Chrome):** Download `EdgeTabsPlus-v1.1.0.zip` from the [Releases page](../../releases), extract it, and open `edge://extensions` (or `chrome://extensions`) with **Developer mode** enabled.

## ✨ Features

- **Automatic Pattern Matching:** Supports wildcards (`*.github.com`) and bare domains.
- **Edge Color Palette Support:** Includes Edge's color options (**Blue**, **Pink**, **Violet**, **Purple**, **Royal Blue**, **Teal**, **Orange Yellow**, **Gray**) with safe API mapping.
- **JSON Backup & Restore:** Easily export your custom rules and import them across browsers.
- **Privacy First:** 100% local execution using `chrome.storage.sync`. No external tracking or data collection.
- **Manifest V3:** Built on modern, secure Chromium extension standards.

## 🚀 Installation (Developer Mode)

If you want to install it locally:

1. Clone or download this repository as a `.zip` file and extract it.
2. Open your browser and navigate to:

- **Edge:** `edge://extensions`
- **Chrome:** `chrome://extensions`

3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked** and select your project folder.

## ⚙️ Usage

1. Click the extension icon to open the **Settings Dashboard**.
2. Add a new Group Rule with your target Group Name, Color, and Domain Patterns (e.g., `*.amazon.com`).
3. Open matching URLs—they will instantly sort into their designated groups!

## 🔒 Privacy

**EdgeTabsPlus** runs 100% locally in your browser. Your group rules are stored via `chrome.storage.sync` (and optionally exported/imported as local JSON files). No browsing history, telemetry, or external tracking data is collected or sent to third-party servers.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [issues page](../../issues).

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👤 Author

**Nikhil Tamhankar**[cite: 2]

- GitHub: [@theepicnik](https://github.com/theepicnik)[cite: 2]
- LinkedIn: [Nikhil Tamhankar](https://www.linkedin.com/in/nikhiltamhankar/)[cite: 2]
