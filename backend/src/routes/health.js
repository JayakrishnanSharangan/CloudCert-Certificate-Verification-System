const express = require('express');
const { USE_DYNAMODB } = require('../services/certificateStore');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Certificate Verification API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    database: USE_DYNAMODB ? 'AWS DynamoDB' : 'In-Memory Store (Local Mode)',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;

