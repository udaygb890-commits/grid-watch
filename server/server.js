const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const db = require('./db/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const controlRoomRoutes = require('./routes/controlRoomRoutes');
const substationRoutes = require('./routes/substationRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/control-room', controlRoomRoutes);
app.use('/api/substation', substationRoutes);
app.use('/api/alerts', alertRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'GridWatch AI Transformer Telemetry & Authentication Core',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files (prefers modern Vite build dist/ if present, falls back to public/)
const distDir = path.join(__dirname, '../dist');
const publicDir = path.join(__dirname, '../public');

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
}
app.use(express.static(publicDir));

// Fallback for SPA routes (e.g. /login, /admin, /control-room, /substation/operator, /substation/field-engineer)
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'NotFound', message: 'API endpoint does not exist.' });
  }
  // If an asset file (.js, .css, .svg, etc.) was not found, return 404 instead of index.html
  if (req.path.startsWith('/assets/') || req.path.match(/\.(js|css|map|png|jpg|jpeg|svg|ico|woff2?)$/i)) {
    return res.status(404).send('Asset not found');
  }

  const distIndex = path.join(distDir, 'index.html');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  // Return public index.html as fallback
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected internal server error occurred.'
  });
});

let server = null;
if (require.main === module) {
  server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`⚡ GridWatch Core Online: http://localhost:${config.port}`);
    console.log(`🔒 Mode: ${config.nodeEnv}`);
    console.log(`🛡️  Role-Based Authentication Engine Initialized`);
    console.log('====================================================');
  });
}

module.exports = { app, server };
