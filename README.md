# FocusGuard – AI-Powered Focus Assistant

FocusGuard is a desktop application designed to help users maintain concentration on their current tasks — without relying on coercive restrictions or content blocking. Instead, it uses real-time behavioral analysis and an adaptive AI avatar to motivate users back to focus when distraction is detected.

## Developed by students at PPMG "Acad. Nikola Obreshkov", Burgas, Bulgaria.

## Features

- Real-time activity monitoring via a background process
- AI-driven distraction detection and intervention
- Personalized animated avatar powered by Google Gemini (voice + LLM)
- Session statistics with chart visualizations and AI-generated summaries
- User authentication with secure password hashing and JWT sessions
- Light/dark mode, multi-language support, and customizable settings

---

## 🛠 Stack

**Frontend:** TypeScript, React, Tailwind CSS, Shadcn, Recharts

**Backend:** Rust, Tokio, Rusqlite, Sysinfo, Reqwest, Serde, Argon2, JSONWebToken

**Avatar:** Godot Engine v4 (GDScript, AudioStream/AudioBus)

**AI:** Google Gemini API (`gemini-2.5-flash-preview-tts`) — voice input, contextual responses, TTS

**Database:** SQLite

**Infrastructure:** Oracle Cloud, GitHub CI/CD

---

## Architecture

The application uses Tauri 2 for the backend-frontend bridge, which provides secure IPC (Inter-Process Communication) without requiring WebSockets. Since both the backend and frontend are local, Tauri's built-in IPC system handles all communication efficiently.

### Backend (Rust)

Located in `/backend` directory:

- **`src/lib.rs`**: Contains Tauri commands that can be called from the frontend
- **`src/main.rs`**: Entry point for the Tauri application
- **`tauri.conf.json`**: Tauri configuration file

### Frontend (React/TypeScript)

Located in `/src` directory:

- **React components**: Built with TypeScript and Tailwind CSS, using Shadcn components
- **Tauri IPC**: Communication with Rust backend via `@tauri-apps/api/core`

---

## Inter-Process Communication

Tauri provides a secure IPC channel between the frontend and backend. Unlike WebSockets, this doesn't require a network connection since both processes run on the same machine.

### Example: Calling a Rust Command from React

**Backend (Rust)**:

```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
```

**Frontend (React)**:

```typescript
import { invoke } from "@tauri-apps/api/core";

const response = await invoke<string>("greet", { name: "World" });
console.log(response); // "Hello, World! You've been greeted from Rust!"
```

---

## 🚀 Startup Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+, with npm)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable) & Cargo
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites): `cargo install tauri-cli`

### 1. Clone the repository

```bash
git clone https://github.com/atmnsh/focusguard
cd focusguard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the application in development mode

Start the frontend dev server:

```bash
npm run dev
```

Run the Tauri application (in a separate terminal):

```bash
cd backend
cargo tauri dev
```

The Tauri dev server will automatically connect to the frontend dev server running on `http://localhost:1420`.

Alternatively, download a pre-built release for **macOS** or **Windows** from the [project website](https://github.com/atmnsh/focusguard).

### Building for Production

```bash
# Build frontend
npm run build

# Build Tauri application
cd backend
cargo tauri build
```

---

## Project Structure

```
focusguard/
├── backend/           # Rust backend (Tauri)
│   ├── src/          # Rust source code
│   └── tauri.conf.json
├── src/              # React frontend
│   ├── features/     # React components
│   └── main.tsx     # Entry point
├── package.json      # Frontend dependencies
└── vite.config.ts   # Vite configuration
```

---

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      reactX.configs["recommended-typescript"],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```
