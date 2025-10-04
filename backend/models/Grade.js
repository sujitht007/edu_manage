const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
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
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W'],
    default: 'I'
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0,
    default: 0
  },
  isFinalized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

gradeSchema.index({ student: 1, course: 1 }, { unique: true });

// Calculate letter grade and GPA before saving
gradeSchema.pre('save', function(next) {
  if (this.percentage !== undefined) {
    // Calculate letter grade
    if (this.percentage >= 97) this.letterGrade = 'A+';
    else if (this.percentage >= 93) this.letterGrade = 'A';
    else if (this.percentage >= 90) this.letterGrade = 'A-';
    else if (this.percentage >= 87) this.letterGrade = 'B+';
    else if (this.percentage >= 83) this.letterGrade = 'B';
    else if (this.percentage >= 80) this.letterGrade = 'B-';
    else if (this.percentage >= 77) this.letterGrade = 'C+';
    else if (this.percentage >= 73) this.letterGrade = 'C';
    else if (this.percentage >= 70) this.letterGrade = 'C-';
    else if (this.percentage >= 67) this.letterGrade = 'D+';
    else if (this.percentage >= 60) this.letterGrade = 'D';
    else this.letterGrade = 'F';

    // Calculate GPA
    if (this.percentage >= 97) this.gpa = 4.0;
    else if (this.percentage >= 93) this.gpa = 4.0;
    else if (this.percentage >= 90) this.gpa = 3.7;
    else if (this.percentage >= 87) this.gpa = 3.3;
    else if (this.percentage >= 83) this.gpa = 3.0;
    else if (this.percentage >= 80) this.gpa = 2.7;
    else if (this.percentage >= 77) this.gpa = 2.3;
    else if (this.percentage >= 73) this.gpa = 2.0;
    else if (this.percentage >= 70) this.gpa = 1.7;
    else if (this.percentage >= 67) this.gpa = 1.3;
    else if (this.percentage >= 60) this.gpa = 1.0;
    else this.gpa = 0.0;
  }
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
