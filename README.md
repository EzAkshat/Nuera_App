<div align="center">

<br />

# ✦ Nuera

**AI-Powered Desktop Assistant**

<p>
  <img src="https://img.shields.io/badge/Electron-35.x-000?style=flat-square&logo=electron&logoColor=4ade80&labelColor=111" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-000?style=flat-square&logo=javascript&logoColor=F7DF1E&labelColor=111" />
  <img src="https://img.shields.io/badge/Node.js-000?style=flat-square&logo=node.js&logoColor=4ade80&labelColor=111" />
  <img src="https://img.shields.io/badge/License-ISC-000?style=flat-square&labelColor=111" />
</p>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&pause=2000&color=6B7280&center=true&vCenter=true&repeat=true&width=500&lines=AI+Chat+%2B+Voice+%2B+Smart+Reminders;Built+on+Electron+%2B+WebSockets;Wake-word+Detection+via+Porcupine;Dark+%26+Light+Theme+Support" alt="Typing SVG" />

<br />

[Overview](#overview) · [Features](#features) · [Stack](#tech-stack) · [Structure](#project-structure) · [Auth Flow](#authentication-flow) · [Backend](#backend-ecosystem) · [Getting Started](#getting-started) · [Security](#security)

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

```
Framework      Electron        Desktop application shell
Communication  WebSockets      Real-time bidirectional messaging
HTTP           Axios           REST API requests to backend services
Rendering      Marked          Markdown parsing and rendering
Highlighting   PrismJS         Syntax highlighting in code blocks
Sanitization   DOMPurify       Safe HTML rendering — XSS prevention
Wake-word      Porcupine       Offline wake-word detection engine
Utilities      UUID            Unique identifier generation
```

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

**[Nuera Backend](https://github.com/EzAkshat/Nuera_backend)** — Handles AI processing, chat APIs, reminder scheduling, WebSocket services, and audio generation.

**[Nuera Auth](https://github.com/EzAkshat/Nuera_auth)** — Handles all authentication. Manages user registration, OTP verification, Google OAuth 2.0, JWT issuance, and the deep-link login flow that this app depends on.

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

## Security

| Layer | Implementation |
|---|---|
| **Context Isolation** | Enabled in Electron — renderer has no Node.js access |
| **Preload Scripts** | Secure bridge between main and renderer processes |
| **CSP** | Content Security Policy enforced on all windows |
| **HTML Sanitization** | DOMPurify strips all unsafe markup before render |
| **External Links** | Intercepted and opened in system browser, not in-app |

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

Licensed under the [MIT License](./LICENSE).

---

## Author

**Akshat Naik**

<a href="https://github.com/EzAkshat">
  <img src="https://img.shields.io/badge/GitHub-EzAkshat-000?style=flat-square&logo=github&logoColor=white&labelColor=111" />
</a>
&nbsp;
<a href="https://www.linkedin.com/in/naik-akshat">
  <img src="https://img.shields.io/badge/LinkedIn-naik--akshat-0077B5?style=flat-square&logo=linkedin&logoColor=white&labelColor=111" />
</a>

---

<div align="center">
  <sub>⭐ Star this repo if it helped you — it means a lot!</sub>
</div>