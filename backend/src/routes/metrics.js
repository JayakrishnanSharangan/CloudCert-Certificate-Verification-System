const express = require('express');
const client = require('prom-client');

const router = express.Router();

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'certificate-verification-system'
});

// Enable the collection of default metrics (CPU, Memory, Event Loop)
client.collectDefaultMetrics({ register });

// Custom business & operational metrics
const httpRequestsTotal = new client.Counter({
  name: 'cert_http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'cert_http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register]
});

const certificateOperations = new client.Counter({
  name: 'cert_operations_total',
  help: 'Total certificate operations performed',
  labelNames: ['operation', 'status'], // operation: 'create', 'verify', 'revoke'
  registers: [register]
});

// Middleware to track request metrics
function metricsMiddleware(req, res, next) {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });

    httpRequestDuration.observe({
      method: req.method,
      route,
      status_code: res.statusCode
    }, duration);
  });

  next();
}

// GET /metrics endpoint for Prometheus scraping
router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

module.exports = {
  router,
  metricsMiddleware,
  certificateOperations
};

