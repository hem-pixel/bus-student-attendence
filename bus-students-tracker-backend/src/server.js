const app = require('./app');
const { testConnection } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`🚀 Bus Students Tracker Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);

  // Run database test connection
  await testConnection();
});

module.exports = server;
