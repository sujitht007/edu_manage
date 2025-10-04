const express = require('express');
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { auth, authorize, checkApproval } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get assignments for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let assignments;
    
    if (req.user.role === 'student') {
      // Get assignments from enrolled courses
      const Enrollment = require('../models/Enrollment'); // Fixed: Move require inside function
      const enrollments = await Enrollment.find({ 
        student: req.user._id,
        status: 'enrolled'
      }).populate('course');
      
      const courseIds = enrollments.map(enrollment => enrollment.course._id);
      
      assignments = await Assignment.find({
        course: { $in: courseIds },
        isPublished: true
      })
      .populate('course', 'title courseCode')
      .populate('instructor', 'firstName lastName')
      .sort({ dueDate: 1 });
    } else {
      // Instructors get their own assignments
      assignments = await Assignment.find({ instructor: req.user._id })
        .populate('course', 'title courseCode')
        .sort({ dueDate: 1 });
    }

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error while fetching assignments' });
  }
});

// @route   POST /api/assignments
// @desc    Create a new assignment
// @access  Private (Instructor only)
router.post('/', [
  auth,
  authorize('instructor', 'admin'),
  checkApproval,
  body('title').trim().notEmpty().withMessage('Assignment title is required'),
  body('description').trim().notEmpty().withMessage('Assignment description is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('type').isIn(['homework', 'quiz', 'exam', 'project', 'presentation']).withMessage('Invalid assignment type'),
  body('totalPoints').isInt({ min: 1 }).withMessage('Total points must be at least 1'),
  body('dueDate').isISO8601().withMessage('Valid due date is required').custom((value) => {
    const dueDate = new Date(value);
    if (isNaN(dueDate.getTime())) {
      throw new Error('Invalid date format');
    }
    const now = new Date();
    if (dueDate <= now) {
      throw new Error('Due date must be in the future');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { title, description, courseId, type, totalPoints, dueDate, isPublished, allowLateSubmission, latePenalty } = req.body;

    // Verify course exists and instructor owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role !== 'instructor' || course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
    }

    // Ensure dueDate is properly formatted and valid
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ message: 'Invalid due date format' });
    }

    console.log('Creating assignment with due date:', parsedDueDate.toISOString()); // Debug log

    const assignment = new Assignment({
      title,
      description,
      course: courseId,
      instructor: req.user._id,
      type,
      totalPoints,
      dueDate: parsedDueDate,
      isPublished: isPublished || false,
      allowLateSubmission: allowLateSubmission !== undefined ? allowLateSubmission : true,
      latePenalty: latePenalty || 0
    });

    await assignment.save();

    await assignment.populate([
      { path: 'course', select: 'title courseCode' },
      { path: 'instructor', select: 'firstName lastName' }
    ]);

    // If assignment is published, notify enrolled students
    if (isPublished) {
      const Enrollment = require('../models/Enrollment');
      const Notification = require('../models/Notification');
      
      const enrolledStudents = await Enrollment.find({
        course: courseId,
        status: 'enrolled'
      }).populate('student');

      // Create notifications for all enrolled students
      const notificationPromises = enrolledStudents.map(enrollment => 
        Notification.createNotification({
          recipient: enrollment.student._id,
          title: 'New Assignment Available',
          message: `A new assignment "${title}" has been posted in ${course.title}. Due: ${parsedDueDate.toLocaleDateString()}`,
          type: 'assignment',
          targetId: assignment._id,
          targetUrl: `/assignments/${assignment._id}`,
          actionRequired: true
        })
      );

      await Promise.all(notificationPromises);
    }

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error while creating assignment' });
  }
});

// @route   GET /api/assignments/course/:courseId
// @desc    Get assignments for a course
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      course: req.params.courseId,
      isPublished: true
    })
    .populate('instructor', 'firstName lastName')
    .sort({ dueDate: 1 });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error while fetching assignments' });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get single assignment
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title courseCode')
      .populate('instructor', 'firstName lastName');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error while fetching assignment' });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Instructor only)
router.put('/:id', [
  auth,
  authorize('instructor', 'admin'),
  checkApproval
], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if instructor owns this assignment
    if (req.user.role !== 'admin' && assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'course', select: 'title courseCode' },
      { path: 'instructor', select: 'firstName lastName' }
    ]);

    res.json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error while updating assignment' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Instructor only)
router.delete('/:id', [
  auth,
  authorize('instructor', 'admin'),
  checkApproval
], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if instructor owns this assignment
    if (req.user.role !== 'admin' && assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error while deleting assignment' });
  }
});

module.exports = router;
