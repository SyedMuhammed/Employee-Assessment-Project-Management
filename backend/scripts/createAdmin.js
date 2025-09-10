const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'Irtaza' });
    if (existingAdmin) {
      console.log('✅ Admin user "Irtaza" already exists.');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminUser = new Admin({
      username: 'Irtaza',
      firstName: 'Irtaza',
      lastName: 'Admin',
      email: 'irtaza@admin.com',
      password: 'irtazasecure',
      role: 'admin',
      permissions: ['manage_employees', 'manage_projects', 'view_analytics', 'manage_admins'],
      isActive: true
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: irtaza@admin.com');
    console.log('🔑 Password: irtazasecure');
    console.log('👤 Username: Irtaza');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await mongoose.connection.close();
  }
}

createAdminUser();