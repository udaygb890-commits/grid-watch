const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { authenticateToken, requireRole, sanitizeUser } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

const router = express.Router();

// All routes in this router require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// GET /api/admin/overview
router.get('/overview', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const activeCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get().count;
  const lockedCount = db.prepare(`
    SELECT COUNT(*) as count FROM users 
    WHERE locked_until IS NOT NULL AND locked_until > datetime('now')
  `).get().count;
  const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
  const subCount = db.prepare('SELECT COUNT(*) as count FROM substations').get().count;
  const txCount = db.prepare('SELECT COUNT(*) as count FROM transformers').get().count;
  const anomaliesCount = db.prepare('SELECT COUNT(*) as count FROM transformers WHERE anomaly_detected = 1').get().count;

  res.json({
    metrics: {
      totalUsers: userCount,
      activeUsers: activeCount,
      lockedUsers: lockedCount,
      totalAuditEvents: auditCount,
      substations: subCount,
      transformers: txCount,
      activeAnomalies: anomaliesCount
    }
  });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.email, u.full_name, u.role, u.job_function,
           u.substation_id, u.badge_id, u.phone, u.is_active, u.failed_attempts,
           u.locked_until, u.last_login_at, u.created_at,
           s.name as substation_name, s.code as substation_code
    FROM users u
    LEFT JOIN substations s ON u.substation_id = s.id
    ORDER BY u.created_at DESC
  `).all();

  res.json({ users });
});

// POST /api/admin/users
router.post('/users', async (req, res) => {
  const {
    username,
    email,
    password,
    fullName,
    role,
    jobFunction,
    substationId,
    badgeId,
    phone
  } = req.body;

  if (!username || !email || !password || !fullName || !role) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Username, email, password, full name, and role are required.'
    });
  }

  const validRoles = ['admin', 'control_room', 'substation_team'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      error: 'ValidationError',
      message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
    });
  }

  // If role is substation_team, jobFunction must be station_operator or field_engineer
  let normalizedJobFunction = null;
  if (role === 'substation_team') {
    if (!['station_operator', 'field_engineer'].includes(jobFunction)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: "Substation Team accounts require an internal job function: 'station_operator' or 'field_engineer'."
      });
    }
    normalizedJobFunction = jobFunction;
  }

  // Check unique username / email
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username.trim(), email.trim());
  if (existing) {
    return res.status(409).json({
      error: 'ConflictError',
      message: 'A user with that username or email address already exists.'
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare(`
      INSERT INTO users (
        username, email, password_hash, full_name, role, job_function,
        substation_id, badge_id, phone, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      username.trim(),
      email.trim(),
      passwordHash,
      fullName.trim(),
      role,
      normalizedJobFunction,
      substationId ? parseInt(substationId, 10) : null,
      badgeId ? badgeId.trim() : null,
      phone ? phone.trim() : null
    );

    logAuditEvent({
      userId: req.user.id,
      username: req.user.username,
      action: 'USER_CREATED',
      severity: 'INFO',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Admin created user '${username.trim()}' with role '${role}'${normalizedJobFunction ? ' (' + normalizedJobFunction + ')' : ''}.`
    });

    const newUser = db.prepare(`
      SELECT u.id, u.username, u.email, u.full_name, u.role, u.job_function,
             u.substation_id, u.badge_id, u.phone, u.is_active, u.created_at,
             s.name as substation_name
      FROM users u
      LEFT JOIN substations s ON u.substation_id = s.id
      WHERE u.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: `User '${username.trim()}' created successfully.`,
      user: newUser
    });
  } catch (err) {
    console.error('[Admin Create User Error]:', err);
    res.status(500).json({ error: 'ServerError', message: 'Failed to create user account.' });
  }
});

