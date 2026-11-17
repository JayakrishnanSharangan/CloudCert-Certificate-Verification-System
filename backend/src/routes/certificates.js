const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  createCertificate,
  getCertificateById,
  updateCertificateStatus,
  listCertificates,
  getAuditLogs
} = require('../services/certificateStore');
const { generateQRCode } = require('../services/qrService');
const { certificateOperations } = require('./metrics');

const router = express.Router();

// Helper to determine the frontend base URL for QR code redirection
function getFrontendBaseUrl(req) {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  // If request hits the backend port 5000, redirect QR scans to the frontend UI on port 3000
  const frontendHost = host.replace(':5000', ':3000');
  return `${protocol}://${frontendHost}`;
}

// Helper to generate a clean certificate identifier
function generateCertificateId() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${randomSuffix}`;
}

// 1. Public Verification Endpoint (GET /api/certificates/verify/:id)
router.get('/verify/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'Certificate ID is required' });
  }

  try {
    const cert = await getCertificateById(id.trim());

    if (!cert) {
      certificateOperations.inc({ operation: 'verify', status: 'not_found' });
      return res.status(404).json({
        verified: false,
        message: 'Certificate not found. This identifier does not match any valid record.',
        certificate_id: id
      });
    }

    // Auto-generate QR code if it was missing or empty in the record
    if (!cert.qr_code_url) {
      const baseUrl = getFrontendBaseUrl(req);
      cert.qr_code_url = await generateQRCode(cert.certificate_id, baseUrl);
    }

    const isValid = cert.status === 'VALID';
    certificateOperations.inc({ 
      operation: 'verify', 
      status: isValid ? 'valid' : 'revoked' 
    });

    return res.status(200).json({
      verified: isValid,
      certificate: cert,
      message: isValid 
        ? 'Certificate is authentic and currently VALID.' 
        : 'Certificate was found but has been officially REVOKED.'
    });
  } catch (err) {
    console.error('Error during certificate verification:', err);
    return res.status(500).json({ error: 'Internal server error verifying certificate' });
  }
});

// 2. List All Certificates (GET /api/certificates)
router.get('/', async (req, res) => {
  try {
    const certs = await listCertificates();
    const baseUrl = getFrontendBaseUrl(req);
    
    // Ensure all returned certs have valid QR codes
    for (const cert of certs) {
      if (!cert.qr_code_url) {
        cert.qr_code_url = await generateQRCode(cert.certificate_id, baseUrl);
      }
    }

    return res.status(200).json(certs);
  } catch (err) {
    console.error('Error listing certificates:', err);
    return res.status(500).json({ error: 'Failed to retrieve certificates' });
  }
});

// 3. Issue / Create Certificate (POST /api/certificates)
router.post('/', async (req, res) => {
  const { recipient_name, course_name, issuer_name, issue_date, certificate_url } = req.body;

  // Validation
  if (!recipient_name || !course_name || !issuer_name) {
    return res.status(400).json({
      error: 'Missing required fields: recipient_name, course_name, and issuer_name are required.'
    });
  }

  const certificate_id = req.body.certificate_id || generateCertificateId();
  const baseUrl = getFrontendBaseUrl(req);

  try {
    // Generate QR code for instant scan-to-verify
    const qr_code_url = await generateQRCode(certificate_id, baseUrl);
    const now = new Date().toISOString();

    const record = {
      certificate_id,
      recipient_name: recipient_name.trim(),
      course_name: course_name.trim(),
      issuer_name: issuer_name.trim(),
      issue_date: issue_date || new Date().toISOString().split('T')[0],
      status: 'VALID',
      qr_code_url,
      certificate_url: certificate_url || '',
      created_at: now,
      updated_at: now
    };

    await createCertificate(record);
    certificateOperations.inc({ operation: 'create', status: 'success' });

    return res.status(201).json({
      message: 'Certificate successfully created and recorded.',
      certificate: record
    });
  } catch (err) {
    console.error('Error creating certificate:', err);
    certificateOperations.inc({ operation: 'create', status: 'error' });
    return res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// 4. Revoke or Update Status (PUT /api/certificates/:id/status)
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, actor } = req.body;

  if (!status || !['VALID', 'REVOKED'].includes(status.toUpperCase())) {
    return res.status(400).json({ error: 'Valid status is required: VALID or REVOKED' });
  }

  try {
    const updated = await updateCertificateStatus(id, status.toUpperCase(), actor || 'admin');
    if (!updated) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (!updated.qr_code_url) {
      const baseUrl = getFrontendBaseUrl(req);
      updated.qr_code_url = await generateQRCode(updated.certificate_id, baseUrl);
    }

    certificateOperations.inc({ 
      operation: status.toUpperCase() === 'REVOKED' ? 'revoke' : 'reinstate', 
      status: 'success' 
    });

    return res.status(200).json({
      message: `Certificate status updated to ${status.toUpperCase()}`,
      certificate: updated
    });
  } catch (err) {
    console.error('Error updating certificate status:', err);
    return res.status(500).json({ error: 'Failed to update certificate status' });
  }
});

// 5. Audit Log History (GET /api/certificates/audit-logs)
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await getAuditLogs();
    return res.status(200).json(logs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
