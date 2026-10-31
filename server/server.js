import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { initSuperAdmin } from './scripts/initAdmin.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Ensure default Super Administrator exists
    await initSuperAdmin();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Apex CMS Backend Server listening on port ${PORT}`);
      console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error(`[Server Fatal Error]: ${err.message}`);
    process.exit(1);
  }
};

startServer();
