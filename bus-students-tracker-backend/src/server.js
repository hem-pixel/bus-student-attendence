require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);

  // Run database connection test if credentials exist
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your-project-ref')) {
    await testConnection();
  }
});

module.exports = server;
