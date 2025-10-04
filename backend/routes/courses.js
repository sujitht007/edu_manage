const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { auth, authorize, checkApproval } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim(),
  query('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object - Remove isApproved requirement for now
    let filter = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.level) {
      filter.level = req.query.level;
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { courseCode: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get courses with pagination
    const courses = await Course.find(filter)
      .populate('instructor', 'firstName lastName email')
      .select('-materials')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    console.log(`Found ${courses.length} courses out of ${total} total`); // Debug log

    res.json({
      courses,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email profileImage');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(500).json({ message: 'Server error while fetching course' });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Instructor only)
router.post('/', [
  auth,
  authorize('instructor', 'admin'), // Allow both instructors and admins to create courses
  checkApproval,
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('description').trim().notEmpty().withMessage('Course description is required'),
  body('courseCode').trim().notEmpty().withMessage('Course code is required'),
  body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
  body('maxStudents').isInt({ min: 1 }).withMessage('Maximum students must be at least 1'),
  body('fees').isFloat({ min: 0 }).withMessage('Fees must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
  body('instructor').optional().isMongoId().withMessage('Invalid instructor ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({
      courseCode: req.body.courseCode.toUpperCase()
    });

    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    // If instructor is specified (admin creating course for another instructor), validate it
    if (req.body.instructor && req.user.role === 'admin') {
      const User = require('../models/User');
      const instructor = await User.findById(req.body.instructor);
      if (!instructor || instructor.role !== 'instructor' || !instructor.isApproved) {
        return res.status(400).json({ message: 'Invalid or unapproved instructor specified' });
      }
    }

    // Create course
    const courseData = {
      ...req.body,
      instructor: req.body.instructor || req.user._id, // Allow admin to specify instructor
      courseCode: req.body.courseCode.toUpperCase(),
      isApproved: req.user.role === 'admin' ? true : false // Auto-approve if created by admin
    };

    const course = new Course(courseData);
    await course.save();

    await course.populate('instructor', 'firstName lastName email');

    res.status(201).json({
      message: 'Course created successfully. Pending admin approval.',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error while creating course' });
  }
});

// @route   GET /api/courses/instructor/:instructorId
// @desc    Get courses by instructor
// @access  Private
router.get('/instructor/:instructorId', auth, async (req, res) => {
  try {
    // Check if user is accessing their own courses or is admin
    if (req.user._id.toString() !== req.params.instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const courses = await Course.find({ 
      instructor: req.params.instructorId,
      isActive: true 
    })
    .populate('instructor', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ message: 'Server error while fetching instructor courses' });
  }
});

// @route   POST /api/courses/:id/material
// @desc    Add material to a course
// @access  Private
router.post('/:id/material', [
  auth, 
  authorize('instructor', 'admin'),
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['pdf', 'video', 'link', 'document', 'note']).withMessage('Invalid material type'),
  body('url').notEmpty().withMessage('URL is required'),
  body('isFree').optional().isBoolean().withMessage('isFree must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { title, type, url, filename, description, isFree = false } = req.body;

    // Find the course by ID
    let course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor of this course or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add materials to this course' });
    }

    // Add the new material to the course
    const material = {
      title,
      type,
      url,
      filename,
      description,
      isFree,
      uploadDate: new Date()
    };

    course.materials.push(material);

    // Save the updated course
    await course.save();

    res.json({
      message: 'Material added successfully',
      material: course.materials[course.materials.length - 1]
    });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ message: 'Server error while adding material' });
  }
});

// @route   PUT /api/courses/:id/material/:materialId
// @desc    Update a course material
// @access  Private
router.put('/:id/material/:materialId', [
  auth, 
  authorize('instructor', 'admin'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('type').optional().isIn(['pdf', 'video', 'link', 'document', 'note']).withMessage('Invalid material type'),
  body('url').optional().notEmpty().withMessage('URL cannot be empty'),
  body('isFree').optional().isBoolean().withMessage('isFree must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { id, materialId } = req.params;
    const updates = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor of this course or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update materials in this course' });
    }

    const material = course.materials.id(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Update material fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        material[key] = updates[key];
      }
    });

    await course.save();

    res.json({
      message: 'Material updated successfully',
      material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ message: 'Server error while updating material' });
  }
});

// @route   DELETE /api/courses/:id/material/:materialId
// @desc    Delete a course material
// @access  Private
router.delete('/:id/material/:materialId', [auth, authorize('instructor', 'admin')], async (req, res) => {
  try {
    const { id, materialId } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor of this course or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete materials from this course' });
    }

    const material = course.materials.id(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    course.materials.pull(materialId);
    await course.save();

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: 'Server error while deleting material' });
  }
});

// @route   PUT /api/courses/:id/approve
// @desc    Approve a course
// @access  Private (Admin only)
router.put('/:id/approve', [auth, authorize('admin')], async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('instructor', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: 'Course approved successfully',
      course
    });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({ message: 'Server error while approving course' });
  }
});

