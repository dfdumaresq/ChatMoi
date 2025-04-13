/**
 * Ollama API Client
 * Handles communication with Ollama server
 */
class OllamaClient {
    constructor(options = {}) {
      this.serverUrl = options.serverUrl || 'http://localhost:8080';
      this.defaultModel = options.defaultModel || 'phi4:latest';
      this.useOpenAI = options.useOpenAI || false; // Add this flag
    }
    
    /**
     * Set the server URL
     * @param {string} url - The Ollama server URL
     */
    setServerUrl(url) {
      this.serverUrl = url;
    }
    
    /**
     * Get a complete response from the model
     * @param {Object} options - Request options
     * @param {string} options.prompt - The prompt text
     * @param {string} options.model - Model name (optional)
     * @param {AbortSignal} options.signal - AbortController signal (optional)
     * @returns {Promise<Object>} - The complete response
     */
    async generateCompletion({ prompt, model, signal, messages }) {
      const modelName = model || this.defaultModel;
      const url = `${this.serverUrl}/api/generate`;

      console.log("🚀 Sending to:", url);
      console.log("📦 Payload:", {
          model: modelName,
          prompt,
          stream: false,
          useOpenAI: this.useOpenAI
      });
  
      const body = {
        model: modelName,
        stream: false,
        useOpenAI: this.useOpenAI,
      };

      if (messages) {
        body.messages = messages;
      } else if (prompt) {
        body.prompt = prompt;
      }

      const response = await fetch(`${this.serverUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Server error ${response.status}: ${error}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let rawMarkdown = "";
      let isDone = false;
      
      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed) continue;
  
          try {
            const json = JSON.parse(trimmed);
            
            if (json.response) {
              rawMarkdown += json.response;
            }
            
            if (json.done) {
              isDone = true;
            }
          } catch (e) {
            console.warn("JSON parse error:", e);
          }
        }
      }
      
      return { response: rawMarkdown, done: true };
    }
  }
  
  export default OllamaClient;
