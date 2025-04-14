# 🧠 ChatMoi — Hybrid AI Chat Interface (OpenAI + Ollama)

**ChatMoi** is a lightweight, local-first AI chat interface that lets you switch seamlessly between OpenAI models (like `gpt-4` and `gpt-4o`) and locally hosted Ollama models (like `phi4`, `llama3`).  
It includes support for personality presets, Markdown rendering with syntax highlighting, and a unified Node.js backend for routing requests.

---

## ✨ Features

- 🔄 **Dynamic Model Switching**  
  Switch between OpenAI (cloud) and Ollama (local) models at runtime

- 💬 **Personality Presets**  
  Selectable system messages to control model tone and behavior:
  - 🧠 *Spiritual Scholar*
  - ⚠️ *AI Safety Expert*
  - ✨ *Playful Philosopher*
  - 🤖 *Neutral Assistant*

- 🧠 **OpenAI + Ollama Support**  
  - Full support for OpenAI `messages` format  
  - Auto-converts `messages → prompt` for Ollama models  
  - Streaming-ready architecture

- 🖥️ **Frontend Interface**  
  - Plain HTML/CSS/JS (no build step required)
  - Markdown rendering with `marked.js`
  - Code syntax highlighting via `highlight.js`

- 🧪 **Developer Friendly**
  - Debug logs in browser + terminal
  - Modular, readable, and easily extensible

---

## 📁 Project Structure

```
CHATMOI/
├── .env.local                 # Your OpenAI API key
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── server.js                 # Node.js proxy API server
└── public/
    ├── index.html            # Main UI
    ├── css/
    │   └── styles.css
    └── js/
        ├── app.js            # Main frontend controller
        ├── api-client.js     # Handles requests to server
        ├── list-models.js    # (optional) Ollama model listing
        ├── markdown-renderer.js
        ├── highlight.min.js
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your `.env.local` file

```env
OPENAI_API_KEY_DFD=sk-...
```

### 3. Start the proxy server

```bash
node server.js
```

This starts your unified `/api/generate` endpoint at `http://localhost:8080`.

### 4. Open the chat UI

Open `public/index.html` in your browser.  
(Use the "Live Server" extension in VS Code for the best experience.)

---

## 📡 Backend Routing Logic

The proxy in `server.js`:

- Routes to OpenAI if `useOpenAI: true`
- Routes to Ollama if `useOpenAI: false`
- Converts `messages` array to `prompt` string for Ollama (which doesn’t support chat format)
- Adds optional system prompt if none is given

---

## 🛠 TODO / Roadmap

### 🔄 Functionality
- [ ] Add streaming support for Ollama models (currently only OpenAI streaming is implemented)
- [ ] Add chat history persistence per model (localStorage or file-based)
- [ ] Add per-model default system prompts (gpt-4 vs phi4, etc.)
- [ ] Support multi-turn chat context for Ollama via simulated memory

### 💡 UI/UX Improvements
- [ ] Display active backend (e.g., 🧠 OpenAI or 🐎 Ollama badge)
- [ ] Add "Typing..." or token streaming animation
- [ ] Improve model + preset dropdown UX (grouping, inline descriptions)
- [ ] Save last-used model, server URL, and preset in localStorage

### 🧪 Developer Features
- [ ] Add `DEBUG=true` mode with logging overlay
- [ ] Show full API request/response JSON in collapsible panels
- [ ] Visualize token usage and latency

### 📦 Project Organization
- [ ] Move backend code (`server.js`) into `/backend/` folder for clarity
- [ ] Add build/dev tasks using `npm scripts` or `vite`
- [ ] Prepare production setup (e.g., static + API separation)

### 📤 Optional Features
- [ ] Export chat session as Markdown, PDF, or JSON
- [ ] Add microphone input (speech-to-text via Web Speech API)
- [ ] Package as a local desktop app (Electron or Tauri)

---

## 🧠 Powered By

- [Ollama](https://ollama.com) for local LLMs
- [OpenAI API](https://platform.openai.com/)
- [`marked`](https://github.com/markedjs/marked) for Markdown parsing
- [`highlight.js`](https://highlightjs.org/) for code syntax highlighting

---

## 📄 License

MIT — use, remix, and share freely.

---

## 🙌 Acknowledgements

Built by David F. Dumaresq to explore the space between local AI, cloud intelligence, and spiritually grounded human values.
