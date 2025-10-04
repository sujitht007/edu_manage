const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  submissionText: {
    type: String,
    maxlength: [5000, 'Submission text cannot exceed 5000 characters']
  },
  attachments: [{
    originalName: String,
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'resubmitted'],
    default: 'submitted'
  },
  grade: {
    points: {
      type: Number,
      min: 0
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I']
    },
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1 });
submissionSchema.index({ assignment: 1 });
submissionSchema.index({ status: 1 });

// Calculate letter grade based on percentage
submissionSchema.pre('save', function(next) {
  if (this.grade && this.grade.percentage !== undefined) {
    const percentage = this.grade.percentage;
    if (percentage >= 97) this.grade.letterGrade = 'A+';
    else if (percentage >= 93) this.grade.letterGrade = 'A';
    else if (percentage >= 90) this.grade.letterGrade = 'A-';
    else if (percentage >= 87) this.grade.letterGrade = 'B+';
    else if (percentage >= 83) this.grade.letterGrade = 'B';
    else if (percentage >= 80) this.grade.letterGrade = 'B-';
    else if (percentage >= 77) this.grade.letterGrade = 'C+';
    else if (percentage >= 73) this.grade.letterGrade = 'C';
    else if (percentage >= 70) this.grade.letterGrade = 'C-';
    else if (percentage >= 67) this.grade.letterGrade = 'D+';
    else if (percentage >= 60) this.grade.letterGrade = 'D';
    else this.grade.letterGrade = 'F';
  }
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);