// PUT /api/admin/users/:id/unlock
router.put('/users/:id/unlock', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const target = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);

  if (!target) {
    return res.status(404).json({ error: 'NotFound', message: 'User not found.' });
  }

  db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(userId);

  logAuditEvent({
    userId: req.user.id,
    username: req.user.username,
    action: 'ACCOUNT_UNLOCKED',
    severity: 'INFO',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Admin unlocked user account '${target.username}'.`
  });

  res.json({
    success: true,
    message: `Account '${target.username}' has been unlocked and failed login attempts cleared.`
  });
});

// PUT /api/admin/users/:id/toggle-status
router.put('/users/:id/toggle-status', (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (userId === req.user.id) {
    return res.status(400).json({ error: 'BadRequest', message: 'You cannot deactivate your own administrative account.' });
  }

  const target = db.prepare('SELECT id, username, is_active FROM users WHERE id = ?').get(userId);
  if (!target) {
    return res.status(404).json({ error: 'NotFound', message: 'User not found.' });
  }

  const newStatus = target.is_active === 1 ? 0 : 1;
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, userId);

  // If deactivating, revoke sessions
  if (newStatus === 0) {
    db.prepare('UPDATE sessions SET is_revoked = 1 WHERE user_id = ?').run(userId);
  }

  logAuditEvent({
    userId: req.user.id,
    username: req.user.username,
    action: newStatus === 1 ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    severity: 'INFO',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Admin ${newStatus === 1 ? 'activated' : 'deactivated'} user account '${target.username}'.`
  });

  res.json({
    success: true,
    message: `User '${target.username}' is now ${newStatus === 1 ? 'active' : 'deactivated'}.`,
    isActive: newStatus
  });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
  const logs = db.prepare(`
    SELECT * FROM audit_logs 
    ORDER BY created_at DESC 
    LIMIT ?
  `).all(limit);

  res.json({ logs });
});

// In-memory or persisted state for 7 transformers & deployment
let deploymentState = {
  engineer: 'Mr. Raghavan',
  target: 'Transformer 3 (Kadugodi)',
  reason: 'Current spike detected at #2A, opp. market, Kadugodi',
  status: 'Not done', // 'Not done' | 'Resolved'
  deployedAt: '17/10/2026 06:28 IST',
  eta: '12 minutes',
  equipment: 'Thermal IR Camera, Dissolved Gas Sniffer, Clamp Meter'
};

let anomalyState = [
  {
    id: 1,
    transformerId: 3,
    title: 'Current spike detected at Transformer 3 (Kadugodi)',
    status: 'In Progress', // 'In Progress' | 'Resolved'
    severity: 'CRITICAL',
    timestamp: '17/10/2026, 06:24 IST',
    location: '#2A, opp. market, Kadugodi - 100',
    classification: 'Current spike / thermal overload',
    details: 'Current spike 210A detected on Phase-B feeder. Field engineer dispatched.',
    rootCause: 'Sudden inductive load surge detected; winding temperature rising rapidly.',
    fieldAction: 'Now dispatch field engineer for physical on-site inspection of radiator / bus'
  },
  {
    id: 2,
    transformerId: 1,
    title: 'Rapid Oil Temp & Thermal Overload at Transformer 1',
    status: 'In Progress',
    severity: 'WARNING',
    timestamp: '17/10/2026, 04:12 IST',
    location: 'Sector 4, High-Voltage Corridor, Cascade',
    classification: 'Thermal Hotspot & DGA Evolution',
    details: 'Oil temp 78.6°C, Winding 94.2°C. Cooling fan Stage-2 forced continuous run.',
    rootCause: 'Heavy step-down transmission load combined with radiator valve restriction.',
    fieldAction: 'Inspect auxiliary radiator valve flow rate and sediment build-up.'
  },
  {
    id: 3,
    transformerId: 5,
    title: 'Voltage Drop (10.4kV) at Transformer 5 (Lakeview)',
    status: 'Resolved',
    severity: 'WARNING',
    timestamp: '16/10/2026, 21:03 IST',
    location: 'Ring Road Junction, Lakeview Sector',
    classification: 'Secondary Bus Voltage Drop',
    details: 'Secondary bus voltage drop 12%. Auto tap changer stepped +2 positions.',
    rootCause: 'Transient evening residential HVAC startup surge.',
    fieldAction: 'Tap changer step regulation verified. Voltage restored to 11.2kV nominal.'
  },
  {
    id: 4,
    transformerId: 6,
    title: 'Dissolved Hydrogen Spike at Transformer 6 (Hydro Gen)',
    status: 'Resolved',
    severity: 'ELEVATED',
    timestamp: '15/10/2026, 14:30 IST',
    location: 'Dam Intake Hydro Powerhouse, Valley Basin',
    classification: 'Dissolved Gas Evolution',
    details: 'Transient 48 ppm H2 gas detection during turbine generator sync.',
    rootCause: 'Normal generator synchronization transient; returned to baseline.',
    fieldAction: 'Continuous gas monitoring sensor calibrated and verified.'
  }
];

