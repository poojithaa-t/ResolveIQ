const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['hostel', 'academic', 'infrastructure', 'food', 'transport', 'wifi', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  sentimentAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    confidence: Number,
    urgencyKeywords: [String]
  },
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: Date,
  estimatedResolutionTime: Date
}, {
  timestamps: true
});

// Index for better query performance
complaintSchema.index({ submittedBy: 1, status: 1 });
complaintSchema.index({ category: 1, priority: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);