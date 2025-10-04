const express = require('express');
const { body, validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/submissions
// @desc    Create a new submission
// @access  Private (Student only)
router.post('/', [auth, authorize('student')], async (req, res) => {
  try {
    const { assignmentId, submissionText } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Submission already exists' });
    }

    // Check if assignment is overdue
    const isLate = assignment.dueDate ? new Date() > new Date(assignment.dueDate) : false;

    const submission = new Submission({
      assignment: assignmentId,
      student: req.user._id,
      submissionText,
      isLate
    });

    await submission.save();

    res.status(201).json({
      message: 'Submission created successfully',
      submission
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Server error while creating submission' });
  }
});

// @route   GET /api/submissions/assignment/:assignmentId/student/:studentId
// @desc    Get submission for specific assignment and student
// @access  Private
router.get('/assignment/:assignmentId/student/:studentId', auth, async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    // Students can only view their own submissions
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    }).populate('assignment', 'title totalPoints')
      .populate('student', 'firstName lastName email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error while fetching submission' });
  }
});

// @route   POST /api/submissions/submit
// @desc    Submit an assignment
// @access  Private (Student only)
router.post('/submit', [
  auth,
  authorize('student'),
  body('assignmentId').not().isEmpty().withMessage('Assignment ID is required'),
  body('points').isFloat({ min: 0 }).withMessage('Points must be a positive number'),
  body('feedback').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { assignmentId, points, feedback, rubricScores } = req.body;

    const submission = new Submission({
      assignment: assignmentId,
      student: req.user._id,
      points,
      feedback,
      rubricScores,
      submittedAt: new Date(),
      status: 'submitted'
    });

    await submission.save();

    // Populate assignment and student details
    await submission.populate([
      { path: 'assignment', select: 'title dueDate totalPoints' },
      { path: 'student', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error while submitting assignment' });
  }
});

// @route   GET /api/submissions/assignment/:assignmentId
// @desc    Get all submissions for an assignment
// @access  Private (Instructor only)
router.get('/assignment/:assignmentId', [auth, authorize('instructor', 'admin')], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'firstName lastName email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error while fetching submissions' });
  }
});

// @route   PUT /api/submissions/:id/grade
// @desc    Grade a submission
// @access  Private (Instructor only)
router.put('/:id/grade', [
  auth,
  authorize('instructor', 'admin'),
  body('points').isFloat({ min: 0 }).withMessage('Points must be a positive number'),
  body('feedback').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const submission = await Submission.findById(req.params.id)
      .populate('assignment');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if instructor owns this assignment
    if (req.user.role !== 'admin' && submission.assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { points, feedback, rubricScores } = req.body;
    const percentage = (points / submission.assignment.totalPoints) * 100;

    submission.grade = {
      points,
      percentage,
      letterGrade: getLetterGrade(percentage),
      gradedAt: new Date(),
      gradedBy: req.user._id
    };
    submission.feedback = feedback;
    submission.status = 'graded';
    if (rubricScores) submission.rubricScores = rubricScores;

    await submission.save();

    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error while grading submission' });
  }
});

// Helper function to convert percentage to letter grade
function getLetterGrade(percentage) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
}

module.exports = router;