const sevenTransformers = [
  {
    id: 1,
    code: 'TX-01',
    name: 'Transformer 1',
    serial: 'TX-CASCADE-402',
    substation: 'Cascade North Substation 11A',
    controlUnit: 'Control unit 1',
    location: 'Sector 4, High-Voltage Corridor, Cascade',
    gps: '13°02\'11" N, 77°35\'20" E',
    voltage: '500kV / 230kV',
    mva: '350 MVA',
    status: 'WARNING',
    oilTemp: 78.6,
    windingTemp: 94.2,
    currentPeak: '185A',
    voltageRMS: '230.4 kV',
    frequency: 50.02,
    powerFactor: 0.93,
    loadPct: 89.4,
    dgaStatus: 'ELEVATED (H2: 182 ppm)',
    historyLog: 'Anomaly occurred · Field engineer deployed with three attempts',
    x: 18,
    y: 28
  },
  {
    id: 2,
    code: 'TX-02',
    name: 'Transformer 2',
    serial: 'TX-CASCADE-403',
    substation: 'Cascade North Substation 11A',
    controlUnit: 'Control unit 1',
    location: 'Auxiliary Bay 2, Cascade North',
    gps: '13°02\'19" N, 77°35\'28" E',
    voltage: '230kV / 69kV',
    mva: '150 MVA',
    status: 'NORMAL',
    oilTemp: 52.1,
    windingTemp: 58.4,
    currentPeak: '94A',
    voltageRMS: '69.1 kV',
    frequency: 50.01,
    powerFactor: 0.97,
    loadPct: 44.2,
    dgaStatus: 'NORMAL (H2: 18.2 ppm)',
    historyLog: 'Routine load balance verified · Breaker CLOSED · All SCADA bus online',
    x: 38,
    y: 18
  },
  {
    id: 3,
    code: 'TX-03',
    name: 'Transformer 3 (Kadugodi)',
    serial: 'TX-KADUGODI-03',
    substation: 'Kadugodi Substation 11A',
    controlUnit: 'Control unit 1',
    location: '#2A, opp. market, Kadugodi - 100',
    gps: '12°59\'54" N, 77°45\'42" E (72° 30\' E, 82° 60\' S)',
    voltage: '132kV / 33kV',
    mva: '40 MVA',
    status: 'CRITICAL',
    oilTemp: 89.0,
    windingTemp: 96.5,
    currentPeak: 'IB: 210A',
    voltageRMS: '33.0 kV',
    frequency: 50.02,
    powerFactor: 0.88,
    loadPct: 94.5,
    dgaStatus: 'CRITICAL (H2: 245.8 ppm)',
    historyLog: 'Anomaly 1 · Current spike 210A detected · Field engineer Mr. Raghavan deployed',
    x: 58,
    y: 35
  },
  {
    id: 4,
    code: 'TX-04',
    name: 'Transformer 4',
    serial: 'TX-METRO-101',
    substation: 'Metro Central Terminal Substation',
    controlUnit: 'Control unit 2',
    location: 'Terminal 3B, Metro Central Feeder',
    gps: '12°58\'30" N, 77°37\'12" E',
    voltage: '230kV / 69kV',
    mva: '200 MVA',
    status: 'NORMAL',
    oilTemp: 59.3,
    windingTemp: 66.0,
    currentPeak: '142A',
    voltageRMS: '69.0 kV',
    frequency: 50.00,
    powerFactor: 0.96,
    loadPct: 72.8,
    dgaStatus: 'NORMAL (H2: 34.0 ppm)',
    historyLog: 'Urban incomer feeder normal · Load equilibrium maintained across commercial sector',
    x: 82,
    y: 22
  },
  {
    id: 5,
    code: 'TX-05',
    name: 'Transformer 5 (Lakeview)',
    serial: 'TX-LAKEVIEW-05',
    substation: 'Lakeview Distribution Substation',
    controlUnit: 'Control unit 2',
    location: 'Ring Road Junction, Lakeview Sector',
    gps: '12°55\'18" N, 77°40\'44" E',
    voltage: '66kV / 11kV',
    mva: '25 MVA',
    status: 'RESOLVED',
    oilTemp: 58.0,
    windingTemp: 64.2,
    currentPeak: '88A',
    voltageRMS: '11.2 kV',
    frequency: 50.01,
    powerFactor: 0.95,
    loadPct: 68.0,
    dgaStatus: 'NORMAL (H2: 22.0 ppm)',
    historyLog: 'History: Anomaly 1 · Date: 17/10/2026 · Anomaly: Voltage drop · Resolved by: Auto tap change step +2',
    x: 85,
    y: 65
  },
  {
    id: 6,
    code: 'TX-06',
    name: 'Transformer 6 (Hydro Gen)',
    serial: 'TX-HYDRO-501',
    substation: 'Valley Hydro Generation Station',
    controlUnit: 'Control unit 2',
    location: 'Dam Intake Hydro Powerhouse, Valley Basin',
    gps: '13°15\'04" N, 77°12\'50" E',
    voltage: '500kV Step-Up',
    mva: '450 MVA',
    status: 'NORMAL',
    oilTemp: 63.4,
    windingTemp: 71.2,
    currentPeak: '310A',
    voltageRMS: '500.2 kV',
    frequency: 50.01,
    powerFactor: 0.98,
    loadPct: 81.0,
    dgaStatus: 'NORMAL (H2: 48.0 ppm)',
    historyLog: 'DGA status normal · Hydro generator synchronization lock verified · Last inspection 2026-10-15',
    x: 52,
    y: 75
  },
  {
    id: 7,
    code: 'TX-07',
    name: 'Transformer 7 (Apex Industrial)',
    serial: 'TX-APEX-07',
    substation: 'Apex Industrial Park Feeder',
    controlUnit: 'Control unit 3',
    location: 'Plot 14, Southern Industrial Corridor',
    gps: '12°51\'22" N, 77°42\'15" E',
    voltage: '115kV / 34.5kV',
    mva: '80 MVA',
    status: 'NORMAL',
    oilTemp: 56.7,
    windingTemp: 62.9,
    currentPeak: '110A',
    voltageRMS: '34.5 kV',
    frequency: 50.02,
    powerFactor: 0.95,
    loadPct: 61.5,
    dgaStatus: 'NORMAL (H2: 26.5 ppm)',
    historyLog: 'Apex feeder nominal · Breaker CLOSED · Load within safety operating margin',
    x: 20,
    y: 72
  }
];