// @route   GET /api/courses/pending
// @desc    Get pending courses for approval
// @access  Private (Admin only)
router.get('/pending', [auth, authorize('admin')], async (req, res) => {
  try {
    const pendingCourses = await Course.find({ 
      isApproved: false,
      isActive: true 
    })
    .populate('instructor', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(pendingCourses);
  } catch (error) {
    console.error('Get pending courses error:', error);
    res.status(500).json({ message: 'Server error while fetching pending courses' });
  }
});

// @route   GET /api/courses/:id/performance
// @desc    Get course performance metrics
// @access  Private (Instructor, Admin)
router.get('/:id/performance', [auth, authorize('instructor', 'admin')], async (req, res) => {
  try {
    const courseId = req.params.id;
    const Assignment = require('../models/Assignment');
    const Submission = require('../models/Submission');
    const Grade = require('../models/Grade');
    
    // Verify course exists and user has access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is instructor of this course or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all enrollments for this course
    const enrollments = await Enrollment.find({ 
      course: courseId, 
      status: 'enrolled' 
    }).populate('student', 'firstName lastName');

    const totalStudents = enrollments.length;
    
    // Get all assignments for this course
    const assignments = await Assignment.find({ 
      course: courseId, 
      isPublished: true 
    });
    
    const totalAssignments = assignments.length;

    // Get all submissions for this course
    const submissions = await Submission.find({
      assignment: { $in: assignments.map(a => a._id) }
    }).populate([
      { path: 'assignment', select: 'title totalPoints' },
      { path: 'student', select: 'firstName lastName' }
    ]);

    // Get all grades for this course
    const grades = await Grade.find({ course: courseId });

    // Calculate completion rate (students who completed at least 80% of assignments)
    let completionRate = 0;
    if (totalStudents > 0 && totalAssignments > 0) {
      const studentCompletions = {};
      
      // Count submissions per student
      submissions.forEach(submission => {
        const studentId = submission.student._id.toString();
        if (!studentCompletions[studentId]) {
          studentCompletions[studentId] = 0;
        }
        studentCompletions[studentId]++;
      });
      
      // Count students who completed at least 80% of assignments
      const studentsWithGoodCompletion = Object.values(studentCompletions)
        .filter(count => count >= (totalAssignments * 0.8)).length;
      
      completionRate = (studentsWithGoodCompletion / totalStudents) * 100;
    }

    // Calculate submission rate (percentage of assignments submitted vs total possible)
    let submissionRate = 0;
    if (totalStudents > 0 && totalAssignments > 0) {
      const totalPossibleSubmissions = totalStudents * totalAssignments;
      submissionRate = (submissions.length / totalPossibleSubmissions) * 100;
    }

    // Calculate average grade (student satisfaction proxy)
    let averageGrade = 0;
    let averageSatisfaction = 0;
    if (grades.length > 0) {
      const totalPercentage = grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0);
      averageGrade = totalPercentage / grades.length;
      
      // Convert grade to satisfaction score (70-100% maps to 3.0-5.0 satisfaction)
      if (averageGrade >= 70) {
        averageSatisfaction = 3.0 + ((averageGrade - 70) / 30) * 2.0;
      } else {
        averageSatisfaction = (averageGrade / 70) * 3.0;
      }
      averageSatisfaction = Math.min(5.0, Math.max(1.0, averageSatisfaction));
    }

    // Calculate assignment statistics
    const assignmentStats = assignments.map(assignment => {
      const assignmentSubmissions = submissions.filter(s => 
        s.assignment._id.toString() === assignment._id.toString()
      );
      
      return {
        assignmentId: assignment._id,
        title: assignment.title,
        totalSubmissions: assignmentSubmissions.length,
        submissionRate: totalStudents > 0 ? (assignmentSubmissions.length / totalStudents) * 100 : 0,
        averageGrade: assignmentSubmissions.length > 0 
          ? assignmentSubmissions.reduce((sum, s) => sum + (s.grade?.percentage || 0), 0) / assignmentSubmissions.length
          : 0
      };
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSubmissions = submissions.filter(s => 
      new Date(s.submittedAt) >= sevenDaysAgo
    ).length;

    const performanceData = {
      courseId,
      courseTitle: course.title,
      totalStudents,
      totalAssignments,
      totalSubmissions: submissions.length,
      
      // Key metrics
      completionRate: Math.round(completionRate * 100) / 100,
      submissionRate: Math.round(submissionRate * 100) / 100,
      averageGrade: Math.round(averageGrade * 100) / 100,
      averageSatisfaction: Math.round(averageSatisfaction * 100) / 100,
      
      // Detailed stats
      assignmentStats,
      recentActivity: {
        recentSubmissions,
        newEnrollments: enrollments.filter(e => 
          new Date(e.enrollmentDate) >= sevenDaysAgo
        ).length
      },
      
      // Grade distribution
      gradeDistribution: {
        'A': grades.filter(g => g.letterGrade && g.letterGrade.startsWith('A')).length,
        'B': grades.filter(g => g.letterGrade && g.letterGrade.startsWith('B')).length,
        'C': grades.filter(g => g.letterGrade && g.letterGrade.startsWith('C')).length,
        'D': grades.filter(g => g.letterGrade && g.letterGrade.startsWith('D')).length,
        'F': grades.filter(g => g.letterGrade === 'F').length
      }
    };

    res.json(performanceData);
  } catch (error) {
    console.error('Get course performance error:', error);
    res.status(500).json({ message: 'Server error while fetching course performance' });
  }
});

module.exports = router;