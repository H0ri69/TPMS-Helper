
# 🚀 Auto Form & Switch Filler v3.0

> **The professional auditor's companion for automating repetitive forms and UI components.**  
> Effortlessly bypass the drudgery of manual data entry with framework-aware automation.

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Firefox%20%7C%20Edge-lightgrey.svg?style=for-the-badge)

---

## ✨ Why v3.0?

Standard form fillers often fail on modern websites. **Auto Form & Switch Filler** is specifically engineered to handle complex UI libraries and reactive frameworks.

- **🧠 Framework-Aware (v-model support)**: Unlike basic fillers, v3.0 dispatches native property setters and synthetic events (`input`, `change`, `blur`). This ensures **Vue, React, and Angular** state bindings update instantly.
- **⚡ Smart Text Population**: Automatically fills standard inputs and specialized components like iView’s `.ivu-input`.
- **🔘 Switch & Toggle Mastery**: Full support for standard checkboxes PLUS custom switches from:
  - **iView / View Design** (`.ivu-switch`)
  - **Element UI** (`.el-switch`)
  - **Ant Design** (`.ant-switch`)
  - **ARIA-compliant** switches (`[role="switch"]`)
- **⌨️ Keyboard Shortcut**: Press the **Backtick key (<kbd>`</kbd>)** to trigger a full-page fill without opening the menu.
- **💾 Persistent Customization**: Define your custom fill-text in the popup; v3.0 remembers your settings across sessions.

---

## 🛠️ How to Use

### 1. The Shortcut (Fastest)
Trigger a full-page fill instantly by pressing the <kbd>`</kbd> (backtick) key.

### 2. The Popup
Click the extension icon to access the **Control Panel**. From here, you can:
- Change the default fill text (e.g., Change "Pass" to "N/A").
- Trigger a manual fill.
- View real-time stats on how many fields were processed.

---

## 📥 Installation

### **For Chromium (Chrome, Edge, Brave)**
1. Download the latest release `Source code (zip)`.
2. Extract the ZIP folder to a permanent location.
3. Open your browser and go to `chrome://extensions/`.
4. Enable **Developer mode** (top right toggle).
5. Click **Load unpacked** and select the extracted folder.

### **For Firefox**
1. Download and unzip the release.
2. Navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…**.
4. Select the `manifest.json` file from the folder.

---

## 🧪 Technical Framework Support
This extension is optimized for platforms built with:
- [x] **Vue.js / iView / View Design**
- [x] **React / Ant Design**
- [x] **Element UI**
- [x] **Standard HTML5 Forms**

---

*Developed with ❤️ to make repetitive audits and testing effortless.*
