const path = require('path');
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 7120,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'gridwatch_super_secure_jwt_secret_key_2026_industrial_ai_pwr',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  jwtRememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '30d',
  maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS, 10) || 5,
  lockoutTimeMinutes: parseInt(process.env.LOCKOUT_TIME_MINUTES, 10) || 15,
  dbPath: path.join(__dirname, '../data/gridwatch.db')
};
