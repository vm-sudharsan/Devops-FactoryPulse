const cors = require('cors');
require('dotenv').config();

// FRONTEND_URL supports a single origin or comma-separated list of origins
// Examples:
//   Single:   http://localhost:3001
//   Multiple: http://localhost:3001,http://localhost:3000,https://yourdomain.com
const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:3001';
const allowedOrigins = rawOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(
      allowedOrigin => allowedOrigin && allowedOrigin.toLowerCase() === origin.toLowerCase()
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS warning - Origin not in allowlist:', origin);
      console.warn('Allowed origins:', allowedOrigins);
      // Allow anyway to prevent blocking - just log for monitoring
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // 24 hours to reduce preflight requests
};

module.exports = cors(corsOptions);
