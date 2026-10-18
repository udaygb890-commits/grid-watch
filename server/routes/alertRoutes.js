const express = require('express');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

const router = express.Router();

// Seed alerts if table doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS alert_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    substation_code TEXT NOT NULL,
    substation_name TEXT NOT NULL,
    status TEXT DEFAULT 'Acknowledged',
    timestamp_label TEXT NOT NULL,
    detail TEXT NOT NULL,
    metric_type TEXT,
    metric_value TEXT,
    acknowledged_by TEXT,
    response_time_min INTEGER,
    severity TEXT DEFAULT 'WARNING',
    transformer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Populate initial history if empty
const count = db.prepare('SELECT COUNT(*) as count FROM alert_history').get();
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO alert_history (
      substation_code, substation_name, status, timestamp_label, detail,
      metric_type, metric_value, acknowledged_by, response_time_min, severity, transformer_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialAlerts = [
    [
      'SS-11',
      'SS-11 Ashok Nagar',
      'Acknowledged',
      '06:24 today',
      '06:24 today · Oil temp 89°C · Ack by R. Verma in 4 min',
      'Oil Temperature',
      '89°C',
      'R. Verma',
      4,
      'CRITICAL',
      'TX-02'
    ],
    [
      'SS-07',
      'SS-07 Khan Colony',
      'Acknowledged',
      'Yesterday 21:03',
      'Yesterday 21:03 · Current spike 210A · Ack in 2 min',
      'Feeder Current Spike',
      '210A',
      'Control Room Dispatcher',
      2,
      'WARNING',
      'TX-01'
    ],
    [
      'SS-19',
      'SS-19 Lakeview',
      'Acknowledged',
      '2 days ago',
      '2 days ago · Voltage drop · Ack in 6 min',
      'Secondary Voltage Drop',
      '10.4kV (-12%)',
      'SCADA Auto-Regulator',
      6,
      'ELEVATED',
      'TX-03'
    ],
    [
      'SS-01',
      'SS-01 Cascade North',
      'Acknowledged',
      '3 days ago',
      '3 days ago · Hydrogen gas 182 ppm · Ack by D. Reed in 5 min',
      'Dissolved Gas Spike',
      '182 ppm H2',
      'Devon Reed',
      5,
      'WARNING',
      'TX-402'
    ]
  ];

  for (const a of initialAlerts) {
    insert.run(...a);
  }
}

// GET /api/alerts/history
router.get('/history', (req, res) => {
  try {
    const alerts = db.prepare('SELECT * FROM alert_history ORDER BY id ASC').all();
    res.json({ alerts });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'DatabaseError', message: 'Failed to fetch alert history' });
  }
});

// POST /api/alerts/acknowledge
router.post('/acknowledge', (req, res) => {
  const { alertId, ackBy } = req.body;
  if (!alertId) {
    return res.status(400).json({ error: 'ValidationError', message: 'alertId is required.' });
  }

  try {
    const user = req.user ? req.user.full_name : (ackBy || 'Operator');
    db.prepare(`
      UPDATE alert_history 
      SET status = 'Acknowledged', 
          acknowledged_by = ?, 
          detail = detail || ' (Re-verified by ' || ? || ')'
      WHERE id = ?
    `).run(user, user, alertId);

    const updated = db.prepare('SELECT * FROM alert_history WHERE id = ?').get(alertId);
    res.json({ success: true, alert: updated });
  } catch (err) {
    console.error('Error acknowledging alert:', err);
    res.status(500).json({ error: 'DatabaseError', message: 'Failed to update alert' });
  }
});

// GET /api/alerts/suggestions
router.get('/suggestions', (req, res) => {
  res.json({
    suggestions: [
      {
        id: 'sug-1',
        substation: 'SS-11 Ashok Nagar',
        title: 'Thermal Management & Cooling Bank Overhaul',
        urgency: 'HIGH',
        confidence: 94.8,
        summary: 'Predictive thermal model forecasts winding hotspot exceeding 105°C during 18:00 peak demand.',
        recommendations: [
          'Force auxiliary cooling fans Stage-2 to continuous run.',
          'Dispatch field engineer to inspect radiator valve flow rate and sediment build-up.',
          'Limit transformer load to 80% if ambient temp exceeds 38°C.'
        ],
        actionLabel: 'Dispatch Field Engineer',
        secondaryAction: 'Run Diagnostics'
      },
      {
        id: 'sug-2',
        substation: 'SS-07 Khan Colony',
        title: 'Feeder Phase-B Current Re-balancing',
        urgency: 'MEDIUM',
        confidence: 89.4,
        summary: 'Periodic 210A transient load spikes observed during commercial HVAC startup cycles.',
        recommendations: [
          'Reroute 18 MVA load to adjacent Substation SS-04 tie-breaker.',
          'Review overcurrent protection relay pickup thresholds.'
        ],
        actionLabel: 'Simulate Load Transfer',
        secondaryAction: 'Acknowledge'
      },
      {
        id: 'sug-3',
        substation: 'SS-19 Lakeview',
        title: 'OLTC Tap Changer Contact Resistance Diagnostic',
        urgency: 'SCHEDULED',
        confidence: 91.2,
        summary: 'Acoustic sensor detected slight mechanical arcing delay during tap step +2 regulation.',
        recommendations: [
          'Schedule dynamic resistance measurement during next weekly maintenance window.',
          'Verify transformer oil dielectric breakdown voltage (BDV > 60kV).'
        ],
        actionLabel: 'Create Maintenance Order',
        secondaryAction: 'View DGA Log'
      }
    ]
  });
});

// GET /api/alerts/mobile-dashboard
router.get('/mobile-dashboard', (req, res) => {
  try {
    const substations = [
      {
        code: 'SS-11',
        name: 'SS-11 Ashok Nagar',
        voltage: '132kV / 33kV',
        status: 'WARNING',
        statusText: 'Elevated Temp',
        oilTemp: 89,
        windingTemp: 96,
        loadPct: 92,
        dgaStatus: 'ELEVATED (H2: 145 ppm)'
      },
      {
        code: 'SS-07',
        name: 'SS-07 Khan Colony',
        voltage: '220kV / 66kV',
        status: 'ONLINE',
        statusText: 'Normal Operation',
        oilTemp: 62,
        windingTemp: 68,
        loadPct: 74,
        dgaStatus: 'NORMAL (H2: 28 ppm)'
      },
      {
        code: 'SS-19',
        name: 'SS-19 Lakeview',
        voltage: '66kV / 11kV',
        status: 'ONLINE',
        statusText: 'Normal Operation',
        oilTemp: 58,
        windingTemp: 64,
        loadPct: 68,
        dgaStatus: 'NORMAL (H2: 22 ppm)'
      },
      {
        code: 'SS-01',
        name: 'SS-01 Cascade North',
        voltage: '500kV / 230kV',
        status: 'WARNING',
        statusText: 'Critical DGA Anomaly',
        oilTemp: 78.6,
        windingTemp: 94.2,
        loadPct: 89.4,
        dgaStatus: 'CRITICAL (H2: 245.8 ppm)'
      }
    ];

    res.json({
      fleetHealth: 88,
      activeSubstations: 4,
      totalTransformers: 12,
      gridFrequency: 50.02,
      activeAnomalies: 2,
      substations
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
