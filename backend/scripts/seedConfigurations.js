const mongoose = require('mongoose');
const Configuration = require('../models/Configuration');
const User = require('../models/User');
require('dotenv').config();

const defaultConfigurations = [
  // System Configurations
  {
    key: 'site_name',
    value: 'EduManage',
    type: 'string',
    category: 'system',
    description: 'Name of the educational management system',
    isPublic: true,
    isEditable: true,
    validation: { min: 1, max: 100 },
    defaultValue: 'EduManage',
    tags: ['branding', 'ui']
  },
  {
    key: 'site_description',
    value: 'Comprehensive Course Management System',
    type: 'string',
    category: 'system',
    description: 'Description of the system',
    isPublic: true,
    isEditable: true,
    validation: { min: 10, max: 500 },
    defaultValue: 'Comprehensive Course Management System',
    tags: ['branding', 'ui']
  },
  {
    key: 'maintenance_mode',
    value: false,
    type: 'boolean',
    category: 'system',
    description: 'Enable maintenance mode to restrict access',
    isPublic: true,
    isEditable: true,
    defaultValue: false,
    tags: ['maintenance', 'system']
  },
  {
    key: 'max_file_size',
    value: 10485760,
    type: 'number',
    category: 'file_upload',
    description: 'Maximum file upload size in bytes (10MB)',
    isPublic: true,
    isEditable: true,
    validation: { min: 1048576, max: 104857600 }, // 1MB to 100MB
    defaultValue: 10485760,
    tags: ['upload', 'files']
  },
  {
    key: 'allowed_file_types',
    value: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'],
    type: 'array',
    category: 'file_upload',
    description: 'Allowed file types for uploads',
    isPublic: true,
    isEditable: true,
    validation: { options: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov', 'zip', 'rar'] },
    defaultValue: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'],
    tags: ['upload', 'files', 'security']
  },
  {
    key: 'max_course_capacity',
    value: 50,
    type: 'number',
    category: 'course',
    description: 'Maximum number of students per course',
    isPublic: true,
    isEditable: true,
    validation: { min: 1, max: 1000 },
    defaultValue: 50,
    tags: ['course', 'enrollment']
  },
  {
    key: 'course_approval_required',
    value: true,
    type: 'boolean',
    category: 'course',
    description: 'Require admin approval for new courses',
    isPublic: true,
    isEditable: true,
    defaultValue: true,
    tags: ['course', 'approval']
  },
  {
    key: 'instructor_verification_required',
    value: true,
    type: 'boolean',
    category: 'user',
    description: 'Require document verification for instructors',
    isPublic: true,
    isEditable: true,
    defaultValue: true,
    tags: ['user', 'verification', 'instructor']
  },
  {
    key: 'student_registration_open',
    value: true,
    type: 'boolean',
    category: 'user',
    description: 'Allow new student registrations',
    isPublic: true,
    isEditable: true,
    defaultValue: true,
    tags: ['user', 'registration', 'student']
  },
  {
    key: 'instructor_registration_open',
    value: true,
    type: 'boolean',
    category: 'user',
    description: 'Allow new instructor registrations',
    isPublic: true,
    isEditable: true,
    defaultValue: true,
    tags: ['user', 'registration', 'instructor']
  },
  {
    key: 'assignment_late_penalty',
    value: 10,
    type: 'number',
    category: 'assignment',
    description: 'Late submission penalty percentage',
    isPublic: true,
    isEditable: true,
    validation: { min: 0, max: 100 },
    defaultValue: 10,
    tags: ['assignment', 'grading']
  },
  {
    key: 'assignment_auto_grade',
    value: false,
    type: 'boolean',
    category: 'assignment',
    description: 'Enable automatic grading for assignments',
    isPublic: true,
    isEditable: true,
    defaultValue: false,
    tags: ['assignment', 'grading', 'automation']
  },
  {
    key: 'attendance_required_percentage',
    value: 75,
    type: 'number',
    category: 'attendance',
    description: 'Minimum attendance percentage required',
    isPublic: true,
    isEditable: true,
    validation: { min: 0, max: 100 },
    defaultValue: 75,
    tags: ['attendance', 'requirements']
  },
  {
    key: 'email_notifications_enabled',
    value: true,
    type: 'boolean',
    category: 'notification',
    description: 'Enable email notifications',
    isPublic: true,
    isEditable: true,
    defaultValue: true,
    tags: ['notification', 'email']
  },
  {
    key: 'push_notifications_enabled',
    value: true,
    type: 'boolean',
    category: 'notification',
    description: 'Enable push notifications',
    isPublic: true,
    isEditable: true,
    defaultValue: true,
    tags: ['notification', 'push']
  },
  {
    key: 'session_timeout',
    value: 3600,
    type: 'number',
    category: 'security',
    description: 'Session timeout in seconds (1 hour)',
    isPublic: false,
    isEditable: true,
    validation: { min: 300, max: 86400 }, // 5 minutes to 24 hours
    defaultValue: 3600,
    tags: ['security', 'session']
  },
  {
    key: 'password_min_length',
    value: 8,
    type: 'number',
    category: 'security',
    description: 'Minimum password length',
    isPublic: true,
    isEditable: true,
    validation: { min: 6, max: 32 },
    defaultValue: 8,
    tags: ['security', 'password']
  },
  {
    key: 'max_login_attempts',
    value: 5,
    type: 'number',
    category: 'security',
    description: 'Maximum login attempts before lockout',
    isPublic: false,
    isEditable: true,
    validation: { min: 3, max: 10 },
    defaultValue: 5,
    tags: ['security', 'login']
  },
  {
    key: 'theme_primary_color',
    value: '#3B82F6',
    type: 'string',
    category: 'ui',
    description: 'Primary theme color (hex)',
    isPublic: true,
    isEditable: true,
    validation: { pattern: '^#[0-9A-Fa-f]{6}$' },
    defaultValue: '#3B82F6',
    tags: ['ui', 'theme', 'colors']
  },
  {
    key: 'theme_secondary_color',
    value: '#10B981',
    type: 'string',
    category: 'ui',
    description: 'Secondary theme color (hex)',
    isPublic: true,
    isEditable: true,
    validation: { pattern: '^#[0-9A-Fa-f]{6}$' },
    defaultValue: '#10B981',
    tags: ['ui', 'theme', 'colors']
  },
  {
    key: 'dashboard_widgets',
    value: ['recent_activity', 'course_stats', 'assignment_deadlines', 'attendance_summary'],
    type: 'array',
    category: 'ui',
    description: 'Available dashboard widgets',
    isPublic: true,
    isEditable: true,
    validation: { 
      options: ['recent_activity', 'course_stats', 'assignment_deadlines', 'attendance_summary', 'grade_chart', 'announcements'] 
    },
    defaultValue: ['recent_activity', 'course_stats', 'assignment_deadlines', 'attendance_summary'],
    tags: ['ui', 'dashboard', 'widgets']
  },
  {
    key: 'analytics_tracking_enabled',
    value: true,
    type: 'boolean',
    category: 'analytics',
    description: 'Enable analytics tracking',
    isPublic: false,
    isEditable: true,
    defaultValue: true,
    tags: ['analytics', 'tracking']
  },
  {
    key: 'data_retention_days',
    value: 365,
    type: 'number',
    category: 'analytics',
    description: 'Data retention period in days',
    isPublic: false,
    isEditable: true,
    validation: { min: 30, max: 2555 }, // 30 days to 7 years
    defaultValue: 365,
    tags: ['analytics', 'data', 'retention']
  }
];

const seedConfigurations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edumanage_db');
    console.log('Connected to MongoDB');

    // Find admin user for lastModifiedBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('Seeding configurations...');

    for (const configData of defaultConfigurations) {
      // Check if configuration already exists
      const existingConfig = await Configuration.findOne({ key: configData.key });
      
      if (existingConfig) {
        console.log(`Configuration '${configData.key}' already exists, skipping...`);
        continue;
      }

      // Create configuration with admin as lastModifiedBy
      const configuration = new Configuration({
        ...configData,
        lastModifiedBy: adminUser._id
      });

      await configuration.save();
      console.log(`Created configuration: ${configData.key}`);
    }

    console.log('Configuration seeding completed successfully!');
    console.log(`Seeded ${defaultConfigurations.length} configurations`);

  } catch (error) {
    console.error('Error seeding configurations:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seeding function
if (require.main === module) {
  seedConfigurations();
}

module.exports = { seedConfigurations, defaultConfigurations };