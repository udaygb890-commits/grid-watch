const express = require('express');
const db = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

const router = express.Router();

// Control Room endpoints accessible by control_room and admin
router.use(authenticateToken);
router.use(requireRole('control_room', 'admin'));

// GET /api/control-room/telemetry
router.get('/telemetry', (req, res) => {
  const transformers = db.prepare(`
    SELECT t.*, s.name as substation_name, s.code as substation_code, s.region as substation_region
    FROM transformers t
    JOIN substations s ON t.substation_id = s.id
    ORDER BY t.anomaly_detected DESC, t.health_score ASC
  `).all();

  const substations = db.prepare(`
    SELECT s.*, 
           COUNT(t.id) as total_transformers,
           SUM(CASE WHEN t.anomaly_detected = 1 THEN 1 ELSE 0 END) as active_anomalies
    FROM substations s
    LEFT JOIN transformers t ON s.id = t.substation_id
    GROUP BY s.id
  `).all();

  const activeWorkOrders = db.prepare(`
    SELECT wo.*, u.full_name as assigned_engineer_name, s.name as substation_name, t.name as transformer_name
    FROM work_orders wo
    JOIN substations s ON wo.substation_id = s.id
    JOIN transformers t ON wo.transformer_id = t.id
    LEFT JOIN users u ON wo.assigned_to_user_id = u.id
    WHERE wo.status != 'RESOLVED'
    ORDER BY wo.created_at DESC
  `).all();

  const fieldEngineers = db.prepare(`
    SELECT id, full_name, username, badge_id, substation_id
    FROM users
    WHERE role = 'substation_team' AND job_function = 'field_engineer' AND is_active = 1
  `).all();

  // Aggregate metrics
  const totalMvaCapacity = transformers.reduce((sum, tx) => sum + tx.mva_rating, 0);
  const avgHealth = transformers.length ? Math.round(transformers.reduce((sum, tx) => sum + tx.health_score, 0) / transformers.length) : 100;
  const criticalCount = transformers.filter(tx => tx.dga_status === 'CRITICAL' || tx.anomaly_detected === 1).length;

  res.json({
    metrics: {
      gridFrequencyHz: 60.02,
      totalMvaCapacity,
      totalTransformers: transformers.length,
      averageFleetHealthScore: avgHealth,
      criticalAnomalies: criticalCount,
      activeSubstations: substations.length
    },
    transformers,
    substations,
    activeWorkOrders,
    fieldEngineers
  });
});

// POST /api/control-room/dispatch
router.post('/dispatch', (req, res) => {
  const { transformerId, engineerId, priority, title, instructions } = req.body;

  if (!transformerId || !engineerId || !title) {
    return res.status(400).json({ error: 'ValidationError', message: 'Transformer, Engineer, and Title are required.' });
  }

  const tx = db.prepare('SELECT * FROM transformers WHERE id = ?').get(transformerId);
  const eng = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'substation_team' AND job_function = 'field_engineer'").get(engineerId);

  if (!tx || !eng) {
    return res.status(404).json({ error: 'NotFound', message: 'Transformer or Field Engineer not found.' });
  }

  const ticketNumber = `WO-${new Date().getFullYear()}-TX${tx.id}-${Date.now().toString().slice(-4)}`;

  const defaultChecklist = JSON.stringify([
    { id: 'step_1', text: 'On-site arrival and substation clearance authorization', completed: false },
    { id: 'step_2', text: 'Visual inspection of transformer body and radiator fins', completed: false },
    { id: 'step_3', text: 'Thermal imaging infrared scan on bushings and terminations', completed: false },
    { id: 'step_4', text: 'Oil sample collection for portable DGA hydrogen verification', completed: false },
    { id: 'step_5', text: 'Report findings to Central Control Room and update ticket', completed: false }
  ]);

  const result = db.prepare(`
    INSERT INTO work_orders (
      ticket_number, transformer_id, assigned_to_user_id, substation_id,
      title, priority, status, ai_recommendation, diagnostic_checklist, field_notes
    ) VALUES (?, ?, ?, ?, ?, ?, 'ASSIGNED', ?, ?, ?)
  `).run(
    ticketNumber,
    tx.id,
    eng.id,
    tx.substation_id,
    title.trim(),
    priority || 'HIGH',
    instructions || 'Dispatched by Control Room operator for transformer anomaly investigation.',
    defaultChecklist,
    `Dispatched by ${req.user.full_name} (${req.user.username}) at ${new Date().toISOString()}`
  );

  logAuditEvent({
    userId: req.user.id,
    username: req.user.username,
    action: 'DISPATCH_WORK_ORDER',
    severity: 'INFO',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Control Room dispatched Field Engineer '${eng.username}' for ticket ${ticketNumber} on ${tx.name}.`
  });

  res.status(201).json({
    success: true,
    message: `Field Engineer ${eng.full_name} dispatched under Ticket ${ticketNumber}.`,
    ticketId: result.lastInsertRowid,
    ticketNumber
  });
});

module.exports = router;
