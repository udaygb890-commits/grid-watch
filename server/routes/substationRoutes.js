const express = require('express');
const db = require('../db/database');
const { authenticateToken, requireRole, requireJobFunction } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

const router = express.Router();

router.use(authenticateToken);

// ==========================================
// 1. STATION OPERATOR ENDPOINTS
// Accessible by: substation_team (station_operator) or admin
// ==========================================
router.get('/operator/telemetry', requireRole('substation_team', 'admin'), requireJobFunction('station_operator'), (req, res) => {
  // If user has an assigned substation, use that, else default to Substation 1
  const targetSubstationId = req.user.substation_id || 1;

  const substation = db.prepare('SELECT * FROM substations WHERE id = ?').get(targetSubstationId);
  const transformers = db.prepare(`
    SELECT * FROM transformers 
    WHERE substation_id = ? 
    ORDER BY id ASC
  `).all(targetSubstationId);

  const localWorkOrders = db.prepare(`
    SELECT wo.*, u.full_name as engineer_name 
    FROM work_orders wo
    LEFT JOIN users u ON wo.assigned_to_user_id = u.id
    WHERE wo.substation_id = ?
    ORDER BY wo.created_at DESC
  `).all(targetSubstationId);

  res.json({
    substation,
    transformers,
    workOrders: localWorkOrders,
    operator: {
      fullName: req.user.full_name,
      badgeId: req.user.badge_id,
      assignedSubstation: substation ? substation.name : 'Unassigned'
    }
  });
});

