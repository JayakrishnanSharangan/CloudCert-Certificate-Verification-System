const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.TABLE_NAME || 'CertificateVerificationTable';
const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true' || !!process.env.AWS_EXECUTION_ENV;

let docClient = null;
if (USE_DYNAMODB) {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
  docClient = DynamoDBDocumentClient.from(client);
}

// In-memory fallback store for local development / testing without AWS credentials
const memoryStore = new Map([
  [
    'CERT-2026-LPU-001',
    {
      certificate_id: 'CERT-2026-LPU-001',
      recipient_name: 'Jayakrishnan Sharangan',
      course_name: 'Advancements in Cloud and DevOps (INT378)',
      issuer_name: 'Lovely Professional University',
      issue_date: '2026-11-12',
      status: 'VALID',
      qr_code_url: '',
      certificate_url: 'https://storage.googleapis.com/demo/sample-cert-1.pdf',
      created_at: new Date('2026-11-12T10:00:00Z').toISOString(),
      updated_at: new Date('2026-11-12T10:00:00Z').toISOString()
    }
  ],
  [
    'CERT-2026-LPU-002',
    {
      certificate_id: 'CERT-2026-LPU-002',
      recipient_name: 'Aarav Patel',
      course_name: 'Cloud Infrastructure & Security',
      issuer_name: 'Lovely Professional University',
      issue_date: '2026-10-15',
      status: 'REVOKED',
      qr_code_url: '',
      certificate_url: 'https://storage.googleapis.com/demo/sample-cert-2.pdf',
      created_at: new Date('2026-10-15T10:00:00Z').toISOString(),
      updated_at: new Date('2026-10-20T14:30:00Z').toISOString()
    }
  ]
]);

const auditLogs = [
  {
    audit_id: 'AUDIT-INIT-01',
    certificate_id: 'CERT-2026-LPU-001',
    action: 'CREATED',
    performed_by: 'system_admin',
    performed_at: new Date('2026-11-12T10:00:00Z').toISOString()
  },
  {
    audit_id: 'AUDIT-INIT-02',
    certificate_id: 'CERT-2026-LPU-002',
    action: 'REVOKED',
    performed_by: 'compliance_officer',
    performed_at: new Date('2026-10-20T14:30:00Z').toISOString()
  }
];

async function createCertificate(record) {
  if (USE_DYNAMODB && docClient) {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: record
    }));
  } else {
    memoryStore.set(record.certificate_id, { ...record });
  }

  // Record audit event
  auditLogs.unshift({
    audit_id: `AUDIT-${Date.now()}`,
    certificate_id: record.certificate_id,
    action: 'CREATED',
    performed_by: 'admin',
    performed_at: new Date().toISOString()
  });

  return record;
}

async function getCertificateById(certificateId) {
  if (USE_DYNAMODB && docClient) {
    const res = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { certificate_id: certificateId }
    }));
    return res.Item || null;
  }
  return memoryStore.get(certificateId) || null;
}

async function updateCertificateStatus(certificateId, status, actor = 'admin') {
  const existing = await getCertificateById(certificateId);
  if (!existing) return null;

  const now = new Date().toISOString();

  if (USE_DYNAMODB && docClient) {
    const res = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { certificate_id: certificateId },
      UpdateExpression: 'SET #st = :status, updated_at = :updated_at',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: {
        ':status': status,
        ':updated_at': now
      },
      ReturnValues: 'ALL_NEW'
    }));
    
    auditLogs.unshift({
      audit_id: `AUDIT-${Date.now()}`,
      certificate_id: certificateId,
      action: status.toUpperCase(),
      performed_by: actor,
      performed_at: now
    });

    return res.Attributes;
  }

  existing.status = status;
  existing.updated_at = now;
  memoryStore.set(certificateId, existing);

  auditLogs.unshift({
    audit_id: `AUDIT-${Date.now()}`,
    certificate_id: certificateId,
    action: status.toUpperCase(),
    performed_by: actor,
    performed_at: now
  });

  return existing;
}

async function listCertificates() {
  if (USE_DYNAMODB && docClient) {
    const res = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      Limit: 100
    }));
    return res.Items || [];
  }
  return Array.from(memoryStore.values());
}

async function getAuditLogs() {
  return auditLogs.slice(0, 50);
}

module.exports = {
  createCertificate,
  getCertificateById,
  updateCertificateStatus,
  listCertificates,
  getAuditLogs,
  USE_DYNAMODB
};

