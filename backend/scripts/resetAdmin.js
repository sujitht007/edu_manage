const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const resetAdminUser = async () => {
  try {
    // Find existing admin user
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      console.log('No admin user found. Please run npm run create-admin first.');
      process.exit(1);
    }

    console.log('Found existing admin user:');
    console.log(`Current Email: ${existingAdmin.email}`);
    console.log(`Current Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
    console.log(`Current Active Status: ${existingAdmin.isActive}`);

    // Get new admin details from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

    if (!adminEmail || !adminPassword) {
      console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in your environment variables');
      process.exit(1);
    }

    // Update admin user with new details
    existingAdmin.email = adminEmail;
    existingAdmin.firstName = adminFirstName;
    existingAdmin.lastName = adminLastName;
    existingAdmin.password = adminPassword; // This will be hashed by the pre-save middleware
    existingAdmin.isActive = true;
    existingAdmin.isApproved = true;

    await existingAdmin.save();

    console.log('\nAdmin user updated successfully!');
    console.log(`New Email: ${adminEmail}`);
    console.log(`New Name: ${adminFirstName} ${adminLastName}`);
    console.log(`Active: ${existingAdmin.isActive}`);
    console.log(`Approved: ${existingAdmin.isApproved}`);
    console.log('\nAdmin can now log in with the credentials from .env file');

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin user:', error);
    process.exit(1);
  }
};

resetAdminUser();
