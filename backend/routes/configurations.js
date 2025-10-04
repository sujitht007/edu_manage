const express = require('express');
const { body, validationResult } = require('express-validator');
const Configuration = require('../models/Configuration');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/configurations
// @desc    Get all configurations (Admin only)
// @access  Private (Admin)
router.get('/', [auth, authorize('admin')], async (req, res) => {
  try {
    const { category, isPublic, search, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (search) {
      filter.$or = [
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const configurations = await Configuration.find(filter)
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ category: 1, key: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Configuration.countDocuments(filter);

    res.json({
      configurations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get configurations error:', error);
    res.status(500).json({ message: 'Server error while fetching configurations' });
  }
});

// @route   GET /api/configurations/categories
// @desc    Get configuration categories
// @access  Private (Admin)
router.get('/categories', [auth, authorize('admin')], async (req, res) => {
  try {
    const categories = await Configuration.distinct('category');
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await Configuration.countDocuments({ category });
        const publicCount = await Configuration.countDocuments({ category, isPublic: true });
        return {
          name: category,
          displayName: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
          count,
          publicCount
        };
      })
    );

    res.json(categoryStats);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// @route   GET /api/configurations/public
// @desc    Get public configurations
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isPublic: true };
    if (category) filter.category = category;

    const configurations = await Configuration.find(filter)
      .select('key value type category description')
      .sort({ category: 1, key: 1 });

    // Transform to key-value pairs for easier consumption
    const configObject = {};
    configurations.forEach(config => {
      configObject[config.key] = config.formattedValue;
    });

    res.json(configObject);
  } catch (error) {
    console.error('Get public configurations error:', error);
    res.status(500).json({ message: 'Server error while fetching public configurations' });
  }
});

// @route   GET /api/configurations/:key
// @desc    Get specific configuration by key
// @access  Private (Admin)
router.get('/:key', [auth, authorize('admin')], async (req, res) => {
  try {
    const configuration = await Configuration.findOne({ key: req.params.key })
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!configuration) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    res.json(configuration);
  } catch (error) {
    console.error('Get configuration error:', error);
    res.status(500).json({ message: 'Server error while fetching configuration' });
  }
});

// @route   POST /api/configurations
// @desc    Create new configuration
// @access  Private (Admin)
router.post('/', [
  auth,
  authorize('admin'),
  body('key').notEmpty().withMessage('Key is required'),
  body('value').notEmpty().withMessage('Value is required'),
  body('type').isIn(['string', 'number', 'boolean', 'array', 'object', 'json']).withMessage('Invalid type'),
  body('category').isIn([
    'system', 'course', 'user', 'assignment', 'attendance', 
    'notification', 'email', 'file_upload', 'security', 'ui', 'analytics'
  ]).withMessage('Invalid category'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      key,
      value,
      type,
      category,
      description,
      isPublic = false,
      isEditable = true,
      validation = {},
      defaultValue,
      tags = []
    } = req.body;

    // Check if key already exists
    const existingConfig = await Configuration.findOne({ key });
    if (existingConfig) {
      return res.status(400).json({ message: 'Configuration key already exists' });
    }

    // Create new configuration
    const configuration = new Configuration({
      key,
      value,
      type,
      category,
      description,
      isPublic,
      isEditable,
      validation,
      defaultValue,
      tags,
      lastModifiedBy: req.user._id
    });

    await configuration.save();

    res.status(201).json({
      message: 'Configuration created successfully',
      configuration
    });
  } catch (error) {
    console.error('Create configuration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while creating configuration' });
  }
});

// @route   PUT /api/configurations/:key
// @desc    Update configuration
// @access  Private (Admin)
router.put('/:key', [
  auth,
  authorize('admin'),
  body('value').optional().notEmpty().withMessage('Value cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const configuration = await Configuration.findOne({ key: req.params.key });
    if (!configuration) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    if (!configuration.isEditable) {
      return res.status(400).json({ message: 'This configuration is not editable' });
    }

    const { value, description, isPublic, tags } = req.body;

    // Update fields
    if (value !== undefined) {
      // Validate value
      const validation = configuration.validateValue(value);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: validation.errors 
        });
      }
      configuration.value = value;
    }

    if (description !== undefined) configuration.description = description;
    if (isPublic !== undefined) configuration.isPublic = isPublic;
    if (tags !== undefined) configuration.tags = tags;

    configuration.lastModifiedBy = req.user._id;
    configuration.version += 1;

    await configuration.save();

    res.json({
      message: 'Configuration updated successfully',
      configuration
    });
  } catch (error) {
    console.error('Update configuration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while updating configuration' });
  }
});

