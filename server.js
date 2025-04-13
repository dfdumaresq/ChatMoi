// Save as simple-server.js
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

console.log("✅ env OPENAI_API_KEY_DFD:", process.env.OPENAI_API_KEY_DFD);

const app = express();
const port = 8080;

// Allow all origins
app.use(cors());

const allowedOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://mac-mini.local:8080',
    'http://19.19.0.25:8080'
];    

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204); // Respond to preflight
    }
  
    next();
  });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_DFD,
});

console.log("[apiKey]: ", openai.apiKey);

app.post('/api/generate', async (req, res) => {
    console.log("✅ /api/generate route hit");

    const { useOpenAI, messages, ...ollamaBody } = req.body;

    // Debug statements
    console.log('Request body:', JSON.stringify(req.body));
    console.log('useOpenAI value:', useOpenAI);
    console.log('useOpenAI type:', typeof useOpenAI);
    console.log('Condition evaluation:', useOpenAI === true);

    // Set proper headers for streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        console.log("Full raw body:", req.body);
        const { useOpenAI, messages, ...ollamaBody } = req.body;
        console.log("useOpenAI:", useOpenAI);
    
    if (useOpenAI) {
      // Use OpenAI instead of proxying to Ollama
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messages || [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say something smart.' },
          ],
        });
        return res.json({ response: response.choices[0].message.content });
      } catch (err) {
        console.error('OpenAI error:', err);
        return res.status(500).json({ error: err.message });
      }
    } else {
        // Ollama proxy
        // 🧠 Convert messages to prompt if needed
        if (!req.body.prompt && Array.isArray(req.body.messages)) {
            const userMessage = req.body.messages.find(m => m.role === "user")?.content || "";
            const systemMessage = req.body.messages.find(m => m.role === "system")?.content;

            req.body.prompt = systemMessage
            ? `${systemMessage}\n\n${userMessage}`
            : userMessage;

            delete req.body.messages; // remove unsupported field
        }

        // ✨ Optional: prepend a default if prompt exists
        if (req.body.prompt && !useOpenAI) {
            req.body.prompt = `You are a curious and well-informed assistant.\n\n${req.body.prompt}`;
        }
        
        const http = require('http');
        const options = {
            hostname: '19.19.0.25',
            port: 11434,
            path: '/api/generate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const proxyReq = http.request(options, (proxyRes) => {
            // Set headers from the target response
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (e) => {
            console.error('Proxy error:', e);
            res.status(500).send('Proxy error: ' + e.message);
        });

        // Write the request body to the proxy request
        proxyReq.write(JSON.stringify(req.body));
        proxyReq.end();
    }

    } catch (e) {
    console.error("❌ Route error:", e);
    res.status(500).send("error inside /api/generate");
  }    
});

app.get('/index.html', (req, res) => {
    res.json({ message: 'CORS working!' });
});

// Serve HTML file for all other routes
app.get((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
app.use((req, res) => {
    console.warn("⚠️ Unmatched route:", req.method, req.path);
    res.status(404).send("Route not found");
});

app.use((err, req, res, next) => {
    console.error('🔥 Global error handler:', err.stack);
    res.status(500).send('Internal server error');
  });
  
app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

// THIS MUST GO LAST:
app.get((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
