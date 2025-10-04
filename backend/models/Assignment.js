const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  type: {
    type: String,
    enum: ['homework', 'quiz', 'exam', 'project', 'presentation'],
    required: [true, 'Assignment type is required']
  },
  totalPoints: {
    type: Number,
    required: [true, 'Total points are required'],
    min: [1, 'Total points must be at least 1']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value && value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  allowLateSubmission: {
    type: Boolean,
    default: true
  },
  latePenalty: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

assignmentSchema.index({ course: 1 });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isPublished: 1 });

// Virtual to check if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return this.dueDate ? new Date() > this.dueDate : false;
});

// Virtual to get formatted due date
assignmentSchema.virtual('formattedDueDate').get(function() {
  return this.dueDate ? this.dueDate.toISOString().split('T')[0] : '';
});

// Virtual to get time until due
assignmentSchema.virtual('timeUntilDue').get(function() {
  if (!this.dueDate) return 'No due date';
  
  const now = new Date();
  const diffTime = this.dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else {
    return `${diffDays} days remaining`;
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
