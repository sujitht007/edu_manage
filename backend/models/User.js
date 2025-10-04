const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  profileImage: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // Add instructor qualification fields
  instructorProfile: {
    qualification: {
      type: String,
      required: function() { return this.role === 'instructor'; }
    },
    experience: {
      type: Number, // years of experience
      min: 0
    },
    specialization: [String], // areas of expertise
    bio: {
      type: String,
      maxlength: 1000
    },
    documents: [{
      type: {
        type: String,
        enum: ['degree_certificate', 'teaching_certificate', 'id_proof', 'experience_letter', 'other'],
        required: true
      },
      originalName: String,
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadDate: {
        type: Date,
        default: Date.now
      },
      verified: {
        type: Boolean,
        default: false
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date,
      comments: String
    }],
    documentsUploaded: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending'
    },
    verificationComments: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    linkedIn: String,
    portfolio: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role === 'student';
    }
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  feeStatus: {
    totalFees: {
      type: Number,
      default: 0
    },
    paidFees: {
      type: Number,
      default: 0
    },
    pendingFees: {
      type: Number,
      default: 0
    },
    lastPaymentDate: Date
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
