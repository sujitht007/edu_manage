const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const diagnoseLogin = async () => {
  try {
    console.log('🔍 Diagnosing Login Issues...\n');

    // 1. Check environment variables
    console.log('1. Checking environment variables:');
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
    console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Not set'}`);
    console.log(`   ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? '✅ Set' : '❌ Not set'}\n`);

    // 2. Connect to MongoDB
    console.log('2. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edumanage_db');
    console.log('   ✅ Connected to MongoDB\n');

    // 3. Check if admin user exists
    console.log('3. Checking admin user:');
    const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@edumanage.com' });
    
    if (!adminUser) {
      console.log('   ❌ Admin user not found');
      console.log('   💡 Run: npm run create-admin');
      return;
    }

    console.log(`   ✅ Admin user found: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Approved: ${adminUser.isApproved}\n`);

    // 4. Test password comparison
    console.log('4. Testing password comparison:');
    const testPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPassword123!';
    const isPasswordValid = await adminUser.comparePassword(testPassword);
    console.log(`   Password valid: ${isPasswordValid ? '✅ Yes' : '❌ No'}\n`);

    // 5. Check if user can be found by email
    console.log('5. Testing user lookup:');
    const foundUser = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@edumanage.com' });
    console.log(`   User found by email: ${foundUser ? '✅ Yes' : '❌ No'}\n`);

    // 6. Test JWT generation
    console.log('6. Testing JWT generation:');
    try {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });
      console.log('   ✅ JWT token generated successfully');
      console.log(`   Token length: ${token.length} characters\n`);
    } catch (error) {
      console.log(`   ❌ JWT generation failed: ${error.message}\n`);
    }

    // 7. Summary
    console.log('📊 Diagnosis Summary:');
    console.log(`   Admin user exists: ${adminUser ? '✅' : '❌'}`);
    console.log(`   User is active: ${adminUser?.isActive ? '✅' : '❌'}`);
    console.log(`   User is approved: ${adminUser?.isApproved ? '✅' : '❌'}`);
    console.log(`   Password is valid: ${isPasswordValid ? '✅' : '❌'}`);
    console.log(`   JWT secret is set: ${process.env.JWT_SECRET ? '✅' : '❌'}`);

    if (adminUser && adminUser.isActive && adminUser.isApproved && isPasswordValid && process.env.JWT_SECRET) {
      console.log('\n🎉 Everything looks good! Login should work.');
      console.log('   Try logging in with:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: ${testPassword}`);
    } else {
      console.log('\n❌ Issues found. Please fix the problems above.');
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the diagnosis
if (require.main === module) {
  diagnoseLogin();
}

module.exports = { diagnoseLogin };




