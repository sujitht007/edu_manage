const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupProduction() {
  try {
    console.log('🚀 Setting up production environment...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isApproved: true,
        phone: '+1234567890'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the admin password after first login!');
    }
    
    console.log('🎉 Production setup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupProduction();
