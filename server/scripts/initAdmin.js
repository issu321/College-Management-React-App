import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';

export const initSuperAdmin = async () => {
  const username = (process.env.SUPERADMIN_USERNAME || 'usman').toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || 'Wsxcfty@9009';
  const email = (process.env.SUPERADMIN_EMAIL || 'usman@apexcms.edu').toLowerCase();
  const name = process.env.SUPERADMIN_NAME || 'Usman Root Administrator';

  try {
    let admin = await User.findOne({
      $or: [{ username }, { email }, { role: 'superadmin' }]
    }).select('+password');

    if (!admin) {
      console.log(`[SuperAdmin Init] Creating default Super Administrator: ${username}...`);
      admin = await User.create({
        role: 'superadmin',
        username,
        email,
        password, // will be automatically hashed by UserSchema pre-save hook
        name,
        badge: 'Root Super Administrator',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      });
      console.log(`[SuperAdmin Init] Default Super Administrator '${username}' created successfully.`);
    } else {
      // Ensure role and active status
      admin.role = 'superadmin';
      admin.status = 'active';
      admin.username = username;
      if (!admin.badge) admin.badge = 'Root Super Administrator';
      await admin.save();
      console.log(`[SuperAdmin Init] Super Administrator '${username}' verified in MongoDB.`);
    }
    return admin;
  } catch (err) {
    console.error(`[SuperAdmin Init Error]: ${err.message}`);
    throw err;
  }
};

// If run directly from CLI
if (process.argv[1]?.includes('initAdmin.js')) {
  (async () => {
    try {
      await connectDB();
      await initSuperAdmin();
      console.log('✅ Super Admin initialization complete.');
      process.exit(0);
    } catch (e) {
      console.error('❌ Failed to initialize Super Admin:', e);
      process.exit(1);
    }
  })();
}

