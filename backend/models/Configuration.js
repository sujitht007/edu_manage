const mongoose = require('mongoose');

const ConfigurationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['string', 'number', 'boolean', 'array', 'object', 'json'],
    default: 'string'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'system',
      'course',
      'user',
      'assignment',
      'attendance',
      'notification',
      'email',
      'file_upload',
      'security',
      'ui',
      'analytics'
    ],
    default: 'system'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    options: [String],
    required: {
      type: Boolean,
      default: true
    }
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
ConfigurationSchema.index({ category: 1, isPublic: 1 });
ConfigurationSchema.index({ key: 1, category: 1 });

// Virtual for formatted value based on type
ConfigurationSchema.virtual('formattedValue').get(function() {
  switch (this.type) {
    case 'json':
      return typeof this.value === 'string' ? JSON.parse(this.value) : this.value;
    case 'array':
      return Array.isArray(this.value) ? this.value : [];
    case 'number':
      return Number(this.value);
    case 'boolean':
      return Boolean(this.value);
    default:
      return String(this.value);
  }
});

// Method to validate value based on validation rules
ConfigurationSchema.methods.validateValue = function(value) {
  const validation = this.validation;
  if (!validation) return { isValid: true };

  const errors = [];

  // Required validation
  if (validation.required && (value === null || value === undefined || value === '')) {
    errors.push('This field is required');
  }

  // Type-specific validation
  if (this.type === 'number') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      errors.push('Value must be a valid number');
    } else {
      if (validation.min !== undefined && numValue < validation.min) {
        errors.push(`Value must be at least ${validation.min}`);
      }
      if (validation.max !== undefined && numValue > validation.max) {
        errors.push(`Value must be at most ${validation.max}`);
      }
    }
  }

  if (this.type === 'string') {
    const strValue = String(value);
    if (validation.min !== undefined && strValue.length < validation.min) {
      errors.push(`Value must be at least ${validation.min} characters`);
    }
    if (validation.max !== undefined && strValue.length > validation.max) {
      errors.push(`Value must be at most ${validation.max} characters`);
    }
    if (validation.pattern && !new RegExp(validation.pattern).test(strValue)) {
      errors.push('Value does not match required pattern');
    }
  }

  if (this.type === 'array' && validation.options) {
    if (!Array.isArray(value)) {
      errors.push('Value must be an array');
    } else {
      const invalidOptions = value.filter(v => !validation.options.includes(v));
      if (invalidOptions.length > 0) {
        errors.push(`Invalid options: ${invalidOptions.join(', ')}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static method to get configuration by category
ConfigurationSchema.statics.getByCategory = function(category, includePrivate = false) {
  const filter = { category };
  if (!includePrivate) {
    filter.isPublic = true;
  }
  return this.find(filter).sort({ key: 1 });
};

// Static method to get configuration value by key
ConfigurationSchema.statics.getValue = async function(key, defaultValue = null) {
  const config = await this.findOne({ key });
  return config ? config.formattedValue : defaultValue;
};

// Static method to set configuration value
ConfigurationSchema.statics.setValue = async function(key, value, userId, options = {}) {
  const config = await this.findOne({ key });
  
  if (config) {
    // Validate value
    const validation = config.validateValue(value);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    config.value = value;
    config.lastModifiedBy = userId;
    config.version += 1;
    
    if (options.description) config.description = options.description;
    if (options.tags) config.tags = options.tags;
    
    return await config.save();
  } else {
    throw new Error(`Configuration key '${key}' not found`);
  }
};

// Pre-save middleware to validate value
ConfigurationSchema.pre('save', function(next) {
  if (this.isModified('value')) {
    const validation = this.validateValue(this.value);
    if (!validation.isValid) {
      return next(new Error(`Validation failed: ${validation.errors.join(', ')}`));
    }
  }
  next();
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);