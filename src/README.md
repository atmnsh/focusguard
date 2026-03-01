# FocusGuard - Productivity Application

This is a Tauri-based desktop application for focus and productivity tracking, built with React + TypeScript + Vite frontend and Rust backend.

## Architecture

The application uses Tauri 2 for the backend-frontend bridge, which provides secure IPC (Inter-Process Communication) without requiring WebSockets. Since both the backend and frontend are local, Tauri's built-in IPC system handles all communication efficiently.

### Backend (Rust)
Located in `/backend` directory:
- **`src/lib.rs`**: Contains Tauri commands (like `greet`) that can be called from the frontend
- **`src/main.rs`**: Entry point for the Tauri application
- **`tauri.conf.json`**: Tauri configuration file

### Frontend (React/TypeScript)
Located in `/src` directory:
- **React components**: Built with TypeScript and Tailwind CSS
- **Tauri IPC**: Communication with Rust backend via `@tauri-apps/api/core`

## IPC Communication

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

### Testing the Connection

The application includes a `TestConnection` component (`src/features/components/TestConnection.tsx`) that demonstrates the IPC connection. You can test it by:

1. Running the Tauri application
2. Navigating to the main page
3. Using the "Test Greet Command" button

## Development

### Prerequisites
- Node.js (v18+)
- Rust (latest stable)
- Tauri CLI: `cargo install tauri-cli`

### Running the Application

1. **Start the frontend dev server**:
   ```bash
   npm run dev
   ```

2. **Run the Tauri application** (in a separate terminal):
   ```bash
   cd backend
   cargo tauri dev
   ```

The Tauri dev server will automatically connect to the frontend dev server running on `http://localhost:1420`.

### Building for Production

```bash
# Build frontend
npm run build

# Build Tauri application
cd backend
cargo tauri build
```

## Why No WebSockets?

WebSockets are unnecessary for this architecture because:
1. **Local Communication**: Both frontend and backend run on the same machine
2. **Tauri IPC**: Provides a more secure and efficient communication channel
3. **No Network Overhead**: IPC doesn't require TCP ports or network stack
4. **Better Performance**: Direct process-to-process communication

The Tauri IPC system uses operating system primitives for inter-process communication, which is faster and more secure than WebSockets for local applications.

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

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
