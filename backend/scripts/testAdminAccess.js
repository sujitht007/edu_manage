const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const testAdminAccess = async () => {
  try {
    console.log('🧪 Testing Admin Access to Course Creation...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edumanage_db');
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@edumanage.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('1. Admin user found:');
    console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Approved: ${adminUser.isApproved}\n`);

    // Generate JWT token
    const token = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    console.log('2. JWT token generated successfully\n');

    // Test the authorize middleware logic
    console.log('3. Testing authorize middleware logic:');
    const roles = ['instructor', 'admin'];
    const userRole = adminUser.role;
    const hasAccess = roles.includes(userRole);
    console.log(`   Required roles: ${roles.join(', ')}`);
    console.log(`   User role: ${userRole}`);
    console.log(`   Has access: ${hasAccess ? '✅ Yes' : '❌ No'}\n`);

    // Test checkApproval middleware logic
    console.log('4. Testing checkApproval middleware logic:');
    const isStudent = userRole === 'student';
    const isApproved = adminUser.isApproved;
    const needsApproval = !isStudent && !isApproved;
    console.log(`   Is student: ${isStudent}`);
    console.log(`   Is approved: ${isApproved}`);
    console.log(`   Needs approval: ${needsApproval ? '❌ Yes (will be blocked)' : '✅ No (will pass)'}\n`);

    // Test course creation data
    console.log('5. Testing course creation data structure:');
    const courseData = {
      title: 'Test Course',
      description: 'Test Description',
      courseCode: 'TEST101',
      credits: 3,
      maxStudents: 30,
      fees: 0,
      category: 'Computer Science',
      level: 'Beginner'
    };
    console.log('   Course data structure:');
    console.log(JSON.stringify(courseData, null, 2));
    console.log();

    console.log('📊 Summary:');
    console.log(`   Admin user exists: ${adminUser ? '✅' : '❌'}`);
    console.log(`   User is active: ${adminUser.isActive ? '✅' : '❌'}`);
    console.log(`   User is approved: ${adminUser.isApproved ? '✅' : '❌'}`);
    console.log(`   Role authorization: ${hasAccess ? '✅' : '❌'}`);
    console.log(`   Approval check: ${!needsApproval ? '✅' : '❌'}`);

    if (adminUser && adminUser.isActive && adminUser.isApproved && hasAccess && !needsApproval) {
      console.log('\n🎉 Admin should have full access to course creation!');
    } else {
      console.log('\n❌ Issues found that might prevent course creation.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the test
if (require.main === module) {
  testAdminAccess();
}

module.exports = { testAdminAccess };






