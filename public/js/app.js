import OllamaClient from "./api-client.js";
import MarkdownRenderer from "./markdown-renderer.js";

class OllamaChat {
  constructor() {
    this.client = new OllamaClient({
      defaultModel: "gpt-4o-2024-05-13",
      serverUrl: "http://localhost:8080", // your proxy
      useOpenAI: false,
    });
    this.renderer = null; // We'll initialize this after making sure libraries are loaded
    this.controller = null;

    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    // Check if libraries are loaded or wait for them
    this.waitForDependencies()
      .then(() => {
        this.renderer = new MarkdownRenderer();
        this.setupEventListeners();
        this.populateModelDropdown();
        console.log("Application initialized successfully");
      })
      .catch((error) => {
        console.error("Failed to initialize application:", error);
        // Show error to user
        document.body.innerHTML += `
        <div style="color: red; padding: 20px; border: 1px solid red; margin-top: 20px;">
          Error initializing application: Required libraries failed to load.
          Try refreshing the page or check console for details.
        </div>
      `;
      });
      this.presets = {
        scholar: `You are a thoughtful and articulate assistant with deep knowledge of both artificial intelligence and the Bahá’í Faith. Respond with clarity, insight, and spiritual depth.`,
        safety: `You are an AI safety researcher who is deeply informed on AI alignment, superintelligence, and existential risk. Respond with careful reasoning and reference current research.`,
        philosopher: `You are a curious and playful philosopher. Explore abstract ideas with imagination, metaphors, and speculative thought.`,
        neutral: `You are a helpful and concise assistant.`,
      };
  }

  populateModelDropdown() {
    this.models = {
      "gpt-4o": "openai",
      "gpt-4": "openai",
      "gpt-3.5-turbo": "openai",
      "llama3": "ollama",
      "mistral": "ollama",
      "phi4:latest": "ollama",
      "tinyllama": "ollama",
    };
  
    const select = document.getElementById("model-select");
    select.innerHTML = "";
  
    Object.keys(this.models).forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = model;
      select.appendChild(option);
    });
  
    // Set default
    select.value = this.client.defaultModel;
  
    select.addEventListener("change", (e) => {
      const selected = e.target.value;
      const provider = this.models[selected];
  
      this.client.useOpenAI = provider === "openai";
      this.client.defaultModel = selected;
  
      console.log(`🔄 Switched to ${selected} (${provider})`);
    });
  }
  
  /**
   * Wait for dependencies to load
   */
  waitForDependencies() {
    return new Promise((resolve, reject) => {
      // If dependencies are already loaded, resolve immediately
      if (
        typeof hljs === "object" &&
        (typeof marked === "function" || typeof marked === "object")
      ) {
        console.log("Dependencies already loaded");
        resolve();
        return;
      }

      // Check every 100ms for up to 5 seconds
      let attempts = 0;
      const maxAttempts = 50;

      const checkInterval = setInterval(() => {
        attempts++;

        if (
          typeof hljs === "object" &&
          (typeof marked === "function" || typeof marked === "object")
        ) {
          clearInterval(checkInterval);
          console.log("Dependencies loaded successfully");
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error("Dependencies failed to load after 5 seconds"));
        }
      }, 100);
    });
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Button event listeners
    document
      .getElementById("ask-button")
      .addEventListener("click", () => this.ask());
    document
      .getElementById("abort-button")
      .addEventListener("click", () => this.abort());

    // Enter key shortcut
    document.getElementById("prompt").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.ask();
      }
    });

    // Save server URL when changed
    document.getElementById("server-url").addEventListener("change", (e) => {
      this.client.setServerUrl(e.target.value.trim());
    });

    // Initialize with current server URL
    const serverUrl = document.getElementById("server-url").value.trim();
    if (serverUrl) {
      this.client.setServerUrl(serverUrl);
    }
  }

  /**
   * Create a new exchange in the chat history
   * @param {string} promptText - The user's prompt
   * @returns {Object} - Elements of the new exchange
   */
  createExchange(promptText) {
    const history = document.getElementById("history");
    const exchange = document.createElement("div");
    exchange.className = "exchange";

    const promptEl = document.createElement("div");
    promptEl.className = "prompt";
    promptEl.textContent = "🧠 " + promptText;

    const responseEl = document.createElement("div");
    responseEl.className = "response";
    responseEl.innerHTML =
      '<span id="streamed-text"></span><span class="cursor">█</span>';

    exchange.appendChild(promptEl);
    exchange.appendChild(responseEl);
    history.prepend(exchange);

    return { exchange, responseEl };
  }

  /**
   * Handle completion of the API request
   * @param {string} rawMarkdown - Generated markdown content
   * @param {HTMLElement} responseEl - Response element to update
   */
  handleCompletion(rawMarkdown, responseEl) {
    try {
      // When done, parse as markdown
      const html = this.renderer.render(rawMarkdown);

      // Remove the cursor
      const cursor = responseEl.querySelector(".cursor");
      if (cursor) cursor.remove();

      // Get the streamed text element
      const streamed = responseEl.querySelector("#streamed-text");

      // Set the HTML
      streamed.innerHTML = html;

      // Apply syntax highlighting to code blocks
      this.renderer.highlightCodeBlocks(streamed);
    } catch (err) {
      console.error("Final markdown parse failed:", err);
      responseEl.textContent = rawMarkdown; // fallback to plain text
    }
  }

  /**
   * Send a prompt to the API and handle the response
   */
  async ask() {
    console.log("[ask begin]");

    const promptText = document.getElementById("prompt").value.trim();
    if (!promptText) return;

    const serverUrl = document.getElementById("server-url").value.trim();
    if (!serverUrl) {
      alert("Please enter a valid server URL");
      return;
    }

    // Update client server URL
    this.client.setServerUrl(serverUrl);

    // Create new exchange elements
    const { responseEl } = this.createExchange(promptText);

    // Clear the input field
    document.getElementById("prompt").value = "";

    // Create abort controller
    this.controller = new AbortController();
    const signal = this.controller.signal;

    try {

      console.log("[ask - try]");
      console.log(JSON.stringify(this.client, null, 2));
      
      // Get streamed text element
      const streamed = responseEl.querySelector("#streamed-text");
      const preset = document.getElementById("preset-select").value;
      const systemMessage = this.presets[preset] || this.presets.neutral;
      
      const messages = [
        { role: "system", content: systemMessage },
        { role: "user", content: promptText }
      ];
      
      // Make the API request
      const result = await this.client.generateCompletion({
        messages,
        model: this.client.defaultModel,
        signal,
      });

      // Show raw markdown during processing
      streamed.textContent = result.response;

      // Handle completion
      this.handleCompletion(result.response, responseEl);
    } catch (err) {
      if (err.name === "AbortError") {
        responseEl.innerHTML = "✋ Request aborted";
      } else {
        responseEl.innerHTML = `❌ Failed: ${err.message}`;
        console.error("Error:", err);
      }
    }
  }

  /**
   * Abort the current request
   */
  abort() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}

// Initialize the application
const app = new OllamaChat();

export default app;
