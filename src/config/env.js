require('dotenv').config();

// Define and validate essential environment variables
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'india-dits-jwt-access-secret-key-2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'india-dits-jwt-refresh-secret-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

// Check for required variables
if (!env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set in the environment variables!');
}

module.exports = env;