// GET /api/admin/network-telemetry
router.get('/network-telemetry', (req, res) => {
  const cascadingLogs = [
    {
      unit: 'Control unit 1',
      substation: 'Substation 1 (Cascade & Kadugodi)',
      transformers: sevenTransformers.filter(t => t.controlUnit === 'Control unit 1')
    },
    {
      unit: 'Control unit 2',
      substation: 'Substation 2 (Metro & Lakeview)',
      transformers: sevenTransformers.filter(t => t.controlUnit === 'Control unit 2')
    },
    {
      unit: 'Control unit 3',
      substation: 'Substation 3 (Apex Park)',
      transformers: sevenTransformers.filter(t => t.controlUnit === 'Control unit 3')
    }
  ];

  res.json({
    transformers: sevenTransformers,
    anomalies: anomalyState,
    cascadingLogs,
    deployment: deploymentState
  });
});

// POST /api/admin/resolve-anomaly
router.post('/resolve-anomaly', (req, res) => {
  const { anomalyId, newStatus } = req.body;
  const statusToSet = newStatus || 'Resolved';

  const anomaly = anomalyState.find(a => a.id === parseInt(anomalyId, 10));
  if (anomaly) {
    anomaly.status = statusToSet;
    if (anomaly.transformerId === 3) {
      deploymentState.status = statusToSet === 'Resolved' ? 'Resolved' : 'Not done';
      const tx3 = sevenTransformers.find(t => t.id === 3);
      if (tx3) {
        tx3.status = statusToSet === 'Resolved' ? 'RESOLVED' : 'CRITICAL';
      }
    }
  }

  logAuditEvent({
    userId: req.user.id,
    username: req.user.username,
    action: 'ANOMALY_STATUS_UPDATE',
    severity: 'INFO',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Admin marked Anomaly #${anomalyId} status as '${statusToSet}'.`
  });

  res.json({
    success: true,
    anomaly,
    deployment: deploymentState
  });
});

module.exports = router;