// @route   DELETE /api/configurations/:key
// @desc    Delete configuration
// @access  Private (Admin)
router.delete('/:key', [auth, authorize('admin')], async (req, res) => {
  try {
    const configuration = await Configuration.findOne({ key: req.params.key });
    if (!configuration) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    if (!configuration.isEditable) {
      return res.status(400).json({ message: 'This configuration cannot be deleted' });
    }

    await Configuration.findByIdAndDelete(configuration._id);

    res.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Delete configuration error:', error);
    res.status(500).json({ message: 'Server error while deleting configuration' });
  }
});

// @route   POST /api/configurations/bulk-update
// @desc    Bulk update configurations
// @access  Private (Admin)
router.post('/bulk-update', [
  auth,
  authorize('admin'),
  body('configurations').isArray().withMessage('Configurations must be an array'),
  body('configurations.*.key').notEmpty().withMessage('Key is required for each configuration'),
  body('configurations.*.value').notEmpty().withMessage('Value is required for each configuration')
], async (req, res) => {
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { configurations } = req.body;
    const results = [];
    const errors = [];

    for (const configUpdate of configurations) {
      try {
        const configuration = await Configuration.findOne({ key: configUpdate.key });
        if (!configuration) {
          errors.push({ key: configUpdate.key, error: 'Configuration not found' });
          continue;
        }

        if (!configuration.isEditable) {
          errors.push({ key: configUpdate.key, error: 'Configuration is not editable' });
          continue;
        }

        // Validate value
        const validation = configuration.validateValue(configUpdate.value);
        if (!validation.isValid) {
          errors.push({ 
            key: configUpdate.key, 
            error: `Validation failed: ${validation.errors.join(', ')}` 
          });
          continue;
        }

        configuration.value = configUpdate.value;
        configuration.lastModifiedBy = req.user._id;
        configuration.version += 1;

        await configuration.save();
        results.push({ key: configUpdate.key, success: true });
      } catch (error) {
        errors.push({ key: configUpdate.key, error: error.message });
      }
    }

    res.json({
      message: `Bulk update completed. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Server error while bulk updating configurations' });
  }
});

// @route   POST /api/configurations/reset/:key
// @desc    Reset configuration to default value
// @access  Private (Admin)
router.post('/reset/:key', [auth, authorize('admin')], async (req, res) => {
  try {
    const configuration = await Configuration.findOne({ key: req.params.key });
    if (!configuration) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    if (!configuration.defaultValue) {
      return res.status(400).json({ message: 'No default value available for this configuration' });
    }

    configuration.value = configuration.defaultValue;
    configuration.lastModifiedBy = req.user._id;
    configuration.version += 1;

    await configuration.save();

    res.json({
      message: 'Configuration reset to default value successfully',
      configuration
    });
  } catch (error) {
    console.error('Reset configuration error:', error);
    res.status(500).json({ message: 'Server error while resetting configuration' });
  }
});

// @route   GET /api/configurations/export
// @desc    Export configurations
// @access  Private (Admin)
router.get('/export', [auth, authorize('admin')], async (req, res) => {
  try {
    const { category, format = 'json' } = req.query;
    
    const filter = {};
    if (category) filter.category = category;

    const configurations = await Configuration.find(filter)
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ category: 1, key: 1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csv = configurations.map(config => ({
        key: config.key,
        value: typeof config.value === 'object' ? JSON.stringify(config.value) : config.value,
        type: config.type,
        category: config.category,
        description: config.description,
        isPublic: config.isPublic,
        isEditable: config.isEditable,
        lastModifiedBy: config.lastModifiedBy ? `${config.lastModifiedBy.firstName} ${config.lastModifiedBy.lastName}` : '',
        updatedAt: config.updatedAt
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=configurations.csv');
      res.json(csv);
    } else {
      res.json({
        exportedAt: new Date(),
        count: configurations.length,
        configurations
      });
    }
  } catch (error) {
    console.error('Export configurations error:', error);
    res.status(500).json({ message: 'Server error while exporting configurations' });
  }
});

module.exports = router;