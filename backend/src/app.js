const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const certificatesRoutes = require('./routes/certificates');
const { router: metricsRouter, metricsMiddleware } = require('./routes/metrics');

const app = express();

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Prometheus Metrics Interceptor
app.use(metricsMiddleware);

// API Route Mounts
app.use('/health', healthRoutes);
app.use('/metrics', metricsRouter);
app.use('/api/certificates', certificatesRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Certificate Verification DevSecOps Pipeline',
    status: 'online',
    documentation: {
      health: '/health',
      metrics: '/metrics',
      api: '/api/certificates'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;

