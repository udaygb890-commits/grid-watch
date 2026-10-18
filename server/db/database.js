const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

// Ensure data directory exists
const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(config.dbPath);

// Enable WAL mode and foreign keys for high performance & reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  const schema = `
    CREATE TABLE IF NOT EXISTS substations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      voltage_level TEXT NOT NULL,
      status TEXT DEFAULT 'ONLINE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'control_room', 'substation_team')),
      job_function TEXT CHECK(job_function IS NULL OR job_function IN ('station_operator', 'field_engineer')),
      substation_id INTEGER REFERENCES substations(id) ON DELETE SET NULL,
      badge_id TEXT,
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      failed_attempts INTEGER DEFAULT 0,
      locked_until DATETIME DEFAULT NULL,
      last_login_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      is_revoked INTEGER DEFAULT 0,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reset_token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      is_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      severity TEXT DEFAULT 'INFO',
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transformers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      substation_id INTEGER NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
      serial_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      mva_rating REAL NOT NULL,
      health_score INTEGER NOT NULL DEFAULT 98,
      oil_temp_c REAL NOT NULL DEFAULT 55.4,
      winding_temp_c REAL NOT NULL DEFAULT 62.1,
      load_pct REAL NOT NULL DEFAULT 68.5,
      dga_status TEXT DEFAULT 'NORMAL',
      hydrogen_ppm REAL DEFAULT 42.0,
      acetylene_ppm REAL DEFAULT 0.8,
      breaker_status TEXT DEFAULT 'CLOSED',
      anomaly_detected INTEGER DEFAULT 0,
      anomaly_type TEXT,
      anomaly_confidence REAL,
      last_inspection_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS work_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      transformer_id INTEGER NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
      assigned_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      substation_id INTEGER NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      status TEXT NOT NULL DEFAULT 'ASSIGNED',
      ai_recommendation TEXT,
      diagnostic_checklist TEXT,
      field_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_transformers_substation ON transformers(substation_id);
    CREATE INDEX IF NOT EXISTS idx_workorders_assigned ON work_orders(assigned_to_user_id);
  `;

  db.exec(schema);
}

initSchema();

module.exports = db;
