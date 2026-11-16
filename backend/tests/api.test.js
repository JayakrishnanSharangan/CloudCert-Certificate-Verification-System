const request = require('supertest');
const app = require('../src/app');

describe('Certificate Verification DevSecOps Test Suite', () => {
  
  test('Stage 4 CI/CD: GET /health returns service status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toContain('Certificate Verification');
  });

  test('Stage 4 CI/CD: GET /metrics exports Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('cert_http_requests_total');
  });

  test('Verification: Successfully verifies an authentic certificate', async () => {
    const res = await request(app).get('/api/certificates/verify/CERT-2026-LPU-001');
    expect(res.statusCode).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(res.body.certificate.recipient_name).toBe('Jayakrishnan Sharangan');
  });

  test('Verification: Correctly flags a revoked certificate', async () => {
    const res = await request(app).get('/api/certificates/verify/CERT-2026-LPU-002');
    expect(res.statusCode).toBe(200);
    expect(res.body.verified).toBe(false);
    expect(res.body.certificate.status).toBe('REVOKED');
  });

  test('Verification: Returns 404 for a non-existent certificate ID', async () => {
    const res = await request(app).get('/api/certificates/verify/CERT-INVALID-999');
    expect(res.statusCode).toBe(404);
    expect(res.body.verified).toBe(false);
  });

  test('Issuance: Successfully creates a new certificate record', async () => {
    const newCert = {
      recipient_name: 'Test Student',
      course_name: 'DevSecOps & Cloud Engineering',
      issuer_name: 'Lovely Professional University',
      issue_date: '2026-11-16'
    };

    const res = await request(app)
      .post('/api/certificates')
      .send(newCert);

    expect(res.statusCode).toBe(201);
    expect(res.body.certificate).toHaveProperty('certificate_id');
    expect(res.body.certificate).toHaveProperty('qr_code_url');
    expect(res.body.certificate.status).toBe('VALID');
  });

  test('Input Validation: Rejects certificate creation with missing fields', async () => {
    const res = await request(app)
      .post('/api/certificates')
      .send({ recipient_name: 'Incomplete Record' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Revocation: Administrator can update certificate status to REVOKED', async () => {
    const res = await request(app)
      .put('/api/certificates/CERT-2026-LPU-001/status')
      .send({ status: 'REVOKED', actor: 'examiner_admin' });

    expect(res.statusCode).toBe(200);
    expect(res.body.certificate.status).toBe('REVOKED');

    // Verify it now fails validation
    const verifyRes = await request(app).get('/api/certificates/verify/CERT-2026-LPU-001');
    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.verified).toBe(false);
  });
});

