// Save as simple-server.js
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();
const port = 8080;

// Allow all origins
app.use(cors());

// app.options('*', (req, res) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost,http://127.0.0.1,http://mac-mini.local:8080,http://19.19.0.25'); // Replace '*' with specific origins for production
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Simple proxy without additional dependencies
app.post('/api/generate', (req, res) => {
  const options = {
    hostname: '19.19.0.25',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Set headers from the target response
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Pipe the target response to our response
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    console.error('Proxy error:', e);
    res.status(500).send('Proxy error: ' + e.message);
  });

  // Write the request body to the proxy request
  proxyReq.write(JSON.stringify(req.body));
  proxyReq.end();
});


app.get('/index.html', (req, res) => {
    res.json({ message: 'CORS working!' });
});

// Serve HTML file for all other routes
app.get((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
app.listen(port, () => {
  console.log(`*Simple Ollama proxy server running at http://localhost:${port}`);
});
