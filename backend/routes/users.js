const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to get document type labels
const getDocumentTypeLabel = (type) => {
  const labels = {
    degree_certificate: 'Degree Certificate',
    teaching_certificate: 'Teaching Certificate',
    id_proof: 'ID Proof',
    experience_letter: 'Experience Letter',
    other: 'Other Document'
  };
  return labels[type] || type;
};

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', [auth, authorize('admin')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;

    let filter = {};
    if (role && ['student', 'instructor', 'admin'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/users/:id/approve
// @desc    Approve user account
// @access  Private (Admin)
router.put('/:id/approve', [auth, authorize('admin')], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create approval notification for the user
    const Notification = require('../models/Notification');
    await Notification.createNotification({
      recipient: user._id,
      title: 'Account Approved',
      message: `Your ${user.role} account has been approved by an administrator. You can now access all features.`,
      type: 'user_approved',
      targetUrl: '/dashboard',
      actionRequired: false
    });

    res.json({
      message: 'User approved successfully',
      user
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error while approving user' });
  }
});

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user account
// @access  Private (Admin)
router.put('/:id/deactivate', [auth, authorize('admin')], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error while deactivating user' });
  }
});

// @route   GET /api/users/pending-approval
// @desc    Get users pending approval
// @access  Private (Admin)
router.get('/pending-approval', [auth, authorize('admin')], async (req, res) => {
  try {
    const pendingUsers = await User.find({
      isApproved: false,
      role: { $ne: 'student' },
      isActive: true
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ message: 'Server error while fetching pending users' });
  }
});

// @route   GET /api/users/:id/profile
// @desc    Get detailed user profile for admin review
// @access  Private (Admin only)
router.get('/:id/profile', [auth, authorize('admin')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
});

// @route   PUT /api/users/:id/verify-document
// @desc    Verify or reject instructor document
// @access  Private (Admin only)
router.put('/:id/verify-document/:documentId', [auth, authorize('admin')], async (req, res) => {
  try {
    const { verified, comments } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const document = user.instructorProfile.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.verified = verified;
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    document.comments = comments;

    await user.save();

    // Check if all documents are verified
    const allDocumentsVerified = user.instructorProfile.documents.every(doc => doc.verified);
    
    if (allDocumentsVerified && user.instructorProfile.documents.length > 0) {
      // Auto-approve user if all documents are verified
      user.isApproved = true;
      user.instructorProfile.verificationStatus = 'approved';
      await user.save();

      // Notify instructor of approval
      const Notification = require('../models/Notification');
      await Notification.createNotification({
        recipient: user._id,
        title: 'Documents Approved',
        message: 'Your instructor documents have been verified and your account is now approved. Welcome to the platform!',
        type: 'doc_verified',
        targetUrl: '/dashboard',
        actionRequired: false
      });
    } else if (!verified) {
      // If document was rejected, update verification status
      user.instructorProfile.verificationStatus = 'rejected';
      
      // Add overall verification comments if not already present
      if (comments && !user.instructorProfile.verificationComments) {
        user.instructorProfile.verificationComments = comments;
      }
      
      await user.save();

      // Notify instructor of rejection
      const Notification = require('../models/Notification');
      await Notification.createNotification({
        recipient: user._id,
        title: 'Document Rejected',
        message: `Your document "${getDocumentTypeLabel(document.type)}" was rejected. ${comments || 'Please upload a new document.'} Visit the document upload page to resubmit.`,
        type: 'doc_rejected',
        targetId: user._id,
        targetUrl: '/upload-documents',
        actionRequired: true
      });
    }

    res.json({
      message: `Document ${verified ? 'verified' : 'rejected'} successfully`,
      document,
      userApproved: allDocumentsVerified
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ message: 'Server error while verifying document' });
  }
});

// @route   GET /api/users/pending-verification
// @desc    Get instructors pending document verification
// @access  Private (Admin only)
router.get('/pending-verification', [auth, authorize('admin')], async (req, res) => {
  try {
    const pendingInstructors = await User.find({
      role: 'instructor',
      isActive: true,
      $or: [
        { isApproved: false },
        { 'instructorProfile.documents': { $elemMatch: { verified: false } } }
      ]
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(pendingInstructors);
  } catch (error) {
    console.error('Get pending verification error:', error);
    res.status(500).json({ message: 'Server error while fetching pending verifications' });
  }
});

// @route   PUT /api/users/reset-documents
// @desc    Reset document verification status for reupload
// @access  Private (Instructor only)
router.put('/reset-documents', [auth, authorize('instructor')], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset document verification status
    if (user.instructorProfile) {
      user.instructorProfile.documents = [];
      user.instructorProfile.documentsUploaded = false;
      user.instructorProfile.verificationStatus = 'pending';
      user.instructorProfile.verificationComments = '';
      user.isApproved = false;
      
      await user.save();
    }

    res.json({
      message: 'Document status reset successfully. You can now upload new documents.',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Reset documents error:', error);
    res.status(500).json({ message: 'Server error while resetting documents' });
  }
});

// @route   GET /api/users/instructors
// @desc    Get approved instructors (Admin and Instructor access)
// @access  Private (Admin, Instructor)
router.get('/instructors', [auth, authorize('admin', 'instructor')], async (req, res) => {
  try {
    const instructors = await User.find({ 
      role: 'instructor',
      isApproved: true,
      isActive: true
    })
    .select('-password')
    .sort({ firstName: 1, lastName: 1 });

    res.json({ instructors });
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ message: 'Server error while fetching instructors' });
  }
});

module.exports = router;
