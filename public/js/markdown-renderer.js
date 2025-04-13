/**
 * Markdown Renderer
 * Handles rendering markdown content with syntax highlighting
 */
class MarkdownRenderer {
    constructor() {
      this.configureMarked();
    }
    
    /**
     * Configure marked.js with proper security and syntax highlighting
     */
    configureMarked() {
      marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function(code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
              console.error('Highlight error:', err);
            }
          }
          return hljs.highlightAuto(code).value;
        },
        pedantic: false,
        gfm: true,
        breaks: true,
        sanitize: false,
        smartypants: false,
        xhtml: false
      });
    }
    
    /**
     * Render markdown content to HTML
     * @param {string} markdown - Markdown content
     * @returns {string} - HTML content
     */
    render(markdown) {
      return marked.parse(markdown);
    }
    
    /**
     * Apply syntax highlighting to code blocks in the element
     * @param {HTMLElement} element - Element containing code blocks
     */
    highlightCodeBlocks(element) {
      element.querySelectorAll("pre code").forEach((block) => {
        try {
          hljs.highlightElement(block);
        } catch (err) {
          console.error("Highlighting error:", err);
        }
      });
    }
  }
  
  export default MarkdownRenderer;
