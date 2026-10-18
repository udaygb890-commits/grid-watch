const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const db = require('../db/database');
const { logAuditEvent } = require('./audit');

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function authenticateToken(req, res, next) {
  let token = null;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. No session token provided.'
    });
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error: 'InvalidToken',
        message: 'Session has expired or is invalid. Please log in again.'
      });
    }

    // Check session in database
    const tokenHash = hashToken(token);
    const session = db.prepare(`
      SELECT * FROM sessions 
      WHERE token_hash = ? AND is_revoked = 0 AND expires_at > datetime('now')
    `).get(tokenHash);

    if (!session) {
      return res.status(401).json({
        error: 'SessionRevoked',
        message: 'Session has been revoked or expired. Please log in again.'
      });
    }

    // Fetch fresh user from DB
    const user = db.prepare(`
      SELECT u.*, s.name as substation_name, s.code as substation_code, s.region as substation_region
      FROM users u
      LEFT JOIN substations s ON u.substation_id = s.id
      WHERE u.id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'UserNotFound',
        message: 'Associated user account no longer exists.'
      });
    }

    if (user.is_active !== 1) {
      return res.status(403).json({
        error: 'AccountDeactivated',
        message: 'This user account has been deactivated. Contact an administrator.'
      });
    }

    req.user = sanitizeUser(user);
    req.sessionId = session.id;
    req.tokenHash = tokenHash;
    next();
  });
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAuditEvent({
        userId: req.user.id,
        username: req.user.username,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'ALERT',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown',
        details: `Access denied to endpoint ${req.originalUrl}. Required: [${allowedRoles.join(', ')}], User Role: '${req.user.role}'`
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. This resource requires one of the following roles: [${allowedRoles.join(', ')}]. Your account role is '${req.user.role}'.`
      });
    }

    next();
  };
}

function requireJobFunction(...allowedJobFunctions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
    }

    // Admins always have supervisory access
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role !== 'substation_team' || !allowedJobFunctions.includes(req.user.job_function)) {
      logAuditEvent({
        userId: req.user.id,
        username: req.user.username,
        action: 'UNAUTHORIZED_JOB_FUNCTION_ATTEMPT',
        severity: 'ALERT',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown',
        details: `Access denied to endpoint ${req.originalUrl}. Required job function: [${allowedJobFunctions.join(', ')}], User Job Function: '${req.user.job_function}'`
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. This view requires job function: [${allowedJobFunctions.join(', ')}]. Your assigned function is '${req.user.job_function || 'None'}'.`
      });
    }

    next();
  };
}

module.exports = {
  sanitizeUser,
  hashToken,
  authenticateToken,
  requireRole,
  requireJobFunction
};
