const client = require('prom-client');

// Use the default global registry
const register = client.register;

// Collect default Node.js metrics:
// CPU usage, memory, heap, event loop lag, GC, process uptime, active handles
client.collectDefaultMetrics({ register });

// ── HTTP Request Counter ──────────────────────────────────────────────────────
// Counts every completed HTTP request, labelled by method, route, and status code
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// ── HTTP Request Duration Histogram ──────────────────────────────────────────
// Measures response time in seconds, labelled by method, route, and status code
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  // Buckets cover fast API responses through slow ML-proxied requests
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

/**
 * Express middleware that records request count and duration for every request.
 * Attached in server.js AFTER the /metrics route so the metrics endpoint
 * itself is not double-counted.
 *
 * Route normalisation strips dynamic segments (e.g. /api/machines/abc123 → /api/machines/:id)
 * to keep cardinality low and labels meaningful.
 */
function httpMetricsMiddleware(req, res, next) {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds + nanoseconds / 1e9;

    // Normalise route: prefer Express matched route, fall back to raw path
    const route = (req.route && req.route.path)
      ? `${req.baseUrl || ''}${req.route.path}`
      : req.path;

    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, duration);
  });

  next();
}

module.exports = { register, httpMetricsMiddleware };
