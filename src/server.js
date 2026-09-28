const env = require('./config/env');
const app = require('./app');

// Start the Express server
const server = app.listen(env.PORT, () => {
  console.log(`🚀 India DITS Backend is running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
  console.log(`📡 Ready to accept requests on /api routes`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${env.PORT} is already occupied by another process.`);
    console.error(`👉 Run in PowerShell to free port ${env.PORT}:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${env.PORT}).OwningProcess -Force`);
  } else {
    console.error('❌ Server error:', err);
  }
});

// Handle uncaught exceptions gracefully without silent crashing
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
