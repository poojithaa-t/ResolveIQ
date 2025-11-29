const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// @route   GET /api/admin/complaints
// @desc    Get all complaints with filters
// @access  Admin
router.get('/complaints', async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10, search } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email department')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(filter);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Admin get complaints error:', error);
    res.status(500).json({ message: 'Server error while fetching complaints' });
  }
});

// @route   PUT /api/admin/complaints/:id/status
// @desc    Update complaint status
// @access  Admin
router.put('/complaints/:id/status', [
  body('status').isIn(['pending', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, assignedTo, adminNote } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update complaint
    complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (status === 'resolved') complaint.resolvedAt = new Date();

    // Add admin note if provided
    if (adminNote) {
      complaint.adminNotes.push({
        note: adminNote,
        addedBy: req.user._id,
        addedAt: new Date()
      });
    }

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');
    await complaint.populate('assignedTo', 'name email');

    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Server error while updating complaint status' });
  }
});

// @route   POST /api/admin/complaints/:id/notes
// @desc    Add admin note to complaint
// @access  Admin
router.post('/complaints/:id/notes', [
  body('note').notEmpty().trim().withMessage('Note is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { note } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.adminNotes.push({
      note,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await complaint.save();
    await complaint.populate('adminNotes.addedBy', 'name email');

    res.json({
      message: 'Admin note added successfully',
      adminNotes: complaint.adminNotes
    });
  } catch (error) {
    console.error('Add admin note error:', error);
    res.status(500).json({ message: 'Server error while adding admin note' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data for dashboard
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    // Get total counts
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });

    // Get complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get complaints by priority
    const complaintsByPriority = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly complaint trends
    const monthlyTrends = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $limit: 12
      }
    ]);

    // Calculate average resolution time for resolved complaints
    const resolvedComplaintsWithTime = await Complaint.aggregate([
      {
        $match: { status: 'resolved', resolvedAt: { $exists: true } }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    const avgResolutionTime = resolvedComplaintsWithTime.length > 0 
      ? Math.round(resolvedComplaintsWithTime[0].avgResolutionTime * 10) / 10 
      : 0;

    res.json({
      summary: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        avgResolutionTime
      },
      charts: {
        category: complaintsByCategory,
        priority: complaintsByPriority,
        status: complaintsByStatus,
        monthlyTrends
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put('/users/:id/role', [
  body('role').isIn(['user', 'admin']).withMessage('Invalid role'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
});

module.exports = router;