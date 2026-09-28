const express = require('express');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 1. CORS Middleware (Must be top of pipeline to handle all preflights)
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 2. Native Cookie Parser (zero external dependencies)
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        req.cookies[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('=').trim());
      }
    });
  }
  next();
});

// 3. Middleware to parse incoming JSON requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 4. Serve uploaded files as static assets
app.use('/img', express.static(path.join(__dirname, '../img')));

// API Routes
app.use('/api', routes);

// 5. Interactive Swagger UI & OpenAPI Documentation
app.get(['/api-docs', '/docs', '/api/docs'], (req, res) => {
  const swaggerPaths = [
    path.join(__dirname, 'docs/swagger.html'),
    path.join(__dirname, '../../FrontEnd/india-dits-swagger-ui.html'),
    path.join(__dirname, '../../FrontEnd/public/swagger-ui.html')
  ];
  for (const p of swaggerPaths) {
    if (require('fs').existsSync(p)) {
      return res.sendFile(p);
    }
  }
  res.status(404).send('Swagger UI documentation not found');
});

// Base route for health check
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to India DITS Backend API',
    docs: 'http://localhost:5000/api-docs',
    status: 'online'
  });
});

// 404 Route handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

// Global error handling middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
