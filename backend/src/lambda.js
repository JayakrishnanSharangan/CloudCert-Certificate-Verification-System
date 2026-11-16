const serverless = require('serverless-http');
const app = require('./app');

// AWS Lambda Handler for Amazon API Gateway HTTP API (Payload format v2.0)
const handler = serverless(app, {
  request: (request, event, context) => {
    // Pass AWS request context if needed
    request.context = context;
  }
});

module.exports = {
  handler
};

