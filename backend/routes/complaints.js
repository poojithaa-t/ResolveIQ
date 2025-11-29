const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const axios = require('axios');
const Complaint = require('../models/Complaint');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Function to analyze sentiment using AI module
const analyzeSentiment = async (text) => {
  try {
    const response = await axios.post(`${process.env.AI_MODULE_URL}/analyze`, {
      text: text
    });
    return response.data;
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      priority: 'medium',
      urgencyKeywords: []
    };
  }
};

// @route   POST /api/complaints
// @desc    Submit a new complaint
// @access  Private
router.post('/', authMiddleware, upload.array('attachments', 5), [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('category').isIn(['hostel', 'academic', 'infrastructure', 'food', 'transport', 'wifi', 'other']).withMessage('Invalid category'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category } = req.body;

    // Analyze sentiment and determine priority
    const sentimentAnalysis = await analyzeSentiment(`${title} ${description}`);

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype
    })) : [];

    // Create complaint
    const complaint = new Complaint({
      title,
      description,
      category,
      priority: sentimentAnalysis.priority || 'medium',
      submittedBy: req.user._id,
      attachments,
      sentimentAnalysis: {
        sentiment: sentimentAnalysis.sentiment,
        confidence: sentimentAnalysis.confidence,
        urgencyKeywords: sentimentAnalysis.urgencyKeywords || []
      }
    });

    await complaint.save();

    // Populate submittedBy field for response
    await complaint.populate('submittedBy', 'name email');

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ message: 'Server error while submitting complaint' });
  }
});

// @route   GET /api/complaints
// @desc    Get user's complaints
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    const filter = { submittedBy: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email')
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
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error while fetching complaints' });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get complaint by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.addedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user owns the complaint or is admin
    if (complaint.submittedBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error while fetching complaint' });
  }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint (user can only update their own complaints)
// @access  Private
router.put('/:id', authMiddleware, [
  body('title').optional().notEmpty().trim().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().trim().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['hostel', 'academic', 'infrastructure', 'food', 'transport', 'wifi', 'other']).withMessage('Invalid category'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user owns the complaint
    if (complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updates if complaint is still pending
    if (complaint.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update complaint once it is being processed' });
    }

    const { title, description, category } = req.body;
    
    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (category) complaint.category = category;

    // Re-analyze sentiment if text is updated
    if (title || description) {
      const sentimentAnalysis = await analyzeSentiment(`${complaint.title} ${complaint.description}`);
      complaint.priority = sentimentAnalysis.priority || 'medium';
      complaint.sentimentAnalysis = {
        sentiment: sentimentAnalysis.sentiment,
        confidence: sentimentAnalysis.confidence,
        urgencyKeywords: sentimentAnalysis.urgencyKeywords || []
      };
    }

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Server error while updating complaint' });
  }
});

module.exports = router;