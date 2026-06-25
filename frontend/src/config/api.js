/**
 * API Configuration
 * Centralized API URL management for all environments.
 *
 * VITE_API_URL must be set in the .env file before running `npm run build`.
 * It is baked into the JS bundle at build time by Vite.
 *
 * Local development:   http://localhost:8070
 * Docker Compose:      http://localhost:8070  (host-mapped backend port)
 * Kubernetes / AWS:    https://api.yourdomain.com
 *
 * Fallback to localhost:8070 ensures local development works
 * even without a .env file. Has no effect in Docker or production
 * because VITE_API_URL is always set before the build runs.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8070';

export default API_URL;
