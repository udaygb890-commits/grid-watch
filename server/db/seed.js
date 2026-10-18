const bcrypt = require('bcryptjs');
const db = require('./database');

async function seed() {
  console.log('[Seed] Initializing GridWatch database seed...');

  // 1. Seed Substations
  const insertSubstation = db.prepare(`
    INSERT OR IGNORE INTO substations (id, code, name, region, voltage_level, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const substations = [
    [1, 'SUB-01', 'Cascade North Substation 11A', 'Northern Grid Sector', '500kV / 230kV', 'WARNING'],
    [2, 'SUB-02', 'Metro Central Terminal Substation', 'Metropolitan East', '230kV / 69kV', 'ONLINE'],
    [3, 'SUB-03', 'Valley Hydro Generation Station', 'Western Valley Basin', '500kV / 115kV', 'ONLINE'],
    [4, 'SUB-04', 'Apex Industrial Park Feeder', 'Southern Corridor', '115kV / 34.5kV', 'ONLINE']
  ];

  for (const sub of substations) {
    insertSubstation.run(...sub);
  }

  // 2. Hash passwords
  const saltRounds = 10;
  const adminHash = await bcrypt.hash('Admin@GridWatch2026!', saltRounds);
  const crHash = await bcrypt.hash('Control@GridWatch2026!', saltRounds);
  const stationOpHash = await bcrypt.hash('Station@GridWatch2026!', saltRounds);
  const fieldEngHash = await bcrypt.hash('Field@GridWatch2026!', saltRounds);
  const fieldMetroHash = await bcrypt.hash('Field@Metro2026!', saltRounds);
  const lockedHash = await bcrypt.hash('Locked@Demo2026!', saltRounds);

  // 3. Seed Users
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, username, email, password_hash, full_name, role, job_function,
      substation_id, badge_id, phone, is_active, failed_attempts, locked_until
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    // 1. Admin
    [
      1,
      'admin.gridwatch',
      'elena.rostova@gridwatch.energy',
      adminHash,
      'Elena Rostova (Chief Security Officer)',
      'admin',
      null,
      null,
      'GW-ADM-001',
      '+1 (555) 019-8234',
      1,
      0,
      null
    ],
    // 2. Control Room
    [
      2,
      'cr.operator',
      'marcus.vance@gridwatch.energy',
      crHash,
      'Marcus Vance (Grid Dispatch Commander)',
      'control_room',
      null,
      null,
      'GW-CR-104',
      '+1 (555) 019-8742',
      1,
      0,
      null
    ],
    // 3. Substation Team -> Station Operator
    [
      3,
      'operator.sub12',
      'sarah.chen@substation.gridwatch.energy',
      stationOpHash,
      'Sarah Chen (Senior Station Operator)',
      'substation_team',
      'station_operator',
      1, // Cascade North
      'GW-SO-209',
      '+1 (555) 019-4321',
      1,
      0,
      null
    ],
    // 4. Substation Team -> Field Engineer
    [
      4,
      'engineer.field',
      'devon.reed@field.gridwatch.energy',
      fieldEngHash,
      'Devon Reed (High-Voltage Diagnostic Engineer)',
      'substation_team',
      'field_engineer',
      1, // Cascade North
      'GW-FE-412',
      '+1 (555) 019-9182',
      1,
      0,
      null
    ],
    // 5. Additional Field Engineer for Metro
    [
      5,
      'engineer.metro',
      'amina.almansoor@field.gridwatch.energy',
      fieldMetroHash,
      'Amina Al-Mansoor (Transformer Fleet Specialist)',
      'substation_team',
      'field_engineer',
      2, // Metro Central
      'GW-FE-415',
      '+1 (555) 019-6612',
      1,
      0,
      null
    ],
    // 6. Primary High-Voltage Field Engineer (Mr. Raghavan)
    [
      7,
      'raghavan.field',
      'raghavan.field@gridwatch.energy',
      fieldEngHash,
      'Mr. Raghavan (High-Voltage Diagnostic Engineer)',
      'substation_team',
      'field_engineer',
      1, // Cascade / Kadugodi
      'GW-FE-412',
      '+91 (555) 019-4120',
      1,
      0,
      null
    ],
    // 7. Locked Account for Security Demo
    [
      6,
      'locked.user',
      'locked.account@gridwatch.energy',
      lockedHash,
      'Security Demo Account (Locked)',
      'control_room',
      null,
      null,
      'GW-SEC-999',
      '+1 (555) 019-0000',
      1,
      5,
      new Date(Date.now() + 15 * 60 * 1000).toISOString() // Locked for 15 minutes
    ]
  ];

  for (const user of users) {
    insertUser.run(...user);
  }

  // 4. Seed Transformers
  const insertTransformer = db.prepare(`
    INSERT OR REPLACE INTO transformers (
      id, substation_id, serial_number, name, mva_rating, health_score,
      oil_temp_c, winding_temp_c, load_pct, dga_status, hydrogen_ppm,
      acetylene_ppm, breaker_status, anomaly_detected, anomaly_type,
      anomaly_confidence, last_inspection_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transformers = [
    [
      1,
      1,
      'TX-CASCADE-402',
      'TX-402 Main Step-Down Transformer (500/230kV)',
      350.0,
      64,
      78.6,
      94.2,
      89.4,
      'CRITICAL',
      245.8,
      3.4,
      'CLOSED',
      1,
      'Abnormal DGA Gas Evolution: Rapid Hydrogen Spike & Thermal Hotspot',
      94.8,
      '2026-10-12'
    ],
    [
      2,
      1,
      'TX-CASCADE-403',
      'TX-403 Auxiliary Reserve Transformer (230/69kV)',
      150.0,
      96,
      52.1,
      58.4,
      44.2,
      'NORMAL',
      18.2,
      0.1,
      'CLOSED',
      0,
      null,
      null,
      '2026-09-28'
    ],
    [
      3,
      2,
      'TX-METRO-101',
      'TX-101 Urban Incomer Transformer (230/69kV)',
      200.0,
      91,
      59.3,
      66.0,
      72.8,
      'NORMAL',
      34.0,
      0.2,
      'CLOSED',
      0,
      null,
      null,
      '2026-10-04'
    ],
    [
      4,
      3,
      'TX-HYDRO-501',
      'TX-501 Hydro Generator Step-Up (500kV)',
      450.0,
      88,
      63.4,
      71.2,
      65.0,
      'ELEVATED',
      82.4,
      0.6,
      'CLOSED',
      1,
      'Bushing Dielectric Dissipation Warning',
      81.2,
      '2026-08-19'
    ]
  ];

  for (const tx of transformers) {
    insertTransformer.run(...tx);
  }

  // 5. Seed Work Orders
  const insertWorkOrder = db.prepare(`
    INSERT OR REPLACE INTO work_orders (
      id, ticket_number, transformer_id, assigned_to_user_id, substation_id,
      title, priority, status, ai_recommendation, diagnostic_checklist, field_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialChecklist = JSON.stringify([
    { id: 'step_1', text: 'Visual inspection of Buchholz relay and oil level indicator', completed: true, completed_at: '2026-10-17T08:15:00Z' },
    { id: 'step_2', text: 'Extract bottom oil sample for portable DGA spectrophotometer analysis', completed: true, completed_at: '2026-10-17T09:20:00Z' },
    { id: 'step_3', text: 'Infrared thermal scan of HV bushings and tap changer compartment', completed: false, completed_at: null },
    { id: 'step_4', text: 'Verify core ground current using clamp-on micro-ammeter (<100mA)', completed: false, completed_at: null },
    { id: 'step_5', text: 'Confirm acoustic partial discharge sensor calibration', completed: false, completed_at: null }
  ]);

  const workOrders = [
    [
      1,
      'WO-2026-TX402-CRIT',
      1, // TX-402
      4, // Devon Reed (Field Engineer)
      1, // Cascade North Substation 11A
      'Urgent: DGA Anomaly Verification & Thermal Hotspot Inspection on TX-402',
      'CRITICAL',
      'INSPECTING',
      'AI Neural Engine detected H2 spike rate +182 ppm/24h. Immediate field verification recommended to avert insulation breakdown.',
      initialChecklist,
      'Operator Devon Reed arrived on site at 08:10. Buchholz gas relay inspected: slight gas accumulation noted. Proceeding with infrared scan on phase B bushing.'
    ],
    [
      2,
      'WO-2026-TX501-ELEV',
      4, // TX-501
      4, // Devon Reed
      3, // Valley Hydro
      'Preventive: Bushing Power Factor Measurement & Dissolved Gas Audit',
      'HIGH',
      'ASSIGNED',
      'AI telemetry indicates dielectric loss angle drift. Schedule routine verification.',
      JSON.stringify([
        { id: 'step_1', text: 'Isolate secondary telemetry lines', completed: false },
        { id: 'step_2', text: 'Perform C1 and C2 capacitance / power factor test', completed: false },
        { id: 'step_3', text: 'Log ambient humidity and oil temperature', completed: false }
      ]),
      'Assigned for afternoon inspection after TX-402 resolution.'
    ]
  ];

  for (const wo of workOrders) {
    insertWorkOrder.run(...wo);
  }

  // 6. Seed initial audit log entries
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (user_id, username, action, severity, ip_address, user_agent, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run(
    1,
    'admin.gridwatch',
    'SYSTEM_INITIALIZED',
    'INFO',
    '127.0.0.1',
    'System Bootstrap Seed',
    'GridWatch Predictive Maintenance Core & Role-Based Security successfully initialized'
  );

  console.log('[Seed] Database successfully seeded with demo accounts, substations, transformers, and work orders.');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}

module.exports = seed;
