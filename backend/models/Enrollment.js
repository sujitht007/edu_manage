const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'dropped', 'suspended'],
    default: 'enrolled'
  },
  finalGrade: {
    letterGrade: String,
    percentage: Number,
    gpa: Number,
    isFinalized: {
      type: Boolean,
      default: false
    }
  },
  attendance: {
    totalClasses: {
      type: Number,
      default: 0
    },
    attendedClasses: {
      type: Number,
      default: 0
    },
    attendancePercentage: {
      type: Number,
      default: 0
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  completionDate: Date
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Indexes for queries
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });

// Calculate attendance percentage before saving
enrollmentSchema.pre('save', function(next) {
  if (this.attendance.totalClasses > 0) {
    this.attendance.attendancePercentage = 
      (this.attendance.attendedClasses / this.attendance.totalClasses) * 100;
  }
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
