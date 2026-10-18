const db = require('../db/database');

function logAuditEvent({
  userId = null,
  username = null,
  action,
  severity = 'INFO',
  ipAddress = '127.0.0.1',
  userAgent = 'Unknown',
  details = ''
}) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, username, action, severity, ip_address, user_agent, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, username, action, severity, ipAddress, userAgent, details);
  } catch (err) {
    console.error('[Audit Logger Error]:', err.message);
  }
}

module.exports = {
  logAuditEvent
};
