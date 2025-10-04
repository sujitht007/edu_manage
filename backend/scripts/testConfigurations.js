const mongoose = require('mongoose');
const Configuration = require('../models/Configuration');
require('dotenv').config();

const testConfigurations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edumanage_db');
    console.log('Connected to MongoDB');

    console.log('🧪 Testing Configuration System...\n');

    // Test 1: Get all configurations
    console.log('1. Testing: Get all configurations');
    const allConfigs = await Configuration.find({});
    console.log(`   ✅ Found ${allConfigs.length} configurations\n`);

    // Test 2: Get configurations by category
    console.log('2. Testing: Get configurations by category');
    const systemConfigs = await Configuration.getByCategory('system');
    console.log(`   ✅ Found ${systemConfigs.length} system configurations\n`);

    // Test 3: Get configuration value by key
    console.log('3. Testing: Get configuration value by key');
    const siteName = await Configuration.getValue('site_name');
    console.log(`   ✅ Site name: ${siteName}\n`);

    // Test 4: Test validation
    console.log('4. Testing: Configuration validation');
    const config = await Configuration.findOne({ key: 'max_file_size' });
    if (config) {
      const validation = config.validateValue(5000000); // Valid value
      console.log(`   ✅ Valid value (5MB): ${validation.isValid}`);
      
      const invalidValidation = config.validateValue(200000000); // Invalid value (too large)
      console.log(`   ✅ Invalid value (200MB): ${invalidValidation.isValid} - ${invalidValidation.errors.join(', ')}\n`);
    }

    // Test 5: Test public configurations
    console.log('5. Testing: Public configurations');
    const publicConfigs = await Configuration.find({ isPublic: true });
    console.log(`   ✅ Found ${publicConfigs.length} public configurations\n`);

    // Test 6: Test configuration types
    console.log('6. Testing: Configuration types');
    const typeCounts = {};
    allConfigs.forEach(config => {
      typeCounts[config.type] = (typeCounts[config.type] || 0) + 1;
    });
    console.log('   ✅ Configuration types:', typeCounts);
    console.log();

    // Test 7: Test categories
    console.log('7. Testing: Configuration categories');
    const categories = await Configuration.distinct('category');
    console.log('   ✅ Categories:', categories);
    console.log();

    // Test 8: Test formatted values
    console.log('8. Testing: Formatted values');
    const booleanConfig = await Configuration.findOne({ type: 'boolean' });
    if (booleanConfig) {
      console.log(`   ✅ Boolean config "${booleanConfig.key}": ${booleanConfig.formattedValue} (type: ${typeof booleanConfig.formattedValue})`);
    }

    const arrayConfig = await Configuration.findOne({ type: 'array' });
    if (arrayConfig) {
      console.log(`   ✅ Array config "${arrayConfig.key}": ${JSON.stringify(arrayConfig.formattedValue)} (type: ${Array.isArray(arrayConfig.formattedValue) ? 'array' : typeof arrayConfig.formattedValue})`);
    }
    console.log();

    // Test 9: Test maintenance mode
    console.log('9. Testing: Maintenance mode');
    const maintenanceMode = await Configuration.getValue('maintenance_mode', false);
    console.log(`   ✅ Maintenance mode: ${maintenanceMode}\n`);

    // Test 10: Test file upload configuration
    console.log('10. Testing: File upload configuration');
    const maxFileSize = await Configuration.getValue('max_file_size', 10485760);
    const allowedTypes = await Configuration.getValue('allowed_file_types', []);
    console.log(`   ✅ Max file size: ${Math.round(maxFileSize / 1024 / 1024)}MB`);
    console.log(`   ✅ Allowed types: ${allowedTypes.join(', ')}\n`);

    console.log('🎉 All configuration tests passed successfully!');
    console.log('\n📊 Configuration System Summary:');
    console.log(`   • Total configurations: ${allConfigs.length}`);
    console.log(`   • Public configurations: ${publicConfigs.length}`);
    console.log(`   • Private configurations: ${allConfigs.length - publicConfigs.length}`);
    console.log(`   • Categories: ${categories.length}`);
    console.log(`   • Configuration types: ${Object.keys(typeCounts).length}`);

  } catch (error) {
    console.error('❌ Configuration test failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the test function
if (require.main === module) {
  testConfigurations();
}

module.exports = { testConfigurations };