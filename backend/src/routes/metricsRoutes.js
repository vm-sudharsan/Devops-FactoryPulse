const express = require('express');
const router = express.Router();
const { register } = require('../metrics/metrics');

/**
 * GET /metrics
 *
 * Prometheus scrape endpoint.
 * Returns all collected metrics in the Prometheus text exposition format.
 *
 * - No authentication required (Prometheus scrapes internally)
 * - Not subject to rate limiting (excluded in server.js)
 * - Does not go through session middleware
 */
router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

module.exports = router;
