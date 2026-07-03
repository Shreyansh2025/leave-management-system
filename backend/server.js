require('dotenv').config({ quiet: true });
const app = require('./src/app');
const { initDb } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Leave Management API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
