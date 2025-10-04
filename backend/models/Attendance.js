const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true
    },
    markedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

attendanceSchema.index({ course: 1, date: 1 }, { unique: true });
attendanceSchema.index({ course: 1 });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
