# 🧠 Ollama Chat — Hybrid AI Chat Interface

This project is a flexible, local-first AI chat interface that lets you seamlessly switch between OpenAI models (e.g., GPT-4, GPT-4o) and local Ollama models (e.g., `phi4`, `llama3`). It features support for system prompt presets, streaming/non-streaming completions, and backend routing via a simple Node.js proxy.

---

## ✨ Features

- 🔄 **Dynamic Model Switching**
  - Toggle between OpenAI and local Ollama models
  - Input server URL and choose model via UI

- 💬 **Personality Presets**
  - `🧠 Spiritual Scholar`: Bahá’í-aligned spiritual tone
  - `⚠️ AI Safety Expert`: Alignment and risk-focused
  - `✨ Playful Philosopher`: Open-ended, creative reasoning
  - `🤖 Neutral Assistant`: Concise, default behavior

- 🧩 **Dual API Support**
  - Supports OpenAI’s `messages` format
  - Automatically transforms `messages → prompt` for Ollama models

- 🖥️ **Custom Frontend**
  - Vanilla HTML/CSS/JS (no framework required)
  - Markdown + syntax highlighting via `marked.js` and `highlight.js`
  - Live streaming-ready architecture

- 🧪 **Dev Friendly**
  - In-browser console logs (request routing, payloads, backend used)
  - Customizable via `app.js` + `api-client.js`
  - Modular and easy to extend

---

## 🚀 Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-username/ollama-chat
cd ollama-chat
npm install
