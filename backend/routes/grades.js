const express = require('express');
const { body, validationResult } = require('express-validator');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, authorize, checkApproval } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/grades/student/:studentId
// @desc    Get grades for a student
// @access  Private
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    // Students can only view their own grades
    if (req.user.role === 'student' && req.params.studentId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const grades = await Grade.find({
      student: req.params.studentId
    })
    .populate('course', 'title courseCode credits')
    .populate('instructor', 'firstName lastName')
    .sort({ updatedAt: -1 });

    res.json(grades);
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({ message: 'Server error while fetching grades' });
  }
});

// @route   GET /api/grades/course/:courseId
// @desc    Get grades for a course
// @access  Private (Instructor/Admin)
router.get('/course/:courseId', [auth, authorize('instructor', 'admin')], async (req, res) => {
  try {
    const grades = await Grade.find({
      course: req.params.courseId
    })
    .populate('student', 'firstName lastName email')
    .populate('course', 'title courseCode')
    .sort({ 'student.lastName': 1 });

    res.json(grades);
  } catch (error) {
    console.error('Get course grades error:', error);
    res.status(500).json({ message: 'Server error while fetching course grades' });
  }
});

// @route   POST /api/grades
// @desc    Create or update a grade
// @access  Private (Instructor only for creation, Admin can update for verification)
router.post('/', [
  auth,
  authorize('instructor'), // Only instructors can create/update grades
  checkApproval,
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('percentage').isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { studentId, courseId, percentage, isFinalized = false } = req.body;

    // Check if grade already exists
    let grade = await Grade.findOne({
      student: studentId,
      course: courseId
    });

    const isNewGrade = !grade; // Fixed: Track if this is a new grade

    if (grade) {
      // Update existing grade
      grade.percentage = percentage;
      grade.isFinalized = isFinalized;
      grade.instructor = req.user._id;
    } else {
      // Create new grade
      grade = new Grade({
        student: studentId,
        course: courseId,
        percentage,
        isFinalized,
        instructor: req.user._id
      });
    }

    await grade.save();
    await grade.populate([
      { path: 'student', select: 'firstName lastName email' },
      { path: 'course', select: 'title courseCode credits' },
      { path: 'instructor', select: 'firstName lastName' }
    ]);

    // Create notification for grade update/creation
    try {
      const notificationTitle = isNewGrade ? 'New Grade Posted' : 'Grade Updated';
      const notificationMessage = isNewGrade 
        ? `Your grade for ${grade.course.title} has been posted: ${percentage}%`
        : `Your grade for ${grade.course.title} has been updated to: ${percentage}%`;

      await Notification.createNotification({
        recipient: studentId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'grade',
        targetId: grade._id,
        targetUrl: `/grades`
      });
    } catch (notifError) {
      console.error('Error creating grade notification:', notifError);
      // Don't fail the grade creation if notification fails
    }

    res.json({
      message: isNewGrade ? 'Grade created successfully' : 'Grade updated successfully', // Fixed: Use proper variable
      grade
    });
  } catch (error) {
    console.error('Create/update grade error:', error);
    res.status(500).json({ message: 'Server error while saving grade' });
  }
});

// @route   PUT /api/grades/:id/finalize
// @desc    Finalize a grade
// @access  Private (Instructor/Admin)
router.put('/:id/finalize', [auth, authorize('instructor', 'admin')], async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    grade.isFinalized = true;
    await grade.save();

    // Populate the grade to get course and student info for notification
    await grade.populate([
      { path: 'student', select: 'firstName lastName email' },
      { path: 'course', select: 'title courseCode credits' }
    ]);

    // Create notification for grade finalization
    try {
      await Notification.createNotification({
        recipient: grade.student._id,
        title: 'Grade Finalized',
        message: `Your grade for ${grade.course.title} has been finalized: ${grade.percentage}%`,
        type: 'grade',
        targetId: grade._id,
        targetUrl: `/grades`
      });
    } catch (notifError) {
      console.error('Error creating grade finalization notification:', notifError);
      // Don't fail the finalization if notification fails
    }

    res.json({
      message: 'Grade finalized successfully',
      grade
    });
  } catch (error) {
    console.error('Finalize grade error:', error);
    res.status(500).json({ message: 'Server error while finalizing grade' });
  }
});

// @route   PUT /api/grades/:id/verify
// @desc    Verify/approve a grade (Admin only)
// @access  Private (Admin only)
router.put('/:id/verify', [auth, authorize('admin')], async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    grade.isVerified = true;
    grade.verifiedBy = req.user._id;
    grade.verifiedAt = new Date();
    await grade.save();

    res.json({
      message: 'Grade verified successfully',
      grade
    });
  } catch (error) {
    console.error('Verify grade error:', error);
    res.status(500).json({ message: 'Server error while verifying grade' });
  }
});

module.exports = router;
