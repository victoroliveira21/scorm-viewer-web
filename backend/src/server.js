import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import uploadRoutes from './routes/upload.js';
import sessionRoutes from './routes/session.js';

// Utils
import { startSessionCleanup } from './utils/sessionManager.js';

// Load environment variables
dotenv.config();

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
if (process.env.ENABLE_HELMET === 'true') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Necessary for SCORM
        scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers (onclick, etc)
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "data:", "blob:"],
        frameSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false, // Required for iframe embedding
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
}

// CORS - Cross-Origin Resource Sharing
if (process.env.ENABLE_CORS === 'true') {
  // Support multiple origins (comma-separated in env var)
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };
  app.use(cors(corsOptions));
}

// Rate Limiting - Prevent abuse
if (process.env.ENABLE_RATE_LIMIT === 'true') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.RATE_LIMIT_MAX) || 10, // 10 requests per window
    message: {
      error: 'Too many uploads from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/upload', limiter);
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/sessions', sessionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// ============================================
// SERVER STARTUP
// ============================================

// Create temp directories if they don't exist
const tempDir = process.env.UPLOAD_TEMP_DIR || './temp';
const uploadsDir = path.join(tempDir, 'uploads');
const sessionsDir = path.join(tempDir, 'sessions');

[uploadsDir, sessionsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// Start session cleanup service
startSessionCleanup();

// Start server
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('  📚 SCORM Viewer Backend API');
  console.log('========================================\n');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ CORS enabled: ${process.env.ENABLE_CORS}`);
  console.log(`✓ Rate limiting: ${process.env.ENABLE_RATE_LIMIT}`);
  console.log(`✓ Session timeout: ${(parseInt(process.env.SESSION_TIMEOUT) / 1000 / 60).toFixed(0)} minutes`);
  console.log('\n📋 Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  POST /api/upload');
  console.log('  GET  /api/sessions/:sessionId/manifest');
  console.log('  GET  /api/sessions/:sessionId/viewer');
  console.log('  GET  /api/sessions/:sessionId/files/*');
  console.log('  DELETE /api/sessions/:sessionId');
  console.log('\n========================================\n');
});

export default app;
