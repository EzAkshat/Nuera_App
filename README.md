<div align="center">

# ✦ Nuera

**AI-Powered Desktop Assistant**

Real-time AI chat · Voice interaction · Smart reminders · WebSockets · Secure auth

<br/>

[![Electron](https://img.shields.io/badge/Electron-35.x-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](./LICENSE)

</div>

---

## Overview

Nuera is a modern desktop assistant that brings AI-powered conversations, hands-free voice control, and smart reminders directly to your desktop — built on Electron with a clean modular architecture and real-time WebSocket communication.

---

## Features

| | Feature | Description |
|---|---|---|
| 🤖 | **AI Conversations** | Real-time chat with markdown rendering and syntax-highlighted code blocks |
| 🎤 | **Voice Assistant** | Wake-word detection via Porcupine with full speech-to-text integration |
| 🔔 | **Smart Reminders** | Create and manage reminders with native desktop notifications |
| 🔐 | **Secure Auth** | Deep-link authentication flow with JWT token-based sessions |
| ⚡ | **Real-Time Updates** | WebSocket-based communication for instant, persistent AI responses |
| 🎨 | **Modern UI** | Dark & light themes with smooth animations and native desktop integration |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Electron](https://electronjs.org) | Desktop application framework |
| [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) | Real-time bidirectional communication |
| [Axios](https://axios-http.com) | HTTP API requests |
| [PrismJS](https://prismjs.com) | Syntax highlighting |
| [Marked](https://marked.js.org) | Markdown rendering |
| [DOMPurify](https://github.com/cure53/DOMPurify) | HTML sanitization |
| [Porcupine](https://picovoice.ai/platform/porcupine/) | Wake-word detection |
| [UUID](https://github.com/uuidjs/uuid) | Unique identifier generation |

---

## Project Structure

```
Nuera_App/
├── assets/                  # Icons & SVG assets
├── screenshots/             # Application previews
├── lib/                     # Third-party libraries
├── src/
│   ├── components/          # HTML pages & UI components
│   ├── scripts/
│   │   ├── modules/         # Core application modules
│   │   └── renderer/        # Electron renderer process
│   └── stylesheet/          # Application styles
├── index.html               # Main application entry
├── main.js                  # Electron main process
└── package.json
```

---

## Core Modules

| Module | Responsibility |
|---|---|
| `chatManager.js` | AI conversation lifecycle and state management |
| `reminderManager.js` | Reminder creation, scheduling, and notifications |
| `audio-processor.js` | Voice input handling and audio stream processing |
| `websocket.js` | Real-time bidirectional communication layer |
| `themeManager.js` | Dark/light theme switching and persistence |
| `uiManager.js` | UI rendering, updates, and DOM management |
| `pageManager.js` | Dynamic page loading and navigation routing |
| `api.js` | Backend communication and request abstraction |

---

## Authentication Flow

Nuera uses a custom protocol for secure, seamless deep-link authentication.

```
Browser Login  →  Deep-Link Callback  →  Code Exchange  →  JWT Token  →  Session
```

```
nuera://callback?code=AUTH_CODE
```

The app exchanges the authorization code for a JWT token through the authentication server — no passwords are ever stored locally.

---

## Backend Ecosystem

Nuera connects to two backend services:

**Nuera Backend** — Handles AI processing, chat APIs, reminder scheduling, WebSocket services, and audio generation.

**Nuera Auth** — Handles authentication, OAuth/token exchange, and the deep-link login flow.

---

## Getting Started

**Clone and install**

```bash
git clone https://github.com/EzAkshat/Nuera_App.git
cd Nuera_App
npm install
```

**Run in development**

```bash
npm start
```

**Build for distribution**

```bash
npm run build
```

---

## Dependencies

```json
{
  "@picovoice/porcupine-node": "^3.0.6",
  "axios": "^1.8.4",
  "dompurify": "^3.2.5",
  "marked": "^15.0.8",
  "mic": "^2.1.2",
  "prismjs": "^1.30.0",
  "uuid": "^11.1.0"
}
```

---

## Security

- Context isolation enabled in Electron
- Secure preload scripts
- Content Security Policy (CSP) enforced
- Sanitized HTML rendering via DOMPurify
- External link protection

---

## Roadmap

- [ ] Offline AI support
- [ ] AI memory system
- [ ] Cross-platform auto-updates
- [ ] Plugin architecture
- [ ] Cloud synchronization
- [ ] Full voice assistant mode

---

## License

Licensed under the [ISC License](./LICENSE).

---

<div align="center">

Built with passion by **Akshat**

If you find Nuera useful, consider giving it a ⭐

</div>