// Toggle circuit breaker for local transformer
router.post('/operator/toggle-breaker', requireRole('substation_team', 'admin'), requireJobFunction('station_operator'), (req, res) => {
  const { transformerId, newStatus } = req.body;

  if (!transformerId || !['CLOSED', 'OPEN', 'TRIPPED'].includes(newStatus)) {
    return res.status(400).json({ error: 'ValidationError', message: 'Valid transformerId and newStatus required.' });
  }

  const tx = db.prepare('SELECT * FROM transformers WHERE id = ?').get(transformerId);
  if (!tx) {
    return res.status(404).json({ error: 'NotFound', message: 'Transformer not found.' });
  }

  db.prepare('UPDATE transformers SET breaker_status = ? WHERE id = ?').run(newStatus, transformerId);

  logAuditEvent({
    userId: req.user.id,
    username: req.user.username,
    action: 'BREAKER_STATE_CHANGE',
    severity: 'ALERT',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Station Operator ${req.user.username} switched breaker on ${tx.name} (${tx.serial_number}) to ${newStatus}.`
  });

  res.json({
    success: true,
    message: `Circuit breaker on ${tx.name} changed to ${newStatus}.`,
    breakerStatus: newStatus
  });
});


// ==========================================
// 2. FIELD ENGINEER ENDPOINTS
// Accessible by: substation_team (field_engineer) or admin
// ==========================================
router.get('/field-engineer/work-orders', requireRole('substation_team', 'admin'), requireJobFunction('field_engineer'), (req, res) => {
  let workOrders;

  if (req.user.role === 'admin') {
    // Admin sees all
    workOrders = db.prepare(`
      SELECT wo.*, 
             t.name as transformer_name, t.serial_number, t.oil_temp_c, t.hydrogen_ppm, t.anomaly_type,
             s.name as substation_name, s.code as substation_code, s.region as substation_region,
             u.full_name as engineer_name, u.phone as engineer_phone
      FROM work_orders wo
      JOIN transformers t ON wo.transformer_id = t.id
      JOIN substations s ON wo.substation_id = s.id
      LEFT JOIN users u ON wo.assigned_to_user_id = u.id
      ORDER BY wo.priority = 'CRITICAL' DESC, wo.created_at DESC
    `).all();
  } else {
    // Field engineer sees orders assigned to them or their assigned substation
    workOrders = db.prepare(`
      SELECT wo.*, 
             t.name as transformer_name, t.serial_number, t.oil_temp_c, t.hydrogen_ppm, t.anomaly_type,
             s.name as substation_name, s.code as substation_code, s.region as substation_region,
             u.full_name as engineer_name, u.phone as engineer_phone
      FROM work_orders wo
      JOIN transformers t ON wo.transformer_id = t.id
      JOIN substations s ON wo.substation_id = s.id
      LEFT JOIN users u ON wo.assigned_to_user_id = u.id
      WHERE wo.assigned_to_user_id = ? OR (wo.assigned_to_user_id IS NULL AND wo.substation_id = ?)
      ORDER BY wo.priority = 'CRITICAL' DESC, wo.created_at DESC
    `).all(req.user.id, req.user.substation_id || 1);
  }

  // Parse checklists
  const parsedOrders = workOrders.map(wo => {
    let checklist = [];
    try {
      checklist = JSON.parse(wo.diagnostic_checklist || '[]');
    } catch (e) {
      checklist = [];
    }
    return {
      ...wo,
      diagnostic_checklist: checklist
    };
  });

  res.json({
    workOrders: parsedOrders,
    engineer: {
      fullName: req.user.full_name,
      badgeId: req.user.badge_id,
      jobFunction: req.user.job_function,
      assignedSubstation: req.user.substation_name || 'Cascade North Substation 11A'
    }
  });
});

// Update checklist step
router.put('/field-engineer/work-orders/:id/step', requireRole('substation_team', 'admin'), requireJobFunction('field_engineer'), (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { stepId, completed } = req.body;

  const order = db.prepare('SELECT * FROM work_orders WHERE id = ?').get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'NotFound', message: 'Work order ticket not found.' });
  }

  let checklist = [];
  try {
    checklist = JSON.parse(order.diagnostic_checklist || '[]');
  } catch (e) {
    checklist = [];
  }

  const step = checklist.find(s => s.id === stepId);
  if (step) {
    step.completed = !!completed;
    step.completed_at = completed ? new Date().toISOString() : null;
  }

  db.prepare(`
    UPDATE work_orders 
    SET diagnostic_checklist = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(JSON.stringify(checklist), orderId);

  res.json({
    success: true,
    checklist
  });
});

// Update work order status and field notes
router.put('/field-engineer/work-orders/:id/status', requireRole('substation_team', 'admin'), requireJobFunction('field_engineer'), (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { status, fieldNotes } = req.body;

  const validStatuses = ['ASSIGNED', 'ACKNOWLEDGED', 'ON_SITE', 'INSPECTING', 'RESOLVED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'ValidationError', message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const order = db.prepare('SELECT * FROM work_orders WHERE id = ?').get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'NotFound', message: 'Work order ticket not found.' });
  }

  let updatedNotes = order.field_notes || '';
  if (fieldNotes && fieldNotes.trim()) {
    updatedNotes = `[${new Date().toLocaleTimeString()} ${req.user.full_name}]: ${fieldNotes.trim()}\n` + updatedNotes;
  }

  db.prepare(`
    UPDATE work_orders 
    SET status = ?, field_notes = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(status, updatedNotes, orderId);

  // If status is RESOLVED, clear the anomaly on the transformer!
  if (status === 'RESOLVED') {
    db.prepare(`
      UPDATE transformers 
      SET anomaly_detected = 0, health_score = 95, dga_status = 'NORMAL', last_inspection_date = date('now')
      WHERE id = ?
    `).run(order.transformer_id);
  }

  logAuditEvent({
    userId: req.user.id,
    username: req.user.username,
    action: 'WORK_ORDER_STATUS_UPDATED',
    severity: 'INFO',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Field Engineer ${req.user.username} updated ${order.ticket_number} status to '${status}'.`
  });

  res.json({
    success: true,
    message: `Work order status updated to ${status}.`,
    status,
    fieldNotes: updatedNotes
  });
});

module.exports = router